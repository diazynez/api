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
    assert.match(output.code, /\$mc_ctrler\.gotoAndPlay/);
    const calls = [];
    let energy = 19;
    const context = { parent: { $fighter_ctrler: { getEnergy: () => energy }, $mc_ctrler: { gotoAndPlay: (...args) => calls.push(args) } } };
    vm.runInNewContext(output.code, context);
    assert.equal(calls.length, 0);
    energy = 20; vm.runInNewContext(output.code, context);
    assert.deepEqual(calls[0], ["招2"]);
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
    assert.ok(c.generate(graph).errors.includes("条件块缺少判断条件"));
});

test("unsupported and negated conditions are never silently turned into unconditional operations", () => {
    for (const text of ["如果目标在场，就震屏", "不要跳到“招2”", "在空中时闪白光，否则恢复100点血量"]) {
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
    const graph = c.createGraph();
    const jump = c.addNode(graph, "goFrame", { params: { name: "招2" } }); c.attachPath(graph, jump);
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
    assert.match(code, /\$mc_ctrler\.gotoAndPlay/);
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
    assert.match(c.generate(graph).code, /gotoAndStop\("招2"\)/);
    const power = c.fromText("将攻击“k1”的攻击力改为80").graph;
    c.changeActor(power, "assister");
    assert.match(c.generate(power).code, /\$assisterCtrler\.hitModel\.getHitVO\("k1"\)\.power = 80/);
});

test("constructed and converted cards retain only parameters declared by their current interface", () => {
    function check(graph) {
        graph.nodes.forEach(n=>assert.deepEqual(Object.keys(n.params).sort(),c.catalog[n.key].fields.map(f=>f.key).sort(),n.key));
    }
    for(const actor of Object.keys(c.actors))for(const version of c.versions)for(const [,text] of c.demoExamples(actor,version)) check(c.fromText(text,version,actor).graph);
    const graph=c.fromText("跳到招2并停止，然后关闭重力").graph;
    for(const actor of ["assister","attacker","character"]) {c.changeActor(graph,actor);check(graph);}
    const jump=c.fromText("跳到招2并播放").graph.nodes.find(n=>n.key === "gotoAndPlay");
    assert.deepEqual(jump.params,{name:"招2"});
});

test("resource sufficiency phrases include the exact cost and insufficient phrases exclude it", () => {
    for(const [resource,key] of [["耐力","getEnergy"],["体力","getEnergy"],["气量","qi"]])for(const [phrase,op] of [["足够支付",">="],["够扣",">="],["足以消耗",">="],["不够支付","<"],["不足以扣除","<"]]) {
        const result=c.parse(resource+phrase+"20点时闪白光");
        assert.equal(result.conditions[0].key,key);assert.equal(result.conditions[0].operator,op);assert.equal(result.conditions[0].value,"20");
    }
    const negative=c.parse("体力不够支付20点时闪白光");assert.equal(negative.conditions.length,1);
    assert.equal(c.parse('跳到“耐力足够支付20点”').conditions.length,0);
});

test("ownership cannot silently retain a character-only API in an assister workspace", () => {
    const graph = c.fromText("耐力不少于20时，跳到“招2”").graph;
    assert.ok(c.changeActor(graph, "assister").length);
    assert.equal(c.generate(graph).code, "");
    assert.ok(c.generate(graph).errors.some(e => e.includes("尚未连接")));
    assert.ok(!graph.nodes.some(n => n.key === "assisterOwner_fighter_ctrler"));
});

test("demo asset versions match the visible badge and output uses a full-width panel", () => {
    const html = fs.readFileSync(path.resolve(__dirname, "../tools/composer.html"), "utf8");
    for (const file of ["composer.css", "composer-language.js", "composer-core.js", "composer-wires.js", "composer.js"]) assert.ok(html.includes(file + "?v=" + c.demoVersion));
    assert.ok(html.includes("DEMO v" + c.demoVersion));
    assert.doesNotMatch(html, /id="(?:export|import|import-file)"|demo-note|篮筐/);
    assert.match(html, /<\/section>\s*<\/div>\s*<section class="code-section panel">/);
});

test("community counter names configure a later hurt action, not an immediate frame jump", () => {
    for (const word of ["当身", "防反", "反制"]) {
        const result = c.fromText(`求个${word}代码，${word}触发后跳到“招22”`);
        const output = c.generate(result.graph);
        assert.deepEqual(output.errors, []);
        assert.equal(output.code, 'parent.$mc_ctrler.setHurtAction("招22");');
        assert.ok(!result.suggestions.includes("setAllowBeHit"));
    }
    const draft = c.fromText("大佬防反咋写，代码有吗");
    assert.ok(draft.graph.nodes.some(n => n.key === "setHurtAction"));
    assert.match(c.generate(draft.graph).errors.join(""), /动作标签/);
});

test("hit-triggered jumps execute only for the configured hit ID", () => {
    const graph = c.fromText("攻击面“k1”命中后，跳到“招2”并闪蓝光").graph;
    const output = c.generate(graph);
    assert.deepEqual(output.errors, []);
    const calls = [];
    let hit = false;
    const context = { parent: {
        $fighter_ctrler: { justHit: (id, includeDefense) => { assert.equal(id, "k1"); assert.equal(includeDefense, false); return hit; } },
        $mc_ctrler: { gotoAndPlay: (...args) => calls.push(args) },
        $effect_ctrler: { shine: color => calls.push(color) }
    } };
    vm.runInNewContext(output.code, context); assert.equal(calls.length, 0);
    hit = true; vm.runInNewContext(output.code, context);
    assert.deepEqual(calls, [["招2"], 0x0000ff]);
    const missing = c.generate(c.fromText("命中后跳到招2").graph);
    assert.equal(missing.code, ""); assert.match(missing.errors.join(""), /攻击 ID/);
});

test("touching the floor registers its later action without an immediate goFrame", () => {
    const output = c.generate(c.fromText("落地后跳到“跳招2”").graph);
    assert.deepEqual(output.errors, []);
    assert.equal(output.code, 'parent.$mc_ctrler.setTouchFloor("跳招2", true);');
});

test("Chinese thresholds and resource operations preserve their runtime meanings", () => {
    const output = c.generate(c.fromText("耐力不少于二十时，扣20点耐力，然后增加100点气量").graph);
    assert.deepEqual(output.errors, []);
    const calls = [];
    const context = { parent: { $fighter_ctrler: { getEnergy: () => 20, loseEnergy: v => calls.push(["energy", v]) }, $mc_ctrler: { addQi: v => calls.push(["qi", v]) } } };
    vm.runInNewContext(output.code, context);
    assert.deepEqual(calls, [["energy", 20], ["qi", 100]]);
    const assigned = c.generate(c.fromText("把耐力设为50，然后气量改为200").graph);
    assert.match(assigned.code, /getSelf\(\)\.energy = 50/);
    assert.match(assigned.code, /getSelf\(\)\.qi = 200/);
    assert.doesNotMatch(assigned.code, /\$fighter_ctrler\.energy =/);
});

test("health percentages use hpRate with version validation", () => {
    const output = c.generate(c.fromText("血量低于50%时，恢复100点血量").graph);
    assert.deepEqual(output.errors, []); assert.match(output.code, /\.hpRate < 0\.5/);
    assert.match(c.generate(c.fromText("半血以下时回血100").graph).code, /\.hpRate <= 0\.5/);
    const old = c.generate(c.fromText("血量低于一半时，恢复100点血量", "3.5").graph);
    assert.equal(old.code, ""); assert.match(old.errors.join(""), /hpRate.*3.8/);
});

test("repeated actions and unquoted labels keep every requested operation in order", () => {
    const output = c.generate(c.fromText("回血20，然后回血30，然后跳到招2并闪红光").graph);
    assert.deepEqual(output.errors, []);
    const calls = [];
    vm.runInNewContext(output.code, { parent: {
        $fighter_ctrler: { addHp: n => calls.push(n) },
        $mc_ctrler: { gotoAndPlay: name => calls.push(name) },
        $effect_ctrler: { shine: color => calls.push(color) }
    } });
    assert.deepEqual(calls, [20, 30, "招2", 0xff0000]);
});

test("ownership in the request chooses native assister or attacker APIs", () => {
    const auxiliary = c.fromText("让辅助关闭重力，然后面向对方");
    assert.equal(auxiliary.graph.actor, "assister");
    assert.equal(c.generate(auxiliary.graph).code, "$assisterCtrler.setApplyG(false);\n\n$assisterCtrler.setDirectToTarget();");
    const attacker = c.generate(c.fromText("攻击对象反向转身").graph);
    assert.deepEqual(attacker.errors, []); assert.match(attacker.code, /\$attacker_ctrler\.setDirectReverse\(\)/);
    const graph = c.fromText("关闭重力").graph;
    assert.deepEqual(c.changeActor(graph, "assister"), []);
    assert.match(c.generate(graph).code, /setApplyG\(false\)/);
    assert.deepEqual(c.changeActor(graph, "character"), []);
    assert.match(c.generate(graph).code, /\$mc_ctrler\.isApplyG\(false\)/);
});

test("combat configuration uses separate HitVO instances for each stated attack", () => {
    const graph = c.fromText("攻击面“k1”的硬直改为500，然后横向受力改为8").graph;
    const output = c.generate(graph);
    assert.deepEqual(output.errors, []);
    const vo = {}, ids = [];
    vm.runInNewContext(output.code, { parent: { $fighter_ctrler: { hitModel: { getHitVO: id => { ids.push(id); return vo; } } } } });
    assert.deepEqual(ids, ["k1", "k1"]); assert.deepEqual(vo, { hurtTime: 500, hitx: 8 });
});

test("cooldown seconds are converted only where the version's frame semantics are known", () => {
    const current = c.generate(c.fromText("设置冷却“招1”为十秒").graph);
    assert.equal(current.code, 'parent.$mc_ctrler.getAction().setCD("招1", 300);');
    const previous = c.fromText("设置冷却“招1”为十秒", "3.6");
    assert.equal(c.generate(previous.graph).code, "");
    assert.match(previous.notes.join(""), /旧版 setCD/);
    const node = previous.graph.nodes.find(n => n.key === "setCD"); node.params.time = 9000;
    assert.deepEqual(c.generate(previous.graph).errors, []);
});

test("diagnostic and blackout questions offer relevant APIs without executing a guessed fix", () => {
    for (const text of ["防反代码敲了没反应怎么办", "为什么当身触发不了", "怎么用render弄一个黑幕继续播放动画的效果", "黑幕期间攻击面还能攻击吗"]) {
        const r = c.fromText(text);
        assert.equal(c.generate(r.graph).code, "", text);
        assert.ok(r.suggestions.length, text);
        assert.ok(r.notes.length, text);
    }
    const blackout = c.fromText("黑幕继续播放动画");
    assert.ok(blackout.suggestions.includes("addRenderFunc"));
    assert.ok(blackout.suggestions.includes("renderAnimate"));
    assert.ok(!blackout.suggestions.includes("bisha"));
    const resource = c.fromText("有没有二尾的素材");
    assert.equal(resource.graph.nodes.length, 0); assert.match(resource.notes.join(""), /素材/);
});

test("unhandled target mutations, partial commands and timers never become partial executable code", () => {
    for (const text of ["对方血量低于100时，恢复10血", "回血100然后让人物变蓝", "每隔一秒恢复20血", "开启黑幕并隐藏人物", "先回血20，如果耐力超过30时跳到招2", "低血量时回血100", "当身触发后跳到招2并闪白光", "落地后跳到招2然后跳到招3", "回血20并开启霸体", "回血20再瞬移到对方头顶"]) {
        const r = c.fromText(text);
        assert.equal(c.generate(r.graph).code, "", text); assert.ok(r.notes.length, text);
    }
});

test("timeline looping is one call rather than a duplicated immediate frame jump", () => {
    const output = c.generate(c.fromText("循环播放动作“站立”").graph);
    assert.deepEqual(output.errors, []);
    assert.equal(output.code, 'parent.$mc_ctrler.loop("站立");');
});

test("read requests produce values and render callbacks accept only existing function references", () => {
    const read = c.generate(c.fromText("获取当前血量").graph);
    assert.match(read.code, /var value1:int = .*getSelf\(\)\.hp;/);
    const graph = c.createGraph(); const node = c.addNode(graph, "addRenderFunc"); c.attachPath(graph, node);
    assert.match(c.generate(graph).errors.join(""), /回调函数名称/);
    node.params.func = "render1";
    assert.equal(c.generate(graph).code, "parent.$fighter_ctrler.addRenderFunc(render1);");
    node.params.func = "render1(); injected()"; assert.equal(c.generate(graph).code, "");
});

test("new cards survive saved-workspace validation without losing parameters or ownership", () => {
    for (const text of ["求个防反代码，当身触发后跳到招2", "攻击“k1”命中后跳到招2", "设置冷却“招1”为10秒", "让辅助关闭重力，然后面向对方", "血量低于50%时，恢复100血"]) {
        const graph = c.fromText(text).graph;
        assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(graph)))).code, c.generate(graph).code, text);
    }
});

