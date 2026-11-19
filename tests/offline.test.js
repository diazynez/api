"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const source = fs.readFileSync(require.resolve("../sw.js"), "utf8");
const scope = "https://example.test/api/";

function worker() {
    const handlers = {}, stored = new Map();
    let online = true, claimed = false;
    let stalled = false;
    const pending = [];
    function response(url) {
        if (url.startsWith(scope)) {
            const file = path.resolve(__dirname, "..", url.slice(scope.length) || "index.html");
            if (!fs.existsSync(file)) return new Response("missing", { status: 404 });
            if (url.endsWith("_sidebar.md")) return new Response(fs.readFileSync(file, "utf8"));
        }
        return new Response("resource:" + url);
    }
    const cache = {
        async addAll(urls) { for (const url of urls) stored.set(url, response(url)); },
        async match(url) { const value = stored.get(url); return value && value.clone(); },
        async put(url, value) { stored.set(url, value); }
    };
    const context = {
        URL, Response,
        caches: { open: async () => cache },
        fetch: async request => {
            if (!online) throw new Error("offline");
            const url = typeof request === "string" ? request : request.url;
            if (stalled) return new Promise(resolve => pending.push(() => resolve(response(url))));
            return response(url);
        },
        self: {
            registration: { scope }, location: { origin: "https://example.test" },
            addEventListener: (name, handler) => { handlers[name] = handler; },
            skipWaiting: async () => {}, clients: { claim: async () => { claimed = true; } }
        }
    };
    vm.runInNewContext(source, context);
    function dispatch(name, request) {
        const work = []; let result;
        handlers[name]({ request, waitUntil: p => work.push(p), respondWith: p => { result = p; } });
        return { response: Promise.resolve(result), finished: () => Promise.all(work) };
    }
    async function run(name, request) {
        const job = dispatch(name, request);
        const value = await job.response;
        await job.finished();
        return value;
    }
    return {
        run, dispatch, stored, offline() { online = false; }, claimed: () => claimed,
        stall() { stalled = true; },
        resume() { stalled = false; pending.splice(0).forEach(resolve => resolve()); }
    };
}

test("install includes boot resources and existing pages in each language under a subpath", async () => {
    const w = worker(); await w.run("install"); await w.run("activate");
    assert.equal(w.claimed(), true);
    for (const path of ["index.html", "README.md", "assets/bvn-icon-base.png", "js/search-aliases.js", "tools/app.js", "tools/fire.html", "css/theme-simple-dark.css", "zh-cn/main-fighter-ctrlers/FighterMcCtrler.md"]) {
        assert.ok(w.stored.has(scope + path), path);
    }
    assert.ok(w.stored.has("https://cdnjs.cloudflare.com/ajax/libs/docsify/4.13.1/docsify.min.js"));
    const pages = [...w.stored.keys()].filter(url => url.startsWith(scope + "zh-cn/"));
    assert.equal(pages.length, 24);
    for (const locale of ["en-us", "vi-vn", "it-it"]) {
        for (const file of ["README.md", "_coverpage.md", "_sidebar.md", "_404.md"]) assert.ok(w.stored.has(scope + locale + "/" + file));
        assert.equal(w.stored.has(scope + locale + "/main-fighter-ctrlers/FighterCtrler.md"), false);
    }
    for (const url of w.stored.keys()) {
        if (url.startsWith(scope) && url !== scope) assert.ok(fs.existsSync(path.resolve(__dirname, "..", url.slice(scope.length))), url);
    }
});

test("offline document, external boot script and tool requests use the installed cache", async () => {
    const w = worker(); await w.run("install"); w.offline();
    for (const url of [scope + "README.md?cache-bust=12", scope + "tools/generators.js", scope + "zh-cn/data-model-classes/HitVO.md", "https://cdnjs.cloudflare.com/ajax/libs/docsify/4.13.1/docsify.min.js"]) {
        const result = await w.run("fetch", { url, method: "GET", mode: "cors" });
        assert.equal(result.status, 200);
        assert.match(await result.text(), /^resource:/);
    }
    const navigation = await w.run("fetch", { url: scope + "?preview=1", method: "GET", mode: "navigate" });
    assert.equal(await navigation.text(), "resource:" + scope + "index.html");
});

test("cached content returns immediately while online refresh updates the next request", async () => {
    const w = worker(); await w.run("install");
    const url = scope + "README.md";
    w.stored.set(url, new Response("old"));
    const result = await w.run("fetch", { url, method: "GET", mode: "cors" });
    assert.equal(await result.text(), "old");
    assert.equal(await w.stored.get(url).clone().text(), "resource:" + url);
    const refreshed = await w.run("fetch", { url, method: "GET", mode: "cors" });
    assert.equal(await refreshed.text(), "resource:" + url);
    assert.equal(await w.run("fetch", { url: scope, method: "POST" }), undefined);
    assert.equal(await w.run("fetch", { url: "https://unrelated.test/track", method: "GET" }), undefined);
    w.offline();
    const missing = await w.run("fetch", { url: scope + "missing.md", method: "GET", mode: "cors" });
    assert.equal(missing.type, "error");
});

test("cached startup and tool resources do not wait for a network request that never settles", async () => {
    const w = worker(); await w.run("install"); w.stall();
    const requests = [
        { url: scope + "?preview=1", method: "GET", mode: "navigate" },
        ...["README.md?cache-bust=456", "_coverpage.md", "_sidebar.md", "css/theme-simple-dark.css", "js/theme.js", "tools/generators.js"].map(file => ({ url: scope + file, method: "GET", mode: "cors" })),
        { url: "https://cdnjs.cloudflare.com/ajax/libs/docsify/4.13.1/docsify.min.js", method: "GET", mode: "cors" }
    ];
    const jobs = requests.map(request => w.dispatch("fetch", request));
    let timer;
    try {
        const responses = await Promise.race([
            Promise.all(jobs.map(job => job.response)),
            new Promise((resolve, reject) => { timer = setTimeout(() => reject(new Error("cached responses waited for the network")), 500); })
        ]);
        for (const response of responses) assert.equal(response.status, 200);
        assert.equal(await responses[0].text(), "resource:" + scope + "index.html");
    } finally {
        clearTimeout(timer);
        w.resume();
        await Promise.all(jobs.map(job => job.finished()));
    }
});
