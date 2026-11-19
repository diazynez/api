"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const c = require("../tools/composer-core.js");

test("a natural-language condition generates a typed path that executes only when the condition holds", () => {
    const result = c.fromText("耐力不少于20时，跳到“招2”并播放");
    const output = c.generate(result.graph);
    assert.deepEqual(output.errors, []);
    assert.match(output.code, /\$mc_ctrler\.getFighterMc\(\)\.goFrame/);
    const calls = [];
    let energy = 19;
    const context = { parent: { $fighter_ctrler: { getEnergy: () => energy }, $mc_ctrler: { getFighterMc: () => ({ goFrame: (...args) => calls.push(args) }) } } };
    vm.runInNewContext(output.code, context);
    assert.equal(calls.length, 0);
    energy = 20; vm.runInNewContext(output.code, context);
    assert.deepEqual(calls[0], ["招2", true, 0]);
});

test("current hit points use FighterMain and action order follows the text", () => {
    const result = c.fromText("生命值低于500时，先闪白光，然后恢复100点血量");
    const output = c.generate(result.graph);
    assert.match(output.code, /getSelf\(\)\.hp < 500/);
    assert.ok(output.code.indexOf("shine(") < output.code.indexOf("addHp("));
    assert.doesNotMatch(output.code, /\$fighter_ctrler\.hp/);
});

test("an explicit interface name creates its object path without inventing a frame label", () => {
    const result = c.fromText("从FighterCtrler出发，找到FighterMC的goFrame接口");
    assert.ok(result.graph.nodes.some(n => n.key === "getMcCtrl"));
    assert.ok(result.graph.nodes.some(n => n.key === "getFighterMc"));
    assert.equal(c.generate(result.graph).code, "");
    assert.ok(c.generate(result.graph).errors.includes("请填写帧标签"));
});

test("attack configuration follows hitModel and keeps parameterized object instances separate", () => {
    const result = c.fromText("将攻击“k1”的攻击力改为80");
    assert.match(c.generate(result.graph).code, /hitModel\.getHitVO\("k1"\)\.power = 80/);
    const node = c.addNode(result.graph, "setPower", { params: { value: 90 }, y: 400 });
    const owner = c.attachPath(result.graph, node); owner.params.id = "k2";
    const code = c.generate(result.graph).code;
    assert.match(code, /getHitVO\("k1"\)\.power = 80/);
    assert.match(code, /getHitVO\("k2"\)\.power = 90/);
});

test("object ports reject incompatible types and disconnected actions block output", () => {
    const graph = c.createGraph(), root = c.addNode(graph, "fighter"), action = c.addNode(graph, "goFrame", { params: { name: "招2" } });
    assert.throws(() => c.connect(graph, root.id, action.id), /需要 FighterMC/);
    assert.equal(c.generate(graph).code, "");
    c.attachPath(graph, action);
    assert.equal(c.generate(graph).errors.length, 0);
});

test("bubble placement validates return values, moves cards atomically and orders actions", () => {
    const graph = c.createGraph(), bubble = c.addBubble(graph), value = c.addNode(graph, "getEnergy"), first = c.addNode(graph, "addHp"), second = c.addNode(graph, "shine");
    [value, first, second].forEach(n => c.attachPath(graph, n));
    assert.throws(() => c.place(graph, first.id, bubble.id, "condition"), /条件区需要/);
    c.place(graph, value.id, bubble.id, "condition");
    c.place(graph, first.id, bubble.id, "actions"); c.place(graph, second.id, bubble.id, "actions", 0);
    assert.ok(c.generate(graph).code.indexOf("shine(") < c.generate(graph).code.indexOf("addHp("));
    c.detach(graph, value.id);
    assert.equal(c.generate(graph).code, "");
    assert.ok(c.generate(graph).errors.includes("条件泡泡缺少判断条件"));
});

test("unsupported and negated conditions are never silently turned into unconditional operations", () => {
    for (const text of ["如果目标在场，就震屏", "不要跳到“招2”", "耐力不少于20且血量低于500时，跳到“招2”", "在空中时闪白光，否则恢复100点血量"]) {
        const result = c.fromText(text);
        assert.ok(result.notes.length);
        assert.equal(c.generate(result.graph).code, "", text);
    }
});

test("version restrictions can be resolved by using the documented FighterMain root", () => {
    const unsupported = c.fromText("耐力不少于20时，跳到“招2”", "3.0");
    assert.equal(c.generate(unsupported.graph).code, "");
    const supported = c.fromText("耐力不少于20时，跳到“招2”", "3.0", "main");
    assert.deepEqual(c.generate(supported.graph).errors, []);
    assert.match(c.generate(supported.graph).code, /\$self_main\.energy >= 20/);
    assert.match(c.generate(supported.graph).code, /\$self_main\.getMC\(\)\.goFrame/);
    const graph = c.createGraph(); graph.version = "3.0"; graph.root = "main";
    const hp = c.addNode(graph, "setHp", { params: { value: 250 } }); c.attachPath(graph, hp);
    const output = c.generate(graph);
    assert.deepEqual(output.errors, []); assert.match(output.code, /function get \$self_main/); assert.match(output.code, /\$self_main\.hp = 250/);
});