test("browser scripts load the language rules before the composer without CommonJS", () => {
    const context = vm.createContext({});
    for (const file of ["composer-language.js", "composer-core.js"]) {
        vm.runInContext(fs.readFileSync(path.resolve(__dirname, "../tools/", file), "utf8"), context);
    }
    const result = context.BvnComposer.fromText("求个防反代码，当身触发后跳到招2");
    assert.equal(context.BvnComposer.generate(result.graph).code, 'parent.$mc_ctrler.setHurtAction("招2");');
    const html = fs.readFileSync(path.resolve(__dirname, "../tools/composer.html"), "utf8");
    assert.ok(html.indexOf('src="composer-language.js') < html.indexOf('src="composer-core.js'));
});

test("quoted labels keep conjunctions and do not activate unrelated intent rules", () => {
    for (const label of ["招2并播放", "为什么", "当身后", "黑幕动画", "恢复100血", "k1伤害改为100", "招２"]) {
        const output = c.generate(c.fromText(`跳到“${label}”`).graph);
        assert.deepEqual(output.errors, [], label);
        assert.equal(output.code, `parent.$mc_ctrler.gotoAndPlay(${JSON.stringify(label)});`, label);
    }
});

test("each attack configuration uses its own preceding ID", () => {
    const output = c.generate(c.fromText('攻击“k1”的伤害改为50，然后攻击“k2”的伤害改为80').graph);
    assert.deepEqual(output.errors, []);
    assert.match(output.code, /getHitVO\("k1"\)\.power = 50/);
    assert.match(output.code, /getHitVO\("k2"\)\.power = 80/);
});

test("play and stop modifiers belong to individual jumps", () => {
    const output = c.generate(c.fromText('跳到“招2”并停止，然后跳到“招3”并播放').graph);
    assert.deepEqual(output.errors, []);
    assert.match(output.code, /gotoAndStop\("招2"\)/);
    assert.match(output.code, /gotoAndPlay\("招3"\)/);
});

test("attack edits compose independent IDs, properties, operators and word orders", () => {
    const fields = [["伤害", "power"], ["硬直时间", "hurtTime"], ["水平受力", "hitx"], ["纵向受力", "hity"]];
    const ops = [["提高", "+=", 47], ["降低", "-=", 33], ["设置为", "=", 7]];
    for (const [word, member] of fields) for (const [op, symbol, expected] of ops) {
        for (const id of ["atk9", "b2atm", "SJ"]) for (const order of [0, 1]) {
            const text = order ? `给攻击面“${id}”${op}7点${word}` : `让${id}的${word}${op}7`;
            const result = c.fromText(text), output = c.generate(result.graph);
            assert.deepEqual(output.errors, [], text);
            assert.ok(output.code.includes(`.${member} ${symbol} 7`), text);
            const vo = { [member]: 40 };
            vm.runInNewContext(output.code, { parent: { $fighter_ctrler: { hitModel: { getHitVO: value => { assert.equal(value, id); return vo; } } } } });
            assert.equal(vo[member], expected, text);
        }
    }
});

test("attack contexts survive conditions and clauses without borrowing a later ID", () => {
    const output = c.generate(c.fromText("攻击a1命中后伤害增加12，然后硬直降低5，接着攻击b2伤害设为70").graph);
    assert.deepEqual(output.errors, []);
    assert.match(output.code, /justHit\("a1", false\)/);
    assert.match(output.code, /getHitVO\("a1"\)\.power \+= 12/);
    assert.match(output.code, /getHitVO\("a1"\)\.hurtTime -= 5/);
    assert.match(output.code, /getHitVO\("b2"\)\.power = 70/);
    const missing = c.generate(c.fromText("伤害增加12，然后攻击b2伤害设为70").graph);
    assert.equal(missing.code, "");
    assert.match(missing.errors.join(""), /攻击 ID/);
});

test("jump aliases and conjunctions preserve labels and subsequent resource actions", () => {
    for (const verb of ["跳帧到", "跳转至", "跳到"]) for (const join of ["的同时", "同时", "，然后", "并", "，接着"]) {
        const text = `${verb}动作9${join}给自己加十三气`;
        const output = c.generate(c.fromText(text).graph);
        assert.deepEqual(output.errors, [], text);
        assert.ok(output.code.indexOf('gotoAndPlay("动作9"') < output.code.indexOf("addQi(13)"), text);
        assert.match(output.code, /gotoAndPlay\("动作9"\)/, text);
        assert.match(output.code, /addQi\(13\)/, text);
    }
    for (const [word, call] of [["血量", "addHp"], ["耐力", "addEnergy"], ["气量", "addQi"]]) {
        assert.match(c.generate(c.fromText(`自己${word}增加17`).graph).code, new RegExp(call + "\\(17\\)"));
    }
});

test("binding slots support every documented input with default and authored actions", () => {
    const bindings = { SJ: ["setSkill1", "砍技1"], WJ: ["setSkill2", "砍技2"], U: ["setZhao1", "招1"], SU: ["setZhao2", "招2"], WU: ["setZhao3", "招3"], ADJ: ["setCatch1", "摔1"], ADU: ["setCatch2", "摔2"] };
    for (const [binding, [method, frame]] of Object.entries(bindings)) {
        for (const custom of [false, true]) for (const verb of ["设置", "登记", "绑定"]) {
            const result = c.fromText(`attack9命中后${verb}${binding.toLowerCase()}纽带${custom ? '为“自定义8”' : ""}`);
            const output = c.generate(result.graph);
            assert.deepEqual(output.errors, []);
            assert.ok(output.code.includes(`${method}(${JSON.stringify(custom ? "自定义8" : frame)})`));
            assert.match(output.code, /if \(.*justHit\("attack9", false\)\)/);
        }
    }
});

test("spatial conditions keep missing bounds and capture labels editable instead of inventing them", () => {
    const draft = c.fromText("我想让对方角色在我面前的时候捕捉");
    assert.equal(draft.graph.nodes.find(n => n.key === "targetInRange").params.rx, "");
    assert.equal(draft.graph.nodes.find(n => n.key === "gotoAndPlay").params.name, "");
    assert.equal(c.generate(draft.graph).code, "");
    assert.ok(!draft.graph.nodes.some(n => n.key === "setCatch1"));
    for (const [direction, expected] of [["前方", [20, 90]], ["身后", [-90, -20]]]) {
        const result = c.fromText(`目标在自身${direction}20到90像素时跳帧到“抓取”`);
        assert.equal(result.graph.nodes.filter(n => n.key === "gotoAndPlay").length, 1);
        const output = c.generate(result.graph);
        assert.deepEqual(output.errors, []);
        const calls = []; let inRange = false;
        const context = { parent: {
            $fighter_ctrler: { targetInRange: (x, y) => { assert.deepEqual(Array.from(x), expected); assert.equal(y, null); return inRange; } },
            $mc_ctrler: { gotoAndPlay: frame => calls.push(frame) }
        } };
        vm.runInNewContext(output.code, context); assert.equal(calls.length, 0);
        inRange = true; vm.runInNewContext(output.code, context); assert.deepEqual(calls, ["抓取"]);
        const range = result.graph.nodes.find(n => n.key === "targetInRange");
        for (const invalid of ["[0, injected()]", "[9,2]", "[null,100]", "[0,1,2]"]) {
            range.params.rx = invalid;
            assert.equal(c.generate(result.graph).code, "", invalid);
        }
    }
});

