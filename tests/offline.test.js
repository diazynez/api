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
        fetch: async request => { if (!online) throw new Error("offline"); return response(typeof request === "string" ? request : request.url); },
        self: {
            registration: { scope }, location: { origin: "https://example.test" },
            addEventListener: (name, handler) => { handlers[name] = handler; },
            skipWaiting: async () => {}, clients: { claim: async () => { claimed = true; } }
        }
    };
    vm.runInNewContext(source, context);
    async function run(name, request) {
        const work = []; let result;
        handlers[name]({ request, waitUntil: p => work.push(p), respondWith: p => { result = p; } });
        const value = await result;
        await Promise.all(work);
        return value;
    }
    return { run, stored, offline() { online = false; }, claimed: () => claimed };
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

test("online requests refresh cached content and unrelated requests are left alone", async () => {
    const w = worker(); await w.run("install");
    const url = scope + "README.md";
    w.stored.set(url, new Response("old"));
    const result = await w.run("fetch", { url, method: "GET", mode: "cors" });
    assert.equal(await result.text(), "resource:" + url);
    assert.equal(await w.stored.get(url).text(), "resource:" + url);
    assert.equal(await w.run("fetch", { url: scope, method: "POST" }), undefined);
    assert.equal(await w.run("fetch", { url: "https://unrelated.test/track", method: "GET" }), undefined);
    w.offline();
    const missing = await w.run("fetch", { url: scope + "missing.md", method: "GET", mode: "cors" });
    assert.equal(missing.type, "error");
});