test("strings remain literals and invalid numbers never become code", () => {
    const graph = c.fromText("耐力不少于20时，跳到“招2”").graph;
    const jump = graph.nodes.find(n => n.key === "goFrame");
    jump.params.name = 'x"); injected(); //';
    let label;
    vm.runInNewContext(c.generate(graph).code, { parent: { $fighter_ctrler: { getEnergy: () => 30 }, $mc_ctrler: { getFighterMc: () => ({ goFrame: name => { label = name; } }) } } });
    assert.equal(label, jump.params.name);
    for (const value of ["", "NaN", "1; injected()", "Infinity", "2.5"]) {
        jump.params.playFrame = value;
        assert.equal(c.generate(graph).code, "", value);
    }
});

test("local workspaces round-trip and malformed saved data is rejected", () => {
    const graph = c.fromText("血量低于500时，恢复100点血量并闪白光").graph;
    assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(graph)))).code, c.generate(graph).code);
    const bad = JSON.parse(JSON.stringify(graph)); bad.nodes[0].key = "constructor";
    assert.throws(() => c.validateGraph(bad), /接口或参数无效/);
    const duplicate = JSON.parse(JSON.stringify(graph)); duplicate.nodes.push(duplicate.nodes[0]);
    assert.throws(() => c.validateGraph(duplicate), /编号无效或重复/);
    const invalidEdge = JSON.parse(JSON.stringify(graph)); invalidEdge.edges.push({ from: "n0", to: "n1" });
    assert.throws(() => c.validateGraph(invalidEdge), /不存在/);
});

test("every catalog item links to an existing document and interface heading", () => {
    for (const spec of c.specs) {
        const text = fs.readFileSync(path.resolve(__dirname, "..", spec.doc + ".md"), "utf8");
        if (spec.kind === "root") continue;
        const key = spec.anchor || spec.key;
        assert.match(text, new RegExp("> #{5,6} (?:3\\.[0-9]+(?:开发)?增加 )?" + key + "(?:\\s|$)", "i"), spec.key);
    }
});

test("a character can use Fighter, Mc and Effect roots together", () => {
    const result = c.fromText("耐力不少于20时，跳到“招2”并播放，然后闪白光");
    const roots = result.graph.nodes.filter(n => c.catalog[n.key].kind === "root").map(n => n.key).sort();
    assert.deepEqual(roots, ["effect", "fighter", "mc"]);
    const code = c.generate(result.graph).code;
    assert.match(code, /\$fighter_ctrler\.getEnergy/);
    assert.match(code, /\$mc_ctrler\.getFighterMc/);
    assert.match(code, /\$effect_ctrler\.shine/);
});

test("assister and attacker contexts use their own controllers and document links", () => {
    for (const actor of ["assister", "attacker"]) {
        const result = c.fromText("血量低于500时，跳到“招2”并播放，然后闪白光", "3.8开发", actor);
        const output = c.generate(result.graph);
        assert.deepEqual(output.errors, []);
        const prefix = actor === "assister" ? "$assisterCtrler" : "$attacker_ctrler";
        assert.ok(output.code.includes(prefix + '.gotoAndPlay("招2")'));
        assert.ok(output.code.includes(prefix + ".effect.shine(0xffffff)"));
        assert.ok(output.code.includes(prefix + ".getSelf().hp < 500"));
        assert.doesNotMatch(output.code, /parent\.\$/);
    }
});

test("changing logical ownership preserves conditions, action order and attack IDs", () => {
    const graph = c.fromText("在空中时，跳到“招2”并停止，然后闪白光").graph;
    assert.deepEqual(c.changeActor(graph, "assister"), []);
    assert.match(c.generate(graph).code, /\$assisterCtrler\.gotoAndStop/);
    assert.deepEqual(c.changeActor(graph, "character"), []);
    assert.match(c.generate(graph).code, /goFrame\("招2", false, 0\)/);
    const power = c.fromText("将攻击“k1”的攻击力改为80").graph;
    c.changeActor(power, "assister");
    assert.match(c.generate(power).code, /\$assisterCtrler\.hitModel\.getHitVO\("k1"\)\.power = 80/);
});

test("ownership cannot silently retain a character-only API in an assister workspace", () => {
    const graph = c.fromText("耐力不少于20时，跳到“招2”").graph;
    assert.ok(c.changeActor(graph, "assister").length);
    assert.equal(c.generate(graph).code, "");
    assert.ok(c.generate(graph).errors.some(e => e.includes("辅助")));
});

test("demo asset versions match the visible badge and output uses a full-width panel", () => {
    const html = fs.readFileSync(path.resolve(__dirname, "../tools/composer.html"), "utf8");
    for (const file of ["composer.css", "composer-core.js", "composer.js"]) assert.ok(html.includes(file + "?v=" + c.demoVersion));
    assert.ok(html.includes("DEMO v" + c.demoVersion));
    assert.doesNotMatch(html, /id="(?:export|import|import-file)"|demo-note|篮筐/);
    assert.match(html, /<\/section>\s*<\/div>\s*<section class="code-section panel">/);
});