test("slot matching does not bridge unknown clauses, negation, percentages or quoted data", () => {
    for (const text of ["攻击a1伤害不要增加30", "攻击a1伤害增加30%", "攻击a1伤害增加，如果耐力低于20就30", "伤害增加气量10", "攻击a1伤害改为20然后不要回血30"]) {
        const result = c.fromText(text);
        assert.equal(c.generate(result.graph).code, "", text);
        assert.ok(result.notes.length, text);
    }
    const output = c.generate(c.fromText('a1没命中时跳到“伤害增加30的同时”').graph);
    assert.deepEqual(output.errors, []);
    assert.match(output.code, /!\(.*justHit/);
    assert.match(output.code, /gotoAndPlay\("伤害增加30的同时"\)/);
});

test("state conditions distinguish their subject and preserve negation across combat states", () => {
    for (const [word, state] of [["防御", 20], ["受击", 21], ["击飞", 22], ["当身", 16], ["死亡", 30]]) {
        for (const subject of ["对方", "对手", "自身", "我方"]) for (const negative of [false, true]) {
            const text = `${subject}${negative ? "不处于" : "正在"}${word}状态的时候，攻击a9伤害增加8`;
            const output = c.generate(c.fromText(text).graph);
            assert.deepEqual(output.errors, [], text);
            const vo = { power: 10 }; let currentState = state;
            const fighter = { getTargetState: () => currentState, getSelf: () => ({ actionState: currentState }), hitModel: { getHitVO: () => vo } };
            vm.runInNewContext(output.code, { parent: { $fighter_ctrler: fighter } });
            assert.equal(vo.power, negative ? 10 : 18, text);
            currentState = 999;
            vm.runInNewContext(output.code, { parent: { $fighter_ctrler: fighter } });
            assert.equal(vo.power, 18, text);
            assert.match(output.code, subject === "对方" || subject === "对手" ? /getTargetState/ : /actionState/);
            assert.doesNotMatch(output.code, /setHurtAction/);
        }
    }
});

test("numeric comparisons and skill registration verbs combine without phrase-specific rules", () => {
    const comparators = [["不足", "<"], ["少于", "<"], ["不多于", "<="], ["不少于", ">="], ["达到", ">="], ["超过", ">"]];
    for (const [word, operator] of comparators) for (const verb of ["获得", "得到", "启用", "登记"]) {
        const output = c.generate(c.fromText(`血量${word}123时，${verb}su纽带`).graph);
        assert.deepEqual(output.errors, []);
        assert.ok(output.code.includes(`.hp ${operator} 123`));
        assert.match(output.code, /setZhao2\("招2"\)/);
        assert.match(output.code, /\)\n\{\n/);
    }
});

test("collision expressions register future actions instead of polling attack hits", () => {
    for (const verb of ["碰到", "碰撞到", "接触到", "触碰"]) for (const id of ["check9", "zh11", "other_check"]) {
        const text = `“${id}”${verb}对方角色时跳帧到“抓取2”`;
        const output = c.generate(c.fromText(text).graph);
        assert.deepEqual(output.errors, [], text);
        const calls = [];
        vm.runInNewContext(output.code, { parent: { $mc_ctrler: { setHitTarget: (...args) => calls.push(args) } } });
        assert.deepEqual(calls, [[id, "抓取2"]]);
        assert.doesNotMatch(output.code, /justHit|gotoAndPlay/);
    }
    for (const text of ["checker9没碰到对方时跳到招2", "checker9碰到对方时跳到招2并闪白光", "碰到对方时跳到招2"]) {
        assert.equal(c.generate(c.fromText(text).graph).code, "", text);
    }
});

test("automatic paths use native shortcuts while explicit goFrame retains advanced controls", () => {
    for (const [suffix, method] of [["并播放", "gotoAndPlay"], ["并停止", "gotoAndStop"]]) {
        const graph = c.fromText("跳到“动作3”" + suffix).graph;
        assert.equal(c.generate(graph).code, `parent.$mc_ctrler.${method}("动作3");`);
        assert.ok(!graph.nodes.some(n => n.key === "getFighterMc"));
        c.changeActor(graph, "assister"); assert.ok(c.generate(graph).code.includes(`$assisterCtrler.${method}`));
        c.changeActor(graph, "character"); assert.ok(c.generate(graph).code.includes(`$mc_ctrler.${method}`));
    }
    assert.equal(c.generate(c.fromText("取消重力").graph).code, "parent.$mc_ctrler.isApplyG(false);");
    const explicit = c.fromText("FighterMC的goFrame").graph, node = explicit.nodes.find(n => n.key === "goFrame");
    node.params.name = "招7"; node.params.playFrame = 6;
    assert.match(c.generate(explicit).code, /getFighterMc\(\)\.goFrame\("招7", true, 6\)/);
    const setup = c.generate(c.fromText("血量不足120时跳到招3", "3.0", "main").graph).code;
    assert.match(setup, /function get \$self_main\(\): \* \{for each/);
    assert.match(setup, /getMC\(\)\.goFrame/);
});

test("native hit-and-play is chosen only for an equivalent single positive branch", () => {
    const direct = c.fromText("攻击a9命中后跳到招6");
    assert.equal(c.generate(direct.graph).code, 'parent.$mc_ctrler.justHitToPlay("a9", "招6", false, false);');
    assert.equal(direct.graph.bubbles.length, 0);
    const multi = c.generate(c.fromText("攻击a9命中后跳到招6并闪白光").graph);
    assert.match(multi.code, /if \(.*justHit/);
    assert.match(multi.code, /gotoAndPlay/);
    assert.doesNotMatch(multi.code, /justHitToPlay/);
    const negative = c.generate(c.fromText("a9未命中时跳到招6").graph);
    assert.match(negative.code, /if \(!\(/);
    const assister = c.generate(c.fromText("辅助a9命中后跳到招6").graph);
    assert.match(assister.code, /\$assisterCtrler\.justHit/);
    assert.doesNotMatch(assister.code, /parent\./);
});

test("short wire curves stay within their gap and do not reverse direction", () => {
    const wires = require("../tools/composer-wires.js");
    for (const gap of [0, 1, 4, 10, 25, 50, 200]) for (const rise of [-80, 0, 30]) {
        const points = wires.curve({ x: 40, y: 100 }, { x: 40 + gap, y: 100 + rise });
        let lastX = 40;
        for (let n = 0; n <= 100; n++) {
            const t = n / 100, u = 1 - t;
            const x = u ** 3 * points[0].x + 3 * u ** 2 * t * points[1].x + 3 * u * t ** 2 * points[2].x + t ** 3 * points[3].x;
            assert.ok(x >= lastX - 1e-9 && x <= 40 + gap + 1e-9);
            lastX = x;
        }
    }
});

test("detection cues and subject-aware air conditions preserve polarity and target existence", () => {
    for (const cue of ["如果", "检测到", "检查到", "判断出"]) for (const negative of [false, true]) {
        const text = `${cue}对方${negative ? "不处于" : "处于"}空中状态瞬移到身后`;
        const result = c.fromText(text), output = c.generate(result.graph);
        assert.deepEqual(output.errors, [], text);
        assert.ok(result.graph.nodes.some(n => n.key === "targetIsInAir"));
        assert.ok(!result.graph.nodes.some(n => n.key === "getSelf"));
        const calls = []; let target = null;
        const context = { parent: { $fighter_ctrler: { getTargetSP: () => target, moveToTarget: (...args) => calls.push(args) } } };
        vm.runInNewContext(output.code.replace(/var target\d+:\*/g, "var target1"), context);
        assert.equal(calls.length, 0);
        target = { isInAir: negative };
        vm.runInNewContext(output.code.replace(/var target\d+:\*/g, "var target1"), context);
        assert.equal(calls.length, 0);
        target.isInAir = !negative;
        vm.runInNewContext(output.code.replace(/var target\d+:\*/g, "var target1"), context);
        assert.deepEqual(calls, [[50, 0, true]], text);
        assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(result.graph)))).code, output.code);
    }
    const self = c.generate(c.fromText("检测到自身不在空中时瞬移到身前").graph);
    assert.match(self.code, /getSelf\(\)\.isInAir/);
    assert.doesNotMatch(self.code, /getTargetSP/);
    assert.match(self.code, /moveToTarget\(-50, 0, true\)/);
});

test("teleport defaults and supplied distances follow direction without requiring every parameter", () => {
    for (const verb of ["瞬移到", "移动到", "传送到"]) for (const target of ["", "对方", "目标的"]) {
        for (const [direction, sign] of [["身后", 1], ["背后", 1], ["身前", -1], ["面前", -1]]) {
            for (const distance of ["", "75像素"]) {
                const text = verb + target + direction + distance;
                const output = c.generate(c.fromText(text).graph);
                assert.deepEqual(output.errors, [], text);
                assert.equal(output.code, `parent.$fighter_ctrler.moveToTarget(${sign * (distance ? 75 : 50)}, 0, true);`, text);
            }
        }
    }
    assert.equal(c.generate(c.fromText("移动到对方位置").graph).code, "parent.$fighter_ctrler.moveToTarget(0, 0, true);");
});

test("resource quantities separate absolute points, qi bars and maximum-health percentages", () => {
    for (const phrase of ["减少两格气", "气量减少两格", "减少气量两格"]) {
        assert.equal(c.generate(c.fromText(phrase).graph).code, "parent.$fighter_ctrler.loseQi(200);");
    }
    for (const phrase of ["恢复25%血量", "血量增加25%", "恢复血量25%", "回血25%", "补血25%"]) {
        assert.equal(c.generate(c.fromText(phrase).graph).code, "parent.$fighter_ctrler.addHpPercent(0.25);");
    }
    assert.equal(c.generate(c.fromText("减少25%血量").graph).code, "parent.$fighter_ctrler.loseHpPercent(0.25);");
    assert.equal(c.generate(c.fromText("减少25点气量").graph).code, "parent.$fighter_ctrler.loseQi(25);");
    for (const text of ["恢复150%血量", "伤害增加25%", "减少两格耐力", "恢复25%已损失血量"]) {
        assert.equal(c.generate(c.fromText(text).graph).code, "", text);
    }
    const result = c.fromText("如果自身血量低于50%，减少1格气，恢复25%血量");
    const output = c.generate(result.graph), calls = []; let ratio = .5;
    const context = { parent: { $fighter_ctrler: { getSelf: () => ({ hpRate: ratio }), loseQi: amount => calls.push(["qi", amount]), addHpPercent: value => calls.push(["hp", value]) } } };
    assert.deepEqual(output.errors, []);
    vm.runInNewContext(output.code, context); assert.equal(calls.length, 0);
    ratio = .49; vm.runInNewContext(output.code, context);
    assert.deepEqual(calls, [["qi", 100], ["hp", .25]]);
    assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(result.graph)))).code, output.code);
    assert.match(c.generate(c.fromText("气量不少于两格时恢复10%血量").graph).code, /\.qi >= 200/);
    assert.equal(c.generate(c.fromText("跳到回血100").graph).code, 'parent.$mc_ctrler.gotoAndPlay("回血100");');
});

