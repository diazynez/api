"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");
const aliases = require("../js/search-aliases.js");

function searchFixture(withAliases = true) {
    const context = { window: { BvnSearchAliases: withAliases ? aliases : undefined }, $docsify: { plugins: [] } };
    const source = fs.readFileSync(require.resolve("../js/search.min.js"), "utf8");
    vm.runInNewContext(source.replace("function init(config,vm)", "window.search=search;window.setIndex=function(data){INDEXS=data};function init(config,vm)"), context);
    context.window.setIndex({ docs: {
        hurt: { title: "setHurtAction", body: "说明：设置当身触发后的动作，并使人物进入当身状态", slug: "#/FighterMcCtrler?id=sethurtaction" },
        hp: { title: "hp", body: "说明：读取当前血量", slug: "#/FighterCtrler?id=hp" },
        assist: { title: "fzqi", body: "说明：人物的辅助能量", slug: "#/FighterMain?id=fzqi" },
        ghost: { title: "isGhostSteping", body: "说明：返回是否处于幽步流程", slug: "#/FighterMcCtrler?id=isghoststeping" }
    } });
    return context.window.search;
}

test("community terms find the existing counter interface without adding hidden copy", () => {
    const search = searchFixture();
    for (const query of ["防反", "当身", "反制", "防反/当身", "防反 代码"]) {
        const results = search(query);
        assert.equal(results[0].title, "setHurtAction");
        assert.equal(results[0].url, "#/FighterMcCtrler?id=sethurtaction");
        assert.match(results[0].content, /当身/);
        assert.doesNotMatch(results[0].content, /防反|反制/);
    }
});

test("legacy terms find canonical wording in an existing index", () => {
    const search = searchFixture();
    assert.equal(search("生命值")[0].title, "hp");
    assert.equal(search("辅助冷却")[0].title, "fzqi");
    assert.deepEqual(aliases.expand(["3V3"]), ["3V3", "小队模式", "3对3", "三对三"]);
    assert.ok(aliases.expand(["血量"]).includes("生命值"));
});

test("expansion preserves API queries and keeps distinct mechanics separate", () => {
    assert.deepEqual(aliases.expand(["setHurtAction", "setHurtAction"]), ["setHurtAction"]);
    for (const word of ["幽步", "瞬步", "气量", "isCounterDef"]) assert.deepEqual(aliases.expand([word]), [word]);
    const search = searchFixture();
    assert.equal(search("瞬步").length, 0);
    assert.equal(search("幽步")[0].title, "isGhostSteping");
    assert.equal(search("setHurtAction")[0].title, "setHurtAction");
    assert.equal(search("<img src=x onerror=alert(1)>").length, 0);
});

test("the search plugin still works if the alias helper is unavailable", () => {
    const search = searchFixture(false);
    assert.equal(search("当身")[0].title, "setHurtAction");
    assert.equal(search("反制").length, 0);
});

test("search indexes the correct language homepage without creating a protocol-relative URL", () => {
    const source = fs.readFileSync(require.resolve("../js/search.min.js"), "utf8");
    const html = fs.readFileSync(require.resolve("../index.html"), "utf8");
    const namespaces = vm.runInNewContext(html.match(/pathNamespaces:\s*(\[[^\]]+\])/)[1]);
    for (const prefix of ["", "/zh-cn", "/en-us", "/vi-vn", "/it-it"]) {
        const requested = [];
        const page = prefix + "/main-fighter-ctrlers/FighterCtrler";
        const context = {
            window: {}, $docsify: { plugins: [] },
            localStorage: { getItem() { return null; } },
            Docsify: {
                dom: { findAll() { return [{ href: "#" + page, getAttribute() { return page; } }]; } },
                util: { isAbsolutePath() { return false; } },
                get() { return { then() {} }; }
            }
        };
        vm.runInNewContext(source.replace("function init(config,vm)", "window.initIndex=init;function init(config,vm)"), context);
        context.window.initIndex({ paths: "auto", pathNamespaces: namespaces }, {
            config: {},
            router: {
                parse(href) { return { path: href.slice(1) }; },
                getFile(path) { requested.push(path); return path; }
            }
        });
        const homepage = (prefix === "/zh-cn" ? "" : prefix) + "/";
        assert.equal(requested[0], homepage);
        assert.ok(fs.existsSync(require("node:path").resolve(__dirname, "..", "." + homepage, "README.md")));
        assert.ok(requested.includes(page));
        assert.ok(requested.every(path => !path.startsWith("//")));
    }
});