test("community request wrappers leave the operation intact without swallowing quoted labels", () => {
    for (const prefix of ["帮我", "大佬，帮忙弄一下，", "我想让这招", "麻烦帮我", "求一个"]) {
        for (const suffix of ["，怎么配？", "，能帮我配一下吗？", "，帮我加上。", "，可以做吗？"]) {
            const text = prefix + "消耗25点气量" + suffix;
            assert.ok(c.generate(c.fromText(text).graph).code.endsWith("parent.$fighter_ctrler.loseQi(25);"), text);
        }
    }
    assert.equal(c.generate(c.fromText('帮我跳到“请问怎么写”').graph).code, 'parent.$mc_ctrler.gotoAndPlay("请问怎么写");');
    assert.equal(c.generate(c.fromText("帮我回血20，但是每隔一秒才回，怎么写？").graph).code, "");
});

test("property assignment aliases share the same slots and time quantities keep their units", () => {
    for (const verb of ["设成", "置为", "改到"]) {
        const output = c.generate(c.fromText(`攻击“atk7”伤害${verb}85`).graph);
        assert.match(output.code, /getHitVO\("atk7"\)\.power = 85/);
    }
    assert.match(c.generate(c.fromText("攻击atk7硬直给0.2秒").graph).code, /hurtTime = 200/);
    assert.match(c.generate(c.fromText("攻击atk7硬直设成250毫秒").graph).code, /hurtTime = 250/);
    const frames = c.fromText("攻击atk7硬直给18帧");
    assert.equal(c.generate(frames.graph).code, "");
    assert.match(frames.notes.join(""), /毫秒/);
});

test("numeric timeline frames are not silently converted to action labels", () => {
    for (const text of ["跳到第15帧", "动画播到第12帧就跳到第20帧", "跳到第十帧以后加30耐力"]) {
        const r = c.fromText(text);
        assert.equal(c.generate(r.graph).code, "", text);
        assert.ok(!r.graph.nodes.some(n => ["goFrame", "gotoAndPlay"].includes(n.key) && n.params.name === "第"));
        assert.match(r.notes.join(""), /帧号.*标签/);
    }
    assert.equal(c.generate(c.fromText('跳到“第15帧”').graph).code, 'parent.$mc_ctrler.gotoAndPlay("第15帧");');
});

test("facing an opponent and moving a pixel distance are distinct ordered actions", () => {
    const result = c.generate(c.fromText("人物朝向对手移动40像素，帮我加上").graph);
    assert.deepEqual(result.errors, []);
    const calls = [];
    vm.runInNewContext(result.code, { parent: { $fighter_ctrler: { setDirectToTarget: () => calls.push("face"), moveOnce: (...args) => calls.push(args) } } });
    assert.deepEqual(calls, ["face", [40, 0]]);
    assert.match(c.generate(c.fromText("后退30像素").graph).code, /moveOnce\(-30, 0\)/);
});

test("giving resources and assigning attack attributes have different meanings", () => {
    for (const text of ["给自己100血", "帮我加100血", "麻烦帮我加100点血量"]) {
        assert.equal(c.generate(c.fromText(text).graph).code, "parent.$fighter_ctrler.addHp(100);", text);
    }
    assert.match(c.generate(c.fromText("攻击a9伤害给100").graph).code, /\.power = 100/);
    const ambiguous = c.fromText("血量给100");
    assert.equal(c.generate(ambiguous.graph).code, "");
    assert.match(ambiguous.notes.join(""), /增加.*设为/);
    const cost = c.fromText("这招的气量消耗设成18");
    assert.equal(c.generate(cost.graph).code, "");
    assert.ok(!cost.graph.nodes.some(n => ["setQi", "loseQi"].includes(n.key)));
});

test("explicit action-label introducers and playback modifiers remain outside labels", () => {
    for (const intro of ["动作标签", "帧标签", "标签", "动作"]) for (const mod of ["继续播放", "停止播放"]) {
        const output = c.generate(c.fromText(`跳到${intro}「追击段」${mod}`).graph);
        assert.equal(output.code, `parent.$mc_ctrler.${mod === "继续播放" ? "gotoAndPlay" : "gotoAndStop"}("追击段");`);
    }
    assert.equal(c.generate(c.fromText('跳到“标签继续播放”').graph).code, 'parent.$mc_ctrler.gotoAndPlay("标签继续播放");');
});

test("explicit hit IDs after the event and standalone trailing attack declarations bind by role", () => {
    for (const id of ["A7", "check_4", "K9"]) {
        const result = c.generate(c.fromText(`命中编号 ${id} 的攻击时，让角色恢复20点血`).graph);
        assert.match(result.code, new RegExp('justHit\\("' + id + '", false\\)'));
        assert.match(result.code, /addHp\(20\)/);
        const trailing = c.generate(c.fromText(`这一击的硬直麻烦设成360毫秒，攻击编号 ${id}`).graph);
        assert.ok(trailing.code.includes(`getHitVO("${id}").hurtTime = 360`));
    }
    assert.equal(c.generate(c.fromText("伤害增加10，然后攻击A7伤害增加20，攻击编号B2").graph).code, "");
    assert.equal(c.generate(c.fromText('跳到“攻击编号B2”').graph).code, 'parent.$mc_ctrler.gotoAndPlay("攻击编号B2");');
});

test("colloquial direction-and-distance commands use one displacement rather than movement speed", () => {
    const output = c.generate(c.fromText("朝对手那边冲过去60像素，一次就行").graph);
    assert.deepEqual(output.errors, []);
    assert.ok(output.code.indexOf("setDirectToTarget()") < output.code.indexOf("moveOnce(60, 0)"));
    assert.doesNotMatch(output.code, /\.move\(/);
});

test("label aliases, existing-label introducers and postfix label nouns compose independently", () => {
    for (const verb of ["跳到", "切到", "切去", "转到"]) for (const intro of ["动作标签", "已有标签", "已有的帧标签"]) {
        const output = c.generate(c.fromText(`${verb}${intro}「接续A」标签继续播`).graph);
        assert.equal(output.code, 'parent.$mc_ctrler.gotoAndPlay("接续A");');
    }
    assert.equal(c.generate(c.fromText("把动作跳到已有标签「起手A」，接着播放").graph).code, 'parent.$mc_ctrler.gotoAndPlay("起手A");');
    assert.equal(c.generate(c.fromText('跳到“已有标签继续播”').graph).code, 'parent.$mc_ctrler.gotoAndPlay("已有标签继续播");');
    const draft = c.fromText("跳到动作标签继续播，具体标签之后再说");
    assert.equal(draft.graph.nodes.find(n => n.key === "gotoAndPlay").params.name, "");
    assert.equal(c.generate(draft.graph).code, "");
});

test("bare numbered attack references bind only to attack-property slots", () => {
    const output = c.generate(c.fromText("编号 T4 这一下的攻击力改为145").graph);
    assert.match(output.code, /getHitVO\("T4"\)\.power = 145/);
    assert.equal(c.generate(c.fromText("编号 T4 血量改为145").graph).code, "");
    const hit = c.generate(c.fromText("攻击命中编号M6的时候震屏一下").graph);
    assert.match(hit.code, /if \(.*justHit\("M6", false\)/);
    assert.match(hit.code, /shake\(3, 3, 0\.2\)/);
});

test("gravity switches accept inverted word order while action-frame context stays explicit", () => {
    for (const command of ["关掉重力", "重力关掉", "把重力关闭"]) {
        assert.equal(c.generate(c.fromText(command).graph).code, "parent.$mc_ctrler.isApplyG(false);");
    }
    const frame = c.fromText("施放这个动作时关掉重力");
    assert.match(c.generate(frame.graph).code, /\/\/ 在该动作开始执行的帧中调用\nparent\.\$mc_ctrler\.isApplyG\(false\);/);
    assert.match(frame.notes.join(""), /动作开始.*帧/);
    assert.equal(c.generate(c.fromText("先把重力关掉，结束之后恢复").graph).code, "");
});

test("missing resource quantities create blank required fields rather than invented amounts", () => {
    const result = c.fromText("命中以后加血，数值你帮我定个合适的");
    assert.equal(result.graph.nodes.find(n => n.key === "addHp").params.v, "");
    assert.equal(c.generate(result.graph).code, "");
    assert.match(c.generate(result.graph).errors.join(""), /攻击 ID/);
    assert.equal(c.generate(c.fromText('跳到“加血”').graph).code, 'parent.$mc_ctrler.gotoAndPlay("加血");');
    for (const noun of ["数值", "恢复量", "数量"]) for (const timing of ["以后", "之后", "晚点"]) for (const verb of ["填", "指定", "确定"]) {
        const draft = c.fromText(`命中后加血，${noun}${timing}再${verb}`);
        assert.equal(draft.graph.nodes.find(n => n.key === "addHp").params.v, "");
        assert.equal(c.generate(draft.graph).code, "");
        assert.ok(!draft.notes.some(n => n.includes("尚未识别")));
    }
});

test("explicit code-placement context survives copying and saved-workspace restoration", () => {
    for (const [text, comment, call] of [
        ["我想让这招消耗25点气量，怎么配？", "在该招式执行的帧中调用", "loseQi(25)"],
        ["血量扣45，给我配进受击效果里。", "在受击动作的对应帧中调用", "loseHp(45)"]
    ]) {
        const graph = c.fromText(text).graph, output = c.generate(graph);
        assert.deepEqual(output.errors, []);
        assert.ok(output.code.startsWith("// " + comment + "\n"));
        assert.ok(output.code.includes(call));
        assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(graph)))).code, output.code);
        graph.context = "injected()";
        assert.throws(() => c.validateGraph(graph), /上下文无效/);
    }
    const configuration = c.fromText("麻烦把这招的气量消耗设成18");
    assert.equal(c.generate(configuration.graph).code, "");
    assert.ok(!configuration.graph.nodes.some(n => ["loseQi", "setQi"].includes(n.key)));
});

test("resource recipients stay local to each operation and guarded target actions preserve order", () => {
    const output = c.generate(c.fromText("E6命中时先震屏，再让对面掉12点血").graph);
    assert.deepEqual(output.errors, []);
    const executable = output.code.replace(/var (target\d+):\*/g, "var $1");
    const calls = []; let target = null;
    const context = { parent: {
        $fighter_ctrler: { justHit: () => true, getTargetSP: () => { calls.push("target"); return target; }, loseHp: () => { throw Error("must not damage self"); } },
        $effect_ctrler: { shake: () => calls.push("shake") }
    } };
    vm.runInNewContext(executable, context);
    assert.deepEqual(calls, ["shake", "target"]);
    calls.length = 0; target = { loseHp: v => calls.push(v) };
    vm.runInNewContext(executable, context);
    assert.deepEqual(calls, ["shake", "target", 12]);
    for (const subject of ["对方", "对面", "对手", "敌人", "目标"]) {
        const loss = c.generate(c.fromText(`扣${subject}20点血`).graph);
        assert.match(loss.code, /getTargetSP\(\)/);
        assert.match(loss.code, /target\d+\.loseHp\(20\)/);
        assert.doesNotMatch(loss.code, /\$fighter_ctrler\.loseHp/);
    }
    assert.match(c.generate(c.fromText("给对方回15点血").graph).code, /target\d+\.addHp\(15\)/);
    const unsupported = c.fromText("对方血量设为50");
    assert.equal(c.generate(unsupported.graph).code, "");
    assert.ok(!unsupported.graph.nodes.some(n => n.key === "setHp"));
});

test("turning away from a target does not depend on the previous facing direction", () => {
    const result = c.generate(c.fromText("让人物背对着对手，直接转过去").graph);
    assert.deepEqual(result.errors, []);
    for (const original of [-1, 1]) for (const targetSide of [-1, 1]) {
        let direct = original;
        vm.runInNewContext(result.code, { parent: { $fighter_ctrler: {
            setDirectToTarget: () => { direct = targetSide; }, setDirectReverse: () => { direct *= -1; }
        } } });
        assert.equal(direct, -targetSide);
    }
});

test("frame placement and descriptive targets do not invent labels or timers", () => {
    const frame = c.generate(c.fromText("招式执行到这帧就关重力，代码放当前帧里").graph);
    assert.match(frame.code, /^\/\/ 在该招式执行的帧中调用/);
    assert.match(frame.code, /isApplyG\(false\)/);
    const description = c.fromText("跳到那个追击用的动作标签，名字我回头补");
    assert.equal(description.graph.nodes.find(n => n.key === "gotoAndPlay").params.name, "");
    assert.equal(c.generate(description.graph).code, "");
    assert.equal(c.generate(c.fromText("等到第12帧再关重力").graph).code, "");
    assert.equal(c.generate(c.fromText("动作到已有标签「第二段」就跳过去停住").graph).code, 'parent.$mc_ctrler.gotoAndStop("第二段");');
});

test("unquoted action labels remain data when they resemble resource commands", () => {
    for (const label of ["回血100", "命中回血100", "关重力", "攻击编号A7"]) {
        const output = c.generate(c.fromText("跳到" + label).graph);
        assert.equal(output.code, `parent.$mc_ctrler.gotoAndPlay(${JSON.stringify(label)});`);
    }
    assert.equal(c.generate(c.fromText("跳到回血100并恢复20点血量").graph).code, 'parent.$mc_ctrler.gotoAndPlay("回血100");\n\nparent.$fighter_ctrler.addHp(20);');
});


test("recipient and hit-event roles survive colloquial word order without becoming unconditional", () => {
    for (const self of ["我自己", "自己", "自身", "角色本人"]) {
        const output = c.generate(c.fromText("攻击命中编号 F2 后，" + self + "加11点血").graph);
        assert.deepEqual(output.errors, []);
        assert.match(output.code, /if \(.*justHit\("F2", false\)/);
        assert.match(output.code, /\$fighter_ctrler\.addHp\(11\)/);
        assert.doesNotMatch(output.code, /getTargetSP/);
    }
    for (const recipient of ["对手", "对方", "目标"]) {
        const output = c.generate(c.fromText(recipient + "吃到 H5 这一击以后再扣28血").graph);
        assert.deepEqual(output.errors, []);
        assert.match(output.code, /justHit\("H5", false\)/);
        assert.match(output.code, /target\d+\.loseHp\(28\)/);
        assert.doesNotMatch(output.code, /\$fighter_ctrler\.loseHp/);
        const own = c.generate(c.fromText(recipient + "吃到 H5 这一击以后自己扣28血").graph);
        assert.match(own.code, /\$fighter_ctrler\.loseHp\(28\)/);
        assert.doesNotMatch(own.code, /getTargetSP/);
    }
    const result = c.generate(c.fromText("K6命中就震屏，接着扣对方17点血").graph);
    assert.match(result.code, /^if \(.*justHit\("K6", false\)/);
    assert.ok(result.code.indexOf("shake(") < result.code.indexOf("getTargetSP()"));
    const failed = [];
    vm.runInNewContext(result.code.replace(/var (target\d+):\*/g, "var $1"), {parent: {
        $fighter_ctrler: {justHit: () => false, getTargetSP: () => failed.push("target")},
        $effect_ctrler: {shake: () => failed.push("shake")}
    }});
    assert.deepEqual(failed, []);
    assert.equal(c.generate(c.fromText("让他掉12点血").graph).code, "");
});

test("missing target quantities preserve the receiver instead of drafting self operations", () => {
    for (const recipient of ["对手", "对方", "目标"]) for (const [verb, key] of [["加", "targetAddHp"], ["扣", "targetLoseHp"]]) {
        const draft = c.fromText("命中后给" + recipient + verb + "血");
        assert.equal(draft.graph.nodes.find(n => n.key === key).params.v, "");
        assert.ok(!draft.graph.nodes.some(n => n.key === "addHp" || n.key === "loseHp"));
        assert.equal(c.generate(draft.graph).code, "");
    }
    const pronoun = c.fromText("打中对方就让他掉点血");
    assert.ok(pronoun.graph.nodes.some(n => n.key === "targetLoseHp" && n.params.v === ""));
    assert.ok(pronoun.graph.nodes.some(n => n.key === "justHit" && n.params.hitId === ""));
    assert.equal(c.generate(pronoun.graph).code, "");
    assert.equal(c.generate(c.fromText("给对方加气").graph).code, "");
});

test("placement metadata, attack-property vocabulary and label aliases compose independently", () => {
    const action = c.generate(c.fromText("角色本人气量增加14，帮我接进招式帧里").graph);
    assert.match(action.code, /^\/\/ 在该招式执行的帧中调用\n/);
    assert.match(action.code, /addQi\(14\)/);
    const hurt = c.generate(c.fromText("受击这段动画开头把重力关了").graph);
    assert.match(hurt.code, /^\/\/ 在受击动作的对应帧中调用\n/);
    assert.match(hurt.code, /isApplyG\(false\)/);
    for (const attr of ["威力", "攻击力", "伤害"]) {
        assert.match(c.generate(c.fromText("把攻击 J3 的" + attr + "设到190").graph).code, /getHitVO\("J3"\)\.power = 190/);
    }
    for (const direction of ["背向", "背对", "背对着"]) {
        assert.equal(c.generate(c.fromText("转个身，让人物" + direction + "对手就行").graph).code,
            "parent.$fighter_ctrler.setDirectToTarget();\n\nparent.$fighter_ctrler.setDirectReverse();");
    }
    const empty = c.fromText("跳转到那个动作标签，名字还没定");
    assert.equal(empty.graph.nodes.find(n => n.key === "gotoAndPlay").params.name, "");
    assert.equal(c.generate(empty.graph).code, "");
    assert.ok(!empty.notes.some(n => n.includes("尚未识别")));
    assert.equal(c.generate(c.fromText('跳转到“跳转到回血100”').graph).code, 'parent.$mc_ctrler.gotoAndPlay("跳转到回血100");');
});


function frameScript(code) {
    const body = code.slice(code.indexOf("// 登记一次"));
    return body.replace(/var (\w+):(?:\*|Boolean|int)/g, "var $1").replace(/function (\w+)\(\):void/g, "function $1()");
}

test("old-version action disabling rechecks current resources on every scheduled frame", () => {
    for (const version of ["3.0", "3.3", "3.5", "3.6"]) for (const scheduler of ["delay", "animate"]) {
        const result = c.fromText('耐力不少于20时，禁用“招2”', version);
        const block = result.graph.bubbles[0]; block.scheduler = scheduler; block.frames = 3;
        assert.equal(block.kind, "frame");
        const generated = c.generate(result.graph); assert.deepEqual(generated.errors, []);
        assert.match(generated.code, /getAction\(\)\.zhao2 = null/);
        assert.doesNotMatch(generated.code, /setDisabled\(/);
        let energy = 19; const action = {zhao2:"招2"}, queue=[];
        const owner = {energy:19, delayCall:fn=>queue.push(fn),setAnimateFrameOut:fn=>queue.push(fn)};
        const context={ $self_main:owner, parent:{$mc_ctrler:{getAction:()=>action},$fighter_ctrler:{getEnergy:()=>energy}} };
        vm.runInNewContext(frameScript(generated.code),context);
        assert.equal(action.zhao2,"招2");
        queue.shift()(); assert.equal(action.zhao2,"招2");
        energy=20; owner.energy=20; queue.shift()(); assert.equal(action.zhao2,null);
        action.zhao2="新登记"; queue.shift()(); assert.equal(action.zhao2,null);
        assert.equal(queue.length,0);
    }
});

test("native disabling and continuous conditional disabling retain different lifetimes", () => {
    const once=c.generate(c.fromText('耐力不少于20时，禁用“招2”').graph);
    assert.match(once.code,/setDisabled\("zhao2", function\(\):Boolean/);
    assert.doesNotMatch(once.code,/if \(/);
    assert.doesNotMatch(once.code,/addRenderFunc/);
    const result=c.fromText('逐帧检测耐力不少于20时，禁用“招2”');
    const generated=c.generate(result.graph); assert.deepEqual(generated.errors,[]);
    let energy=19, callback=null; const calls=[];
    const owner={addRenderFunc:fn=>{callback=fn;},removeRenderFunc:fn=>{assert.equal(fn,callback); calls.push("removed");}};
    const action={setDisabled:(key,value)=>calls.push(["disable",key,value]),removeDisabled:key=>calls.push(["enable",key])};
    const context={parent:{$fighter_ctrler:{getSelf:()=>owner,getEnergy:()=>energy},$mc_ctrler:{getAction:()=>action}}};
    vm.runInNewContext(frameScript(generated.code),context);
    callback(); assert.equal(calls.length,0);
    energy=20; callback(); assert.deepEqual(calls.pop(),["disable","zhao2",true]);
    energy=19; callback(); assert.equal(calls.length,0);
    assert.doesNotMatch(generated.code,/frameActive|frameRemaining|removeRenderFunc/);
    const restore=c.generate(c.fromText('解除禁用“招2”').graph);
    assert.match(restore.code,/removeDisabled\("zhao2"\)/); assert.doesNotMatch(restore.code,/setDisabled/);
    const disabledNode=result.graph.nodes.find(n=>n.key === "setDisabled"); disabledNode.params.action="bad()";
    assert.doesNotThrow(()=>c.generate(result.graph)); assert.equal(c.generate(result.graph).code,"");
});

test("frame blocks can omit a condition but incomplete conditional requests never execute", () => {
    const plain=c.fromText("逐帧闪白光"); assert.equal(plain.graph.bubbles[0].condition,null);
    assert.match(c.generate(plain.graph).code,/addRenderFunc/);
    assert.equal(c.generate(c.fromText("每帧如果目标在场，就闪白光").graph).code,"");
    const raw=c.fromText("getAction().zhao2 = null", "3.5");
    assert.equal(raw.graph.bubbles[0].kind,"frame"); assert.deepEqual(c.generate(raw.graph).errors,[]);
    for(const text of ['跳到“getAction().zhao2 = null”','跳到“逐帧闪白光”']) assert.equal(c.fromText(text).graph.bubbles.length,0);
    const manual=c.createGraph(),node=c.addNode(manual,"clearBinding");c.attachPath(manual,node);
    assert.equal(c.generate(manual).code,"");assert.match(c.generate(manual).errors.join(""),/逐帧执行块/);
});

test("cooldown predicates become per-frame checks and never start cooldowns implicitly", () => {
    for(const text of ['冷却“cd1”结束时，闪白光','cd1的冷却结束时，闪白光','冷却cd1结束时，闪白光']) {
        const result=c.fromText(text,"3.0"); const output=c.generate(result.graph);
        assert.deepEqual(output.errors,[]); assert.equal(result.graph.bubbles[0].kind,"frame");
        assert.match(output.code,/CDOK\("cd1"\)/); assert.doesNotMatch(output.code,/setCD\(/);
        const queue=[],calls=[];let ready=false;
        vm.runInNewContext(frameScript(output.code),{$self_main:{delayCall:fn=>queue.push(fn)},parent:{$mc_ctrler:{getAction:()=>({CDOK:()=>ready})},$effect_ctrler:{shine:()=>calls.push("shine")}}});
        queue.shift()();assert.deepEqual(calls,[]); ready=true;queue.shift()();assert.deepEqual(calls,["shine"]);
    }
    const graph=c.createGraph(),block=c.addBubble(graph),node=c.addNode(graph,"CDOK");c.place(graph,node.id,block.id,"condition");assert.equal(block.kind,"frame");
});

test("frame settings round trip, validate schedulers and gate native callbacks by version", () => {
    const graph=c.fromText("每帧闪白光").graph,block=graph.bubbles[0];block.scheduler="animate";block.frames=4;
    const restored=c.validateGraph(JSON.parse(JSON.stringify(graph)));
    assert.equal(c.generate(restored).code,c.generate(graph).code);
    for(const [key,value] of [["scheduler","injected()"],["kind","other"],["frames",-2],["frames",null]]) {
        const bad=JSON.parse(JSON.stringify(graph));bad.bubbles[0][key]=value;assert.throws(()=>c.validateGraph(bad));
    }
    graph.version="3.5";block.scheduler="render";assert.match(c.generate(graph).errors.join(""),/3.8开发/);
    const legacy=c.createGraph(),empty=c.addBubble(legacy);delete empty.kind;delete empty.scheduler;delete empty.frames;
    assert.equal(c.validateGraph(legacy).bubbles[0].kind,"condition");
});

test("new card fields remain literals and preserve version restrictions", () => {
    for(const [key,params,fragment] of [["setDisabled",{action:"zhao2",condition:"30"},'setDisabled("zhao2", 30)'],["removeDisabled",{action:"null"},'removeDisabled(null)'],["fire",{mcName:"波1",params:'{"x":5,"hold":2}'},'fire("波1", {"x":5,"hold":2})'],["writeHitpowerRate",{value:2},'.powerRate = 2']]) {
        const graph=c.createGraph(),node=c.addNode(graph,key,{params});const source=c.attachPath(graph,node);if(source.key==="getHitVO")source.params.id="A1";
        assert.ok(c.generate(graph).code.includes(fragment));
        if(key==="setDisabled") {node.params.condition="fn(); injected()";assert.equal(c.generate(graph).code,"");graph.version="3.5";node.params.condition="true";assert.equal(c.generate(graph).code,"");}
        if(key==="fire"){node.params.params='function(){}';assert.equal(c.generate(graph).code,"");}
    }
});

test("nullable object chains guard intermediate receivers and automatic routing does not switch to owners", () => {
    const graph=c.createGraph(),mc=c.addNode(graph,"mc"),assist=c.addNode(graph,"getAssister"),owner=c.addNode(graph,"assisterOwner_fighter_ctrler"),heal=c.addNode(graph,"addHp",{params:{v:3}});
    c.connect(graph,mc.id,assist.id);c.connect(graph,assist.id,owner.id);c.connect(graph,owner.id,heal.id);
    const result=c.generate(graph);assert.deepEqual(result.errors,[]);
    assert.doesNotThrow(()=>vm.runInNewContext(result.code.replace(/var (target\d+):\*/g,"var $1"),{parent:{$mc_ctrler:{getAssister:()=>null}}}));
    let hp=0;vm.runInNewContext(result.code.replace(/var (target\d+):\*/g,"var $1"),{parent:{$mc_ctrler:{getAssister:()=>({owner_fighter_ctrler:{addHp:v=>hp+=v}})}}});assert.equal(hp,3);
});


test("multiple conditions support AND, OR and explicit top-to-bottom grouping", () => {
    const r=c.fromText("耐力不少于20或血量低于300且气量不少于100时，闪白光"), g=c.generate(r.graph);
    assert.deepEqual(g.errors,[]);assert.equal(c.conditionsOf(r.graph.bubbles[0]).length,3);
    for (const energy of [10,30]) for (const hp of [100,500]) for (const qi of [0,100]) {
        let calls=0;vm.runInNewContext(g.code,{parent:{$fighter_ctrler:{getEnergy:()=>energy,getSelf:()=>({hp,qi})},$effect_ctrler:{shine:()=>calls++}}});
        assert.equal(calls,Number((energy>=20 || hp<300) && qi>=100));
    }
    const and=c.fromText("耐力不少于20且血量低于300时，闪白光");assert.match(c.generate(and.graph).code,/ >= 20 && /);
    const bad=c.fromText("耐力不少于20血量低于300时，闪白光");assert.equal(c.generate(bad.graph).code,"");
    const block=and.graph.bubbles[0],first=block.condition,second=block.extraConditions[0].id;
    c.detach(and.graph,first);assert.equal(block.condition,second);assert.equal(block.extraConditions.length,0);
});

test("logical operators short circuit nullable reads inside their own operands", () => {
    const graph=c.createGraph(),block=c.addBubble(graph),energy=c.addNode(graph,"getEnergy"),air=c.addNode(graph,"targetIsInAir"),shine=c.addNode(graph,"shine");
    [energy,air,shine].forEach(n=>c.attachPath(graph,n));c.place(graph,energy.id,block.id,"condition");c.updateCondition(graph,block.id,energy.id,{operator:">=",value:"20"});c.place(graph,air.id,block.id,"condition");c.place(graph,shine.id,block.id,"actions");
    for(const join of ["and","or"]) for(const amount of [10,30]) for(const target of [null,{isInAir:true}]) {
        c.updateCondition(graph,block.id,air.id,{join});const output=c.generate(graph);assert.deepEqual(output.errors,[]);
        let reads=0,calls=0;vm.runInNewContext(output.code.replace(/var (target\d+):\*/g,"var $1").replace(/function\(\):Boolean/g,"function()"),{parent:{$fighter_ctrler:{getEnergy:()=>amount,getTargetSP:()=>{reads++;return target;}},$effect_ctrler:{shine:()=>calls++}}});
        const skipped=join==="and" ? amount<20 : amount>=20;assert.equal(reads,skipped?0:1);
        assert.equal(calls,Number(join==="and" ? amount>=20 && !!target : amount>=20 || !!target));
    }
});

test("frame blocks contain nested condition blocks without registering callbacks every frame", () => {
    const graph=c.createGraph(),frame=c.addBubble(graph,{kind:"frame",frames:2}),condition=c.addBubble(graph),value=c.addNode(graph,"getEnergy"),shine=c.addNode(graph,"shine");
    [value,shine].forEach(n=>c.attachPath(graph,n));c.place(graph,value.id,condition.id,"condition");c.updateCondition(graph,condition.id,value.id,{operator:">=",value:"20"});c.place(graph,shine.id,condition.id,"actions");c.place(graph,condition.id,frame.id,"actions");
    const output=c.generate(graph);assert.deepEqual(output.errors,[]);assert.equal((output.code.match(/addRenderFunc\(/g)||[]).length,1);
    let callback,energy=10,calls=0,removed=0;const host={addRenderFunc:fn=>callback=fn,removeRenderFunc:fn=>{assert.equal(fn,callback);removed++;}};
    vm.runInNewContext(frameScript(output.code),{parent:{$fighter_ctrler:{getSelf:()=>host,getEnergy:()=>energy},$effect_ctrler:{shine:()=>calls++}}});
    callback();assert.equal(calls,0);energy=30;callback();assert.equal(calls,1);assert.equal(removed,1);
    assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(graph)))).code,output.code);
    assert.throws(()=>c.place(graph,frame.id,condition.id,"actions"),/自身|子块/);
    const otherFrame=c.addBubble(graph,{kind:"frame"});assert.throws(()=>c.place(graph,otherFrame.id,condition.id,"actions"),/逐帧/);
    c.remove(graph,condition.id);assert.equal(shine.container,frame.id);assert.ok(frame.actions.includes(shine.id));
});

test("nested blocks and extra conditions reject corrupt saved references and cycles", () => {
    const graph=c.fromText("耐力不少于20且血量低于300时，闪白光").graph;
    const restored=c.validateGraph(JSON.parse(JSON.stringify(graph)));assert.equal(c.conditionsOf(restored.bubbles[0]).length,2);
    const duplicate=JSON.parse(JSON.stringify(graph));duplicate.bubbles[0].extraConditions[0].id=duplicate.bubbles[0].condition;assert.throws(()=>c.validateGraph(duplicate),/多个区域/);
    const invalid=JSON.parse(JSON.stringify(graph));invalid.bubbles[0].extraConditions[0].join="xor";assert.throws(()=>c.validateGraph(invalid),/条件配置/);
    const loop=c.createGraph(),a=c.addBubble(loop),b=c.addBubble(loop);a.actions=[b.id];b.actions=[a.id];assert.throws(()=>c.validateGraph(loop),/嵌套循环/);assert.equal(c.generate(loop).code,"");
});

test("unlimited frames use -1 and omit all counter and automatic ending branches", () => {
    for(const scheduler of ["render","delay","animate"]) {
        const graph=c.fromText("每帧闪白光").graph;assert.equal(graph.bubbles[0].frames,-1);graph.bubbles[0].scheduler=scheduler;
        const output=c.generate(graph);assert.deepEqual(output.errors,[]);assert.doesNotMatch(output.code,/frameRemaining|frameActive|removeRenderFunc|return;/);
        if(scheduler!=="render")assert.match(output.code,/(?:delayCall|setAnimateFrameOut)\(updateFrame1, 1\)/);
        const legacy=JSON.parse(JSON.stringify(graph));delete legacy.revision;legacy.bubbles[0].frames=0;assert.equal(c.validateGraph(legacy).bubbles[0].frames,-1);
        const draft=JSON.parse(JSON.stringify(graph));draft.bubbles[0].frames=0;const restored=c.validateGraph(draft);assert.equal(restored.bubbles[0].frames,0);assert.equal(c.generate(restored).code,"");
    }
    const old=c.generate(c.fromText("每帧闪白光","3.0").graph);assert.equal(old.code.split("\n")[0],fs.readFileSync(path.resolve(__dirname,"../zh-cn/core-object-classes/FighterMain.md"),"utf8").match(/^function get \$self_main.*$/m)[0]);
});

test("legacy conditional disabling migrates to a native predicate without redundant wrappers", () => {
    const graph=c.createGraph(),frame=c.addBubble(graph,{kind:"frame",releaseDisabled:true}),value=c.addNode(graph,"getEnergy"),disable=c.addNode(graph,"setDisabled");
    [value,disable].forEach(n=>c.attachPath(graph,n));c.place(graph,value.id,frame.id,"condition");c.updateCondition(graph,frame.id,value.id,{operator:">=",value:"20"});c.place(graph,disable.id,frame.id,"actions");
    graph.revision=2;
    const restored=c.validateGraph(JSON.parse(JSON.stringify(graph)));
    assert.equal(restored.revision,3);assert.equal(restored.bubbles.length,0);
    assert.equal(c.nodeById(restored,disable.id).release.negate,true);
    let energy=30,predicate;const actions={setDisabled:(key,fn)=>predicate=fn};
    const output=c.generate(restored);assert.deepEqual(output.errors,[]);assert.doesNotMatch(output.code,/removeDisabled/);
    vm.runInNewContext(output.code.replace(/function\(\):Boolean/g,"function()"),{parent:{$fighter_ctrler:{getEnergy:()=>energy},$mc_ctrler:{getAction:()=>actions}}});
    assert.equal(predicate(),true);energy=10;assert.equal(predicate(),false);
    assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(restored)))).code,output.code);
});


test("community action aliases share canonical bindings across case and directional notation", () => {
    for (const [names,member] of [[["zh2","ZH2","zhao2","ZHAO2","su","SU","↓u","↓+U"],"zhao2"],[["sj","SJ","↓j","↓+J","skill1"],"skill1"],[["zh1","u"],"zhao1"],[["zh3","wu","↑u"],"zhao3"],[["wj","↑j"],"skill2"]]) {
        for (const name of names) {
            const result=c.generate(c.fromText("禁用"+name).graph);assert.deepEqual(result.errors,[]);assert.ok(result.code.includes('setDisabled("'+member+'", true)'));
            const restore=c.generate(c.fromText("解除禁用"+name).graph);assert.ok(restore.code.includes('removeDisabled("'+member+'")'));assert.doesNotMatch(restore.code,/setDisabled/);
            const old=c.generate(c.fromText("禁用"+name,"3.5").graph);assert.deepEqual(old.errors,[]);assert.ok(old.code.includes('.'+member+' = null'));
        }
    }
});

test("binding aliases also work in registration requests without rewriting labels or attack IDs", () => {
    for(const alias of ["sj","↓j","↓+J","skill1"]) assert.match(c.generate(c.fromText("设置"+alias+"纽带").graph).code,/setSkill1\("砍技1"\)/);
    for(const alias of ["zh2","zhao2","↓u","su"]) assert.match(c.generate(c.fromText("设置"+alias+"纽带").graph).code,/setZhao2\("招2"\)/);
    for(const label of ["zh2","sj","↓j","禁用zh2"]) assert.equal(c.generate(c.fromText('跳到“'+label+'”').graph).code,'parent.$mc_ctrler.gotoAndPlay('+JSON.stringify(label)+');');
    assert.match(c.generate(c.fromText("攻击zh2伤害改成30").graph).code,/getHitVO\("zh2"\)\.power = 30/);
    for(const name of ["zh20","zhao2_atm","sj1"]) assert.equal(c.generate(c.fromText("禁用"+name).graph).code,"");
});


test("library searches can expand action aliases without changing unrelated identifiers", () => {
    for (const [query,term] of [["zh2","zhao2"],["sj","skill1"],["↓j","skill1"],["↓+J","skill1"],["kj","attackAIR"]]) assert.ok(c.aliasTerms(query).includes(term));
    assert.deepEqual(c.aliasTerms("zh2_atm"),[]);
});


test("frame stop predicates run before the body and end all three scheduling strategies", () => {
    for (const scheduler of ["delay","animate","render"]) for (const finite of [-1,5]) {
        const graph=c.fromText("每帧闪白光").graph,block=graph.bubbles[0],value=c.addNode(graph,"getEnergy");c.attachPath(graph,value);
        block.scheduler=scheduler;block.frames=finite;c.place(graph,value.id,block.id,"condition");c.updateCondition(graph,block.id,value.id,{operator:">=",value:"20"});
        let energy=10,flashes=0,callback=null;const queue=[],host={delayCall:fn=>queue.push(fn),setAnimateFrameOut:fn=>queue.push(fn),addRenderFunc:fn=>callback=fn,removeRenderFunc:fn=>{assert.equal(fn,callback);callback=null;}};
        const output=c.generate(graph);assert.deepEqual(output.errors,[]);
        vm.runInNewContext(frameScript(output.code),{parent:{$fighter_ctrler:{getSelf:()=>host,getEnergy:()=>energy},$effect_ctrler:{shine:()=>flashes++}}});
        const tick=()=>scheduler === "render" ? callback() : queue.shift()();
        tick();assert.equal(flashes,1);energy=20;tick();assert.equal(flashes,1);
        assert.equal(scheduler === "render" ? callback : queue.length,scheduler === "render" ? null : 0);
        assert.doesNotMatch(output.code,/removeDisabled/);
    }
});

test("render callback branches preserve animation, object logic and permanent global parameters", () => {
    for (const [mode,expected] of [["animation",undefined],["logic",{isFollowFps:true}],["global",{isFollowFps:true,isPermanent:true}]]) {
        const graph=c.fromText("每帧闪白光").graph;graph.bubbles[0].renderMode=mode;
        let params;const host={addRenderFunc:(fn,p)=>params=p};
        vm.runInNewContext(frameScript(c.generate(graph).code),{parent:{$fighter_ctrler:{getSelf:()=>host}}});
        assert.deepEqual(params && JSON.parse(JSON.stringify(params)),expected);
        const saved=c.validateGraph(JSON.parse(JSON.stringify(graph)));assert.equal(saved.bubbles[0].renderMode,mode);
    }
    const graph=c.fromText("每帧闪白光").graph;graph.bubbles[0].renderMode="invalid";
    assert.equal(c.generate(graph).code,"");assert.throws(()=>c.validateGraph(graph),/回调分支/);
});

test("disable-card release conditions use the native function parameter without a frame loop", () => {
    const graph=c.createGraph(),disable=c.addNode(graph,"setDisabled"),value=c.addNode(graph,"getEnergy");[disable,value].forEach(n=>c.attachPath(graph,n));
    disable.release={conditions:[{id:value.id,operator:"<",value:"20",join:"and"}],negate:false};
    let energy=30,predicate;const context={parent:{$fighter_ctrler:{getEnergy:()=>energy},$mc_ctrler:{getAction:()=>({setDisabled:(key,fn)=>predicate=fn})}}};
    const output=c.generate(graph);assert.deepEqual(output.errors,[]);assert.doesNotMatch(output.code,/addRenderFunc|removeDisabled|var value/);
    vm.runInNewContext(output.code.replace(/function\(\):Boolean/g,"function()"),context);assert.equal(predicate(),true);energy=10;assert.equal(predicate(),false);
    assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(graph)))).code,output.code);
    const bad=JSON.parse(JSON.stringify(graph));bad.nodes[0].release.conditions[0].id="missing";assert.throws(()=>c.validateGraph(bad),/解除条件/);
    c.remove(graph,value.id);assert.equal(c.generate(graph).code,"");assert.doesNotThrow(()=>c.validateGraph(graph));
});


test("redundant frame stopping and native release compile to one guarded predicate", () => {
    const graph=c.createGraph(),frame=c.addBubble(graph,{kind:"frame"}),value=c.addNode(graph,"targetIsInAir"),disable=c.addNode(graph,"setDisabled");
    [value,disable].forEach(n=>c.attachPath(graph,n));c.place(graph,value.id,frame.id,"condition");c.place(graph,disable.id,frame.id,"actions");
    disable.release={conditions:c.conditionsOf(frame).map(r=>({...r})),negate:false};
    const before=JSON.stringify(graph),output=c.generate(graph);assert.deepEqual(output.errors,[]);assert.equal(JSON.stringify(graph),before);
    assert.doesNotMatch(output.code,/addRenderFunc|removeRenderFunc|updateFrame|if \(/);assert.equal((output.code.match(/getTargetSP\(\)/g)||[]).length,1);
    let target=null,predicate,calls=0;const context={parent:{$fighter_ctrler:{getTargetSP:()=>target},$mc_ctrler:{getAction:()=>({setDisabled:(key,fn)=>{calls++;predicate=fn;}})}}};
    vm.runInNewContext(output.code.replace(/function\(\):Boolean/g,"function()").replace(/var (\w+):\*/g,"var $1"),context);
    assert.equal(calls,1);assert.equal(predicate(),true);target={isInAir:false};assert.equal(predicate(),true);target.isInAir=true;assert.equal(predicate(),false);
    frame.frames=10;assert.match(c.generate(graph).code,/updateFrame/);frame.frames=-1;
    disable.release.negate=true;assert.match(c.generate(graph).code,/updateFrame/);disable.release.negate=false;
    const shine=c.addNode(graph,"shine");c.attachPath(graph,shine);c.place(graph,shine.id,frame.id,"actions");assert.match(c.generate(graph).code,/updateFrame/);
    c.remove(graph,shine.id);c.simplifyDisabledBlocks(graph);assert.equal(graph.bubbles.length,0);assert.equal(disable.container,null);
    assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(graph)))).code,output.code);
});

test("new frame blocks default to the parameterless animation callback", () => {
    const graph=c.fromText("每帧闪白光").graph;assert.equal(graph.bubbles[0].renderMode,"animation");
    assert.match(c.generate(graph).code,/addRenderFunc\(updateFrame1\);$/);
    delete graph.bubbles[0].renderMode;assert.equal(c.validateGraph(graph).bubbles[0].renderMode,"animation");
    graph.bubbles[0].renderMode="logic";assert.match(c.generate(c.validateGraph(graph)).code,/isFollowFps:true/);
});


test("natural-language state-based disabling configures one native lifetime predicate", () => {
    for(const text of ["血量低于100时禁用su","生命值不足100时禁用zh2","如果血量小于100，禁用↓u"]) {
        const result=c.fromText(text),output=c.generate(result.graph);
        assert.deepEqual(output.errors,[]);assert.equal(result.graph.bubbles.length,0);assert.doesNotMatch(output.code,/if \(|addRenderFunc|updateFrame/);
        let calls=0,predicate;const main={hp:50};
        vm.runInNewContext(output.code.replace(/function\(\):Boolean/g,"function()"),{parent:{$fighter_ctrler:{getSelf:()=>main},$mc_ctrler:{getAction:()=>({setDisabled:(key,fn)=>{assert.equal(key,"zhao2");calls++;predicate=fn;}})}}});
        assert.equal(calls,1);assert.equal(predicate(),true);main.hp=100;assert.equal(predicate(),false);
        assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(result.graph)))).code,output.code);
    }
    const combined=c.generate(c.fromText("如果血量低于100或者自身在空中，禁用su").graph);
    assert.match(combined.code,/hp < 100 \|\| .*isInAir/);assert.doesNotMatch(combined.code,/if \(/);
    const multiple=c.fromText("耐力不少于20时，禁用zh2并禁用sj");assert.deepEqual(c.generate(multiple.graph).errors,[]);assert.equal(multiple.graph.bubbles.length,0);
    assert.equal((c.generate(multiple.graph).code.match(/setDisabled\(/g)||[]).length,2);
});

test("native predicate selection preserves explicit polling, event triggers, mixed actions and old versions", () => {
    for(const text of ["每帧检测血量低于100时禁用su","攻击k1命中后禁用su","血量低于100时禁用su并闪白光"]) {
        const result=c.fromText(text),output=c.generate(result.graph);assert.deepEqual(output.errors,[]);assert.ok(result.graph.bubbles.length);assert.match(output.code,/if \(/);assert.doesNotMatch(output.code,/function\(\):Boolean/);
    }
    const old=c.generate(c.fromText("血量低于100时禁用su","3.5").graph);assert.match(old.code,/delayCall/);assert.match(old.code,/zhao2 = null/);assert.doesNotMatch(old.code,/setDisabled/);
    const plain=c.generate(c.fromText("禁用su").graph);assert.match(plain.code,/setDisabled\("zhao2", true\)/);
});


test("library search includes wrappers, member names and qualified owners", () => {
    const keys=c.searchSpecs("跳帧","character","3.8开发").map(s=>s.key);
    for(const key of ["goFrame","gotoAndPlay","gotoAndStop","loop","justHitToPlay","assisterGotoAndPlay","attackerGotoAndStop"]) assert.ok(keys.includes(key),key);
    assert.ok(c.searchSpecs("FighterMcCtrler.gotoAndPlay","character","3.8开发").some(s=>s.key === "gotoAndPlay"));
    assert.ok(c.searchSpecs("goFrame","character","3.8开发").some(s=>s.key === "loop"));
    assert.ok(c.searchSpecs("isApplyG","character","3.8开发").some(s=>s.key === "isApplyG"));
    assert.ok(c.searchSpecs("逐帧","character","3.8开发").some(s=>s.key === "setAnimateFrameOut"));
    assert.ok(!c.searchSpecs("fighter","assister","3.8开发").some(s=>s.key === "fighter"));
});

test("quoted and unquoted Chinese binding names register actions without consuming literal jump labels", () => {
    for(const slot of ['招2','“招2”','"招2"','su','“su”']) {
        const graph=c.fromText("气量不少于150时，获得"+slot+"纽带").graph,output=c.generate(graph);
        assert.deepEqual(output.errors,[]);let qi=149,calls=0;
        const context={parent:{$fighter_ctrler:{getSelf:()=>({qi})},$mc_ctrler:{setZhao2:label=>{assert.equal(label,"招2");calls++;}}}};
        vm.runInNewContext(output.code,context);assert.equal(calls,0);qi=150;vm.runInNewContext(output.code,context);assert.equal(calls,1);
    }
    for(const [slot,method] of [["招1","setZhao1"],["招3","setZhao3"],["砍技1","setSkill1"]]) assert.ok(c.generate(c.fromText("获得“"+slot+"”纽带").graph).code.includes(method));
    for(const label of ["招2","获得招2纽带","砍技1"]) assert.equal(c.generate(c.fromText('跳到“'+label+'”').graph).code,'parent.$mc_ctrler.gotoAndPlay('+JSON.stringify(label)+');');
});


test("showcase examples describe executable capabilities for their logical owner", () => {
    for(const actor of ["character","assister","attacker"]) for(const version of c.versions) for(const [label,text] of c.demoExamples(actor,version)) {
        assert.doesNotMatch(text,/求|请问|大佬|咋/);const result=c.fromText(text,version,actor),output=c.generate(result.graph);
        assert.deepEqual(output.errors,[],actor+" "+version+" "+label);assert.ok(output.code,text);assert.equal(result.graph.actor,actor);
    }
    assert.ok(c.demoExamples("character").length >= 6);
});


test("numeric intervals support all open and closed bounds and read the value once", () => {
    for(const includeLower of [true,false]) for(const includeUpper of [true,false]) {
        const graph=c.fromText("血量低于500时，闪白光").graph,block=graph.bubbles[0],range={lower:"100",upper:"200",includeLower,includeUpper};
        c.updateCondition(graph,block.id,block.condition,{operator:"between",value:JSON.stringify(range)});
        const output=c.generate(graph);assert.deepEqual(output.errors,[]);
        for(const hp of [99,100,150,200,201]) {
            let reads=0,hits=0;const main={get hp(){reads++;return hp;}};
            vm.runInNewContext(output.code.replace(/var (\w+):Number/g,"var $1"),{parent:{$fighter_ctrler:{getSelf:()=>main},$effect_ctrler:{shine:()=>hits++}}});
            assert.equal(reads,1);assert.equal(hits,Number((includeLower ? hp>=100 : hp>100) && (includeUpper ? hp<=200 : hp<200)));
        }
        assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(graph)))).code,output.code);
        range.lower="300";c.updateCondition(graph,block.id,block.condition,{value:JSON.stringify(range)});assert.equal(c.generate(graph).code,"");
        range.lower="";c.updateCondition(graph,block.id,block.condition,{value:JSON.stringify(range)});assert.equal(c.generate(graph).code,"");
    }
});

test("interval phrases express boundary inclusion, percentages and native disable lifetimes", () => {
    for(const [ends,lower,upper] of [["",">=","<="],["（含下限，不含上限）",">=","<"],["（不含下限，含上限）",">","<="],["（不含两端）",">","<"]]) {
        const result=c.fromText("血量介于100到200之间"+ends+"时，闪白光"),output=c.generate(result.graph);
        assert.deepEqual(result.notes,[]);assert.deepEqual(output.errors,[]);assert.ok(output.code.includes("rangeValue1 "+lower+" 100 && rangeValue1 "+upper+" 200"));
    }
    const graph=c.fromText("血量介于10%到30%之间（不含两端）时禁用su").graph,output=c.generate(graph);
    assert.deepEqual(output.errors,[]);assert.match(output.code,/setDisabled/);assert.match(output.code,/hpRate/);assert.match(output.code,/> 0.1.*< 0.3/);
    assert.equal(c.generate(c.validateGraph(JSON.parse(JSON.stringify(graph)))).code,output.code);
    for(const text of ["耐力介于10%到20%时，闪白光","血量介于10点到20%时，闪白光","血量介于100到200之间（含中间）时，闪白光"]) assert.equal(c.generate(c.fromText(text).graph).code,"");
});


test("interval recognition composes optional introductions, range synonyms and explicit endpoints", () => {
    for(const intro of ["","在","处于","位于","落在","范围为","数值在"]) for(const [separator,suffix] of [["到","之间"],["至","范围内"],["～","区间"],["-",""]]) {
        const text="血量"+intro+"20"+separator+"50"+suffix+"（含下限，不含上限）时，闪白光",result=c.fromText(text),output=c.generate(result.graph);
        assert.deepEqual(output.errors,[],text);assert.deepEqual(result.notes,[],text);assert.match(output.code,/>= 20 && rangeValue1 < 50/);
    }
    const chinese=c.generate(c.fromText("耐力在二十至五十之间时，跳到“招2”").graph);assert.match(chinese.code,/getEnergy/);assert.match(chinese.code,/>= 20 && rangeValue1 <= 50/);
    const percent=c.generate(c.fromText("血量10%到20%之间时禁用su").graph);assert.match(percent.code,/hpRate/);assert.match(percent.code,/>= 0.1 && rangeValue1 <= 0.2/);
    for(const text of ["20到50之间时闪白光","血量在20到之间时闪白光","血量增加20到50时闪白光"]) assert.equal(c.generate(c.fromText(text).graph).code,"");
    for(const label of ["血量20到50之间","耐力在二十至五十之间"]) assert.equal(c.generate(c.fromText('跳到“'+label+'”').graph).code,'parent.$mc_ctrler.gotoAndPlay('+JSON.stringify(label)+');');
});
