(function (root, factory) {
    var language = typeof module === "object" && module.exports ? require("./composer-language.js") : root.BvnComposerLanguage;
    var api = factory(language);
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.BvnComposer = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function (language) {
    "use strict";

    // Update the composer.html asset versions with each demo release
    var demoVersion = "0.6.1";
    var versions = ["3.0", "3.3", "3.5", "3.6", "3.8开发"];
    var fighterDoc = "zh-cn/main-fighter-ctrlers/FighterCtrler";
    var mcDoc = "zh-cn/main-fighter-ctrlers/FighterMcCtrler";
    var mainDoc = "zh-cn/core-object-classes/FighterMain";
    var modelDoc = "zh-cn/data-model-classes/FighterHitModel";
    var effectDoc = "zh-cn/main-fighter-ctrlers/FighterEffectCtrl";
    var assisterDoc = "zh-cn/other-ctrlers/AssisiterCtrler";
    var attackerDoc = "zh-cn/other-ctrlers/FighterAttackerCtrler";
    var actors = {
        character: { label: "人物", roots: ["fighter", "mc", "effect"] },
        assister: { label: "辅助", roots: ["assister"] },
        attacker: { label: "攻击对象", roots: ["attacker"] }
    };
    var contexts = { actionStart: "在该动作开始执行的帧中调用", actionFrame: "在该招式执行的帧中调用", hurtFrame: "在受击动作的对应帧中调用" };
    function field(key, label, type, value, required) {
        return { key: key, label: label, type: type, value: value, required: !!required };
    }
    var specs = [
        { key: "fighter", label: "Fighter 控制器", kind: "root", output: "FighterCtrler", code: "parent.$fighter_ctrler", doc: fighterDoc, words: "人物 起点" },
        { key: "mc", label: "Mc 控制器", kind: "root", output: "FighterMcCtrler", code: "parent.$mc_ctrler", doc: mcDoc, words: "动作 起点" },
        { key: "main", label: "人物主体", kind: "root", output: "FighterMain", code: "$self_main", doc: mainDoc, words: "人物 当前属性 起点" },
        { key: "getMcCtrl", label: "取得 Mc 控制器", kind: "object", owner: "FighterCtrler", output: "FighterMcCtrler", doc: fighterDoc },
        { key: "getFighterMc", label: "取得人物 MC", kind: "object", owner: "FighterMcCtrler", output: "FighterMC", doc: mcDoc },
        { key: "getMC", label: "取得人物 MC", kind: "object", owner: "FighterMain", output: "FighterMC", doc: mainDoc },
        { key: "getSelf", label: "取得人物主体", kind: "object", owner: "FighterCtrler", output: "FighterMain", since: "3.8开发", doc: fighterDoc },
        { key: "getEffectCtrl", label: "取得特效控制器", kind: "object", owner: "FighterCtrler", output: "FighterEffectCtrl", doc: fighterDoc },
        { key: "hitModel", label: "取得攻击模型", kind: "object", owner: "FighterCtrler", output: "FighterHitModel", property: true, doc: fighterDoc },
        { key: "getHitVO", label: "取得攻击配置", kind: "object", owner: "FighterHitModel", output: "HitVO", doc: modelDoc, fields: [field("id", "攻击 ID", "String", "", true)], words: "攻击面 伤害 攻击力 配置" },
        { key: "getEnergy", label: "读取当前耐力", kind: "value", owner: "FighterCtrler", output: "Number", since: "3.6", doc: fighterDoc, words: "体力 条件 不少于" },
        { key: "energy", label: "读取当前耐力", kind: "value", owner: "FighterMain", output: "Number", property: true, doc: mainDoc, words: "体力 条件" },
        { key: "hp", label: "读取当前血量", kind: "value", owner: "FighterMain", output: "int", property: true, doc: "zh-cn/abstract-interface-classes/BaseGameSprite", words: "生命 生命值 条件" },
        { key: "isInAir", label: "是否在空中", kind: "value", owner: "FighterMain", output: "Boolean", property: true, doc: "zh-cn/abstract-interface-classes/BaseGameSprite", words: "空中 条件" },
        { key: "getEnergyOverload", label: "是否耐力过载", kind: "value", owner: "FighterCtrler", output: "Boolean", since: "3.6", doc: fighterDoc, words: "过载 条件" },
        { key: "getCurAction", label: "读取当前动作标签", kind: "value", owner: "FighterMcCtrler", output: "String", doc: mcDoc, words: "动作 条件 帧标签" },
        { key: "goFrame", label: "跳转动作", kind: "action", owner: "FighterMC", output: "void", doc: "zh-cn/core-object-classes/FighterMC", fields: [field("name", "帧标签", "String", "", true), field("isPlay", "跳转后播放", "Boolean", true), field("playFrame", "播放后停止的帧数（0 为持续播放）", "int", 0)], words: "跳到 跳帧 播放 切换 停止" },
        { key: "addHp", label: "恢复血量", kind: "action", owner: "FighterCtrler", output: "void", doc: fighterDoc, fields: [field("v", "增加的血量", "Number", 100, true)], words: "回复 增加 生命值" },
        { key: "setHp", member: "hp", label: "设置当前血量", kind: "action", owner: "FighterMain", output: "void", assignment: true, doc: "zh-cn/abstract-interface-classes/BaseGameSprite", anchor: "hp", fields: [field("value", "血量", "int", 100, true)], words: "修改 生命值" },
        { key: "setPower", member: "power", label: "修改攻击力", kind: "action", owner: "HitVO", output: "void", assignment: true, doc: "zh-cn/data-model-classes/HitVO", anchor: "power", fields: [field("value", "攻击力", "Number", 50, true)], words: "攻击面 伤害" },
        { key: "shine", label: "闪光", kind: "action", owner: "FighterEffectCtrl", output: "void", doc: effectDoc, fields: [field("color", "颜色（十六进制）", "uint", "0xffffff", true)], words: "白光 红光 特效" },
        { key: "shake", label: "震屏", kind: "action", owner: "FighterEffectCtrl", output: "void", doc: effectDoc, fields: [field("x", "水平强度", "Number", 3, true), field("y", "竖直强度", "Number", 3, true), field("time", "持续时间（秒）", "Number", 0.2, true)], words: "震动 抖动 特效" }
    ];
    ["gotoAndPlay", "gotoAndStop"].forEach(function (key) {
        specs.push({ key: key, label: key === "gotoAndPlay" ? "跳转并播放" : "跳转并停止", kind: "action", owner: "FighterMcCtrler", output: "void", fields: [field("name", "帧标签", "String", "", true)], doc: mcDoc });
    });
    specs.push({ key: "isApplyG", semantic: "setApplyG", characterKey: "isApplyG", label: "设置是否受重力影响", kind: "action", owner: "FighterMcCtrler", output: "void", fields: [field("value", "受重力影响", "Boolean", false)], doc: mcDoc });
    specs.push({ key: "moveOnce", label: "按朝向移动一次", kind: "action", owner: "FighterCtrler", output: "void", fields: [field("x", "水平位移", "Number", 0), field("y", "竖直位移", "Number", 0)], doc: fighterDoc });
    specs.push({ key: "getTargetSP", label: "取得对方游戏对象", kind: "object", owner: "FighterCtrler", output: "IGameSprite", doc: fighterDoc });
    [["targetAddHp", "addHp", "增加对方血量"], ["targetLoseHp", "loseHp", "减少对方血量"]].forEach(function (item) {
        specs.push({ key: item[0], member: item[1], anchor: item[1].toLowerCase(), label: item[2], kind: "action", owner: "IGameSprite", output: "void", dynamicOwner: true, fields: [field("v", "血量", "Number", "", true)], doc: "zh-cn/abstract-interface-classes/BaseGameSprite" });
    });
    specs.push({ key: "targetIsInAir", member: "isInAir", anchor: "isinair", label: "对方是否在空中", kind: "value", owner: "IGameSprite", output: "Boolean", property: true, dynamicOwner: true, doc: "zh-cn/abstract-interface-classes/BaseGameSprite" });
    ["addHpPercent", "loseHpPercent"].forEach(function (key) {
        specs.push({ key: key, label: key === "addHpPercent" ? "按比例恢复血量" : "按比例减少血量", kind: "action", owner: "FighterCtrler", output: "void", fields: [Object.assign(field("v", "最大血量比例（0～1）", "Number", .25, true), { min: 0, max: 1 })], doc: fighterDoc });
    });
    specs.push({ key: "getTargetState", label: "读取对方状态", kind: "value", owner: "FighterCtrler", output: "int", doc: fighterDoc });
    specs.push({ key: "actionState", label: "读取自身状态", kind: "value", owner: "FighterMain", output: "int", property: true, doc: mainDoc });
    specs.push({ key: "setHitTarget", label: "登记碰撞触发动作", kind: "action", owner: "FighterMcCtrler", output: "void", fields: [field("checker", "待检测对象名称", "String", "", true), field("action", "碰撞后的动作标签", "String", "", true)], doc: mcDoc });
    specs.push({ key: "justHitToPlay", label: "命中后播放动作", kind: "action", owner: "FighterMcCtrler", output: "void", fields: [field("hitid", "攻击 ID", "String", "", true), field("frame", "命中后的动作标签", "String", "", true), field("noIdle", "未命中时回到站立", "Boolean", false), field("inCludeDefense", "计入被防御的命中", "Boolean", false)], doc: mcDoc });
    var baseDoc = "zh-cn/abstract-interface-classes/BaseGameSprite";
    [["setSkill1", "登记 SJ 技能", "砍技1"], ["setSkill2", "登记 WJ 技能", "砍技2"], ["setZhao1", "登记 U 技能", "招1"], ["setZhao2", "登记 SU 技能", "招2"], ["setZhao3", "登记 WU 技能", "招3"], ["setCatch1", "登记 ADJ 投技", "摔1"], ["setCatch2", "登记 ADU 投技", "摔2"]].forEach(function (s) {
        specs.push({ key: s[0], label: s[1], kind: "action", owner: "FighterMcCtrler", output: "void", fields: [field("action", "动作标签", "String", s[2], true)], doc: mcDoc });
    });
    specs.push({ key: "targetInRange", label: "对方是否在范围内", kind: "value", owner: "FighterCtrler", output: "Boolean", fields: [field("rx", "相对朝向的水平范围 [左,右]", "Range", "", true), field("ry", "竖直范围 [上,下]，不限填 null", "Range", "null")], doc: fighterDoc });
    specs.push({ key: "getAction", label: "取得动作配置", kind: "object", owner: "FighterMcCtrler", output: "FighterAction", doc: mcDoc });
    specs.push({ key: "setCD", label: "设置冷却", kind: "action", owner: "FighterAction", output: "void", fields: [field("id", "冷却 ID", "String", "", true), field("time", "冷却传入值", "int", "", true)], doc: "zh-cn/core-object-classes/FighterAction", hint: "3.8开发填写动画帧数，30 帧约一秒；旧版换算不同，见接口说明。冷却 ID 还需在动作逻辑中检查。" });
    [
        ["qi", "读取当前气量", "Number", mainDoc],
        ["hpRate", "读取血量比例", "Number", baseDoc, "3.8开发"],
        ["isAllowBeHit", "是否允许受击", "Boolean", baseDoc]
    ].forEach(function (item) {
        specs.push({ key: item[0], label: item[1], kind: "value", owner: "FighterMain", output: item[2], property: true, doc: item[3], since: item[4] });
    });
    [
        ["setEnergy", "energy", "设置当前耐力", "Number", 100, mainDoc],
        ["setQi", "qi", "设置当前气量", "Number", 100, mainDoc],
        ["setAllowBeHit", "isAllowBeHit", "设置是否允许受击", "Boolean", false, baseDoc],
        ["setApplyG", "isApplyG", "设置是否受重力影响", "Boolean", false, baseDoc]
    ].forEach(function (item) {
        specs.push({ key: item[0], member: item[1], anchor: item[1].toLowerCase(), label: item[2], kind: "action", owner: "FighterMain", output: "void", assignment: true, fields: [field("value", item[2], item[3], item[4], true)], doc: item[5] });
    });
    [
        ["setHurtTime", "hurtTime", "修改硬直时间", "Number", 300],
        ["setHitx", "hitx", "修改横向受力", "Number", 0],
        ["setHity", "hity", "修改竖直受力", "Number", 0],
        ["setBreakDef", "isBreakDef", "设置破防", "Boolean", true]
    ].forEach(function (item) {
        specs.push({ key: item[0], member: item[1], anchor: item[1].toLowerCase(), label: item[2], kind: "action", owner: "HitVO", output: "void", assignment: true, fields: [field("value", item[2], item[3], item[4], true)], doc: "zh-cn/data-model-classes/HitVO", words: "攻击面 攻击配置" });
    });
    [
        { key: "loseHp", label: "扣除血量", owner: "FighterCtrler", fields: [field("v", "扣除的血量", "Number", "", true)], doc: fighterDoc },
        { key: "addEnergy", label: "恢复耐力", owner: "FighterCtrler", since: "3.8开发", fields: [field("delta", "增加的耐力", "Number", "", true)], doc: fighterDoc },
        { key: "loseEnergy", label: "消耗耐力", owner: "FighterCtrler", since: "3.6", fields: [field("v", "消耗的耐力", "Number", "", true)], doc: fighterDoc },
        { key: "loseQi", label: "消耗气量", owner: "FighterCtrler", since: "3.6", fields: [field("v", "消耗的气量", "Number", "", true)], doc: fighterDoc },
        { key: "addQi", label: "增加气量", owner: "FighterMcCtrler", fields: [field("qi", "增加的气量", "Number", "", true)], doc: mcDoc },
        { key: "setHurtAction", label: "设置当身动作", owner: "FighterMcCtrler", fields: [field("action", "当身触发后的动作标签", "String", "", true)], doc: mcDoc, words: "防反 反制 被打 受击", hint: "在当身判定所在帧设置；制作触发后的动作帧时，需另行配置无敌状态。" },
        { key: "setTouchFloor", label: "设置触地动作", owner: "FighterMcCtrler", fields: [field("frame", "触地后的动作标签", "String", "", true), field("breakAct", "触地时中断当前动作", "Boolean", true)], doc: mcDoc },
        { key: "setDirectToTarget", label: "面向对方", owner: "FighterCtrler", fields: [], doc: fighterDoc, words: "转向 朝向 自动转身" },
        { key: "setDirectReverse", label: "反向转身", owner: "FighterCtrler", since: "3.8开发", fields: [], doc: fighterDoc, words: "反转 翻转 朝向" },
        { key: "moveToTarget", label: "移动到对方位置", owner: "FighterCtrler", fields: [field("x", "水平偏移", "Number", 0), field("y", "竖直偏移", "Number", 0), field("setDirect", "面向对方", "Boolean", true)], doc: fighterDoc, words: "瞬移 对面 目标 靠近" },
        { key: "move", label: "持续移动", owner: "FighterMcCtrler", fields: [field("x", "水平速度", "Number", 0), field("y", "竖直速度", "Number", 0)], doc: mcDoc },
        { key: "stopMove", label: "停止移动", owner: "FighterMcCtrler", fields: [], doc: mcDoc },
        { key: "loop", label: "循环播放动作", owner: "FighterMcCtrler", fields: [field("frame", "动作标签", "String", "", true)], doc: mcDoc },
        { key: "bisha", label: "开始必杀黑幕", owner: "FighterEffectCtrl", fields: [field("isSuper", "拉近镜头", "Boolean", false)], doc: effectDoc },
        { key: "endBisha", label: "结束必杀黑幕", owner: "FighterEffectCtrl", fields: [], doc: effectDoc },
        { key: "slowDown", label: "播放慢动作", owner: "FighterEffectCtrl", fields: [field("time", "持续秒数", "Number", "", true)], doc: effectDoc },
        { key: "renderAnimate", label: "更新人物动画与判定", owner: "FighterMC", fields: [], doc: "zh-cn/core-object-classes/FighterMC" },
        { key: "addRenderFunc", label: "注册逐帧回调", owner: "FighterCtrler", since: "3.8开发", fields: [field("func", "已有回调函数名称", "Function", "", true)], doc: fighterDoc, hint: "填写已定义的函数名称；回调内容和更新时机需要按实际效果编写。" }
    ].forEach(function (item) { specs.push(Object.assign({ kind: "action", output: "void" }, item)); });
    specs.push({ key: "justHit", label: "攻击是否命中", kind: "value", owner: "FighterCtrler", output: "Boolean", fields: [field("hitId", "攻击 ID", "String", "", true), field("includeDefense", "计入被防御的命中", "Boolean", false)], doc: fighterDoc, words: "打中 击中 判断" });
    specs.push({ key: "effect", label: "Effect 控制器", kind: "root", output: "FighterEffectCtrl", code: "parent.$effect_ctrler", doc: effectDoc });
    specs.push({ key: "assister", label: "辅助控制器", kind: "root", output: "AssisiterCtrler", code: "$assisterCtrler", doc: assisterDoc });
    specs.push({ key: "attacker", label: "攻击对象控制器", kind: "root", output: "FighterAttackerCtrler", code: "$attacker_ctrler", doc: attackerDoc });
    [
        ["assister", "AssisiterCtrler", "Assister", assisterDoc, "3.3"],
        ["attacker", "FighterAttackerCtrler", "FighterAttacker", attackerDoc, "3.8开发"]
    ].forEach(function (context) {
        var prefix = context[0], owner = context[1], main = context[2], doc = context[3];
        specs.push({ key: prefix + "Effect", member: "effect", anchor: "effect", label: "取得特效控制器", kind: "object", owner: owner, output: "FighterEffectCtrl", property: true, doc: doc });
        specs.push({ key: prefix + "Self", member: "getSelf", anchor: "getself", label: "取得自身主体", kind: "object", owner: owner, output: main, since: context[4], doc: doc });
        ["hp", "hpRate", "isInAir", "isAllowBeHit", "setHp", "setAllowBeHit", "setApplyG"].forEach(function (key) {
            var original = specs.find(function (spec) { return spec.key === key; });
            var copy = Object.assign({}, original, { key: prefix + key[0].toUpperCase() + key.slice(1), member: original.member || key, anchor: original.anchor || key.toLowerCase(), semantic: key, owner: main });
            if (key === "setApplyG") Object.assign(copy, { member: key, anchor: "setapplyg", assignment: false, owner: owner, doc: doc, since: prefix === "attacker" ? "3.8开发" : undefined });
            specs.push(copy);
        });
        ["setDirectReverse", "moveToTarget", "move", "stopMove", "justHit", "setHitTarget"].concat(prefix === "assister" ? ["setDirectToTarget"] : []).forEach(function (key) {
            var original = specs.find(function (spec) { return spec.key === key; });
            var copy = Object.assign({}, original, { key: prefix + key[0].toUpperCase() + key.slice(1), member: key, anchor: key.toLowerCase(), semantic: key, owner: owner, doc: doc });
            if (key === "justHit") copy.fields = [field("hitId", "攻击 ID", "String", "", true)];
            if (key === "moveToTarget" && prefix === "attacker") copy.fields = original.fields.slice(0, 2);
            if (key === "stopMove" && prefix === "attacker") copy.since = "3.8开发";
            specs.push(copy);
        });
        [true, false].forEach(function (play) {
            var member = play ? "gotoAndPlay" : "gotoAndStop";
            specs.push({ key: prefix + member[0].toUpperCase() + member.slice(1), member: member, anchor: member.toLowerCase(), semantic: member, label: play ? "跳转并播放" : "跳转并停止", kind: "action", owner: owner, output: "void", doc: doc, fields: [field("name", "帧标签", "String", "", true)], words: "跳帧 跳到 切换 动作" });
        });
    });
    specs.push({ key: "assisterHitModel", member: "hitModel", anchor: "hitmodel", label: "取得攻击模型", kind: "object", owner: "AssisiterCtrler", output: "FighterHitModel", property: true, doc: assisterDoc });
    specs.filter(function (s) { return s.assignment && s.owner === "HitVO" && s.fields[0].type === "Number"; }).forEach(function (s) {
        ["add", "subtract"].forEach(function (op) {
            specs.push(Object.assign({}, s, { key: op + s.key.slice(3), operator: op === "add" ? "+=" : "-=", label: (op === "add" ? "增加" : "减少") + s.label.replace(/^修改/, "") }));
        });
    });
    var catalog = Object.create(null);
    specs.forEach(function (spec) { catalog[spec.key] = spec; spec.fields = spec.fields || []; });
    function available(spec, version) { return !spec.since || versions.indexOf(version) >= versions.indexOf(spec.since); }
    function createGraph() { return { format: 1, context: null, version: "3.8开发", actor: "character", root: null, nextId: 1, nodes: [], edges: [], bubbles: [] }; }
    function nodeById(graph, id) { return graph.nodes.find(function (node) { return node.id === id; }); }
    function addNode(graph, key, options) {
        if (graph.nodes.length >= 150) throw new Error("首版最多放置 150 张卡片");
        var spec = catalog[key];
        if (!spec) throw new Error("未知接口：" + key);
        var defaults = {};
        spec.fields.forEach(function (f) { defaults[f.key] = f.value; });
        var node = Object.assign({ id: "n" + graph.nextId++, key: key, params: defaults, x: 40, y: 40, container: null }, options);
        node.params = Object.assign(defaults, options && options.params);
        graph.nodes.push(node);
        return node;
    }
    function addBubble(graph, options) {
        if (graph.bubbles.length >= 20) throw new Error("首版最多放置 20 个条件块");
        var bubble = Object.assign({ id: "b" + graph.nextId++, x: 590, y: 230, condition: null, operator: ">=", value: "20", actions: [] }, options);
        graph.bubbles.push(bubble);
        return bubble;
    }
    function checkConnection(graph, from, to) {
        var source = nodeById(graph, from), target = nodeById(graph, to);
        if (!source || !target) return "连接的卡片不存在";
        if (from === to) return "不能把卡片连接到自身";
        if (catalog[source.key].output !== catalog[target.key].owner) return "需要 " + (catalog[target.key].owner || "一个起点") + "，当前输出为 " + catalog[source.key].output;
        var current = source, visited = new Set();
        while (current) {
            if (current.id === to) return "连接会形成循环";
            if (visited.has(current.id)) return "现有连接中存在循环";
            visited.add(current.id);
            var edge = graph.edges.find(function (item) { return item.to === current.id; });
            current = edge && nodeById(graph, edge.from);
        }
        return "";
    }
    function connect(graph, from, to) {
        var error = checkConnection(graph, from, to);
        if (error) throw new Error(error);
        graph.edges = graph.edges.filter(function (edge) { return edge.to !== to; });
        graph.edges.push({ from: from, to: to });
    }
    function findPath(type, target, version) {
        var queue = [{ type: type, path: [] }], visited = new Set();
        while (queue.length) {
            var step = queue.shift();
            if (step.type === target) return step.path;
            if (visited.has(step.type)) continue;
            visited.add(step.type);
            specs.filter(function (spec) { return spec.kind === "object" && spec.owner === step.type && available(spec, version); }).forEach(function (spec) {
                queue.push({ type: spec.output, path: step.path.concat(spec.key) });
            });
        }
        return null;
    }
    function attachPath(graph, node, rootKey) {
        var candidates = rootKey || graph.root ? [rootKey || graph.root] : actors[graph.actor].roots;
        var routes = candidates.map(function (key) { return { root: catalog[key], path: findPath(catalog[key].output, catalog[node.key].owner, graph.version) }; }).filter(function (route) { return route.path !== null; });
        // Older character versions expose current attributes through the documented main object helper
        if (!routes.length && graph.actor === "character" && !rootKey && !graph.root) {
            var fallbackPath = findPath("FighterMain", catalog[node.key].owner, graph.version);
            if (fallbackPath !== null) routes.push({ root: catalog.main, path: fallbackPath });
        }
        routes.sort(function (a, b) { return a.path.length - b.path.length; });
        if (!routes.length) throw new Error(actors[graph.actor].label + "在 " + graph.version + " 中没有可通往 " + catalog[node.key].owner + " 的调用入口");
        var rootSpec = routes[0].root, path = routes[0].path;
        var source = graph.nodes.find(function (n) { return n.key === rootSpec.key; }) || addNode(graph, rootSpec.key, { x: 35, y: 45 });
        path.forEach(function (key, index) {
            var edge = graph.edges.find(function (e) { var n = nodeById(graph, e.to); return e.from === source.id && n && n.key === key && !catalog[key].fields.length; });
            var next = edge && nodeById(graph, edge.to);
            if (!next) {
                next = addNode(graph, key, { x: 265 + index * 230, y: 45 });
                connect(graph, source.id, next.id);
            }
            source = next;
        });
        connect(graph, source.id, node.id);
        return source;
    }
    function usable(spec, actor, version) {
        if (spec.kind === "root") return actors[actor].roots.includes(spec.key) || (actor === "character" && spec.key === "main");
        var roots = actors[actor].roots.slice();
        if (actor === "character") roots.push("main");
        return roots.some(function (key) { return findPath(catalog[key].output, spec.owner, version) !== null; });
    }
    function contextualKey(key, actor, params) {
        var semantic = catalog[key].semantic || key;
        if (actor === "character") return catalog[key].characterKey || (semantic === "setApplyG" ? "isApplyG" : semantic);
        if (["gotoAndPlay", "gotoAndStop"].includes(semantic)) return actor + semantic[0].toUpperCase() + semantic.slice(1);
        if (["hp", "hpRate", "isInAir", "isAllowBeHit", "setHp", "setAllowBeHit", "setApplyG", "setDirectReverse", "setDirectToTarget", "moveToTarget", "move", "stopMove", "justHit", "setHitTarget"].includes(semantic)) {
            var contextual = actor + semantic[0].toUpperCase() + semantic.slice(1);
            return catalog[contextual] ? contextual : key;
        }
        if (semantic === "goFrame") return actor + (params.isPlay === false || /GotoAndStop$/.test(key) ? "GotoAndStop" : "GotoAndPlay");
        return key;
    }
    function changeActor(graph, actor) {
        if (!actors[actor]) throw new Error("未知逻辑归属");
        var notes = [], hitIds = new Map();
        graph.nodes.forEach(function (n) {
            var edge = graph.edges.find(function (e) { return e.to === n.id; }), parent = edge && nodeById(graph, edge.from);
            if (parent && parent.key === "getHitVO") hitIds.set(n.id, parent.params.id);
        });
        graph.nodes = graph.nodes.filter(function (n) { return ["value", "action"].includes(catalog[n.key].kind); });
        graph.edges = []; graph.actor = actor; graph.root = null;
        graph.nodes.slice().forEach(function (n) {
            var old = catalog[n.key], key = contextualKey(n.key, actor, n.params);
            n.key = key;
            if (catalog[key].key === "goFrame" && old.semantic === "goFrame") n.params = Object.assign({ isPlay: !/GotoAndStop$/.test(old.key), playFrame: 0 }, n.params);
            catalog[key].fields.forEach(function (f) { if (n.params[f.key] === undefined) n.params[f.key] = f.value; });
            try {
                var source = attachPath(graph, n);
                if (source.key === "getHitVO" && hitIds.has(n.id)) source.params.id = hitIds.get(n.id);
            } catch (error) { notes.push(error.message); }
        });
        return Array.from(new Set(notes));
    }
    function detach(graph, id) {
        graph.bubbles.forEach(function (bubble) {
            if (bubble.condition === id) bubble.condition = null;
            bubble.actions = bubble.actions.filter(function (value) { return value !== id; });
        });
        var node = nodeById(graph, id);
        if (node) node.container = null;
    }
    function place(graph, id, bubbleId, region, index) {
        var node = nodeById(graph, id), bubble = graph.bubbles.find(function (b) { return b.id === bubbleId; });
        if (!node || !bubble) throw new Error("卡片或条件块不存在");
        var spec = catalog[node.key];
        if (region === "condition" && spec.kind !== "value") throw new Error("条件区需要数值、布尔值或文字卡片");
        if (region === "actions" && spec.kind !== "action") throw new Error("执行区需要操作卡片");
        if (region !== "condition" && region !== "actions") throw new Error("未知放置区域");
        detach(graph, id);
        if (region === "condition") {
            if (bubble.condition) detach(graph, bubble.condition);
            bubble.condition = id;
            bubble.operator = spec.output === "Boolean" ? "truthy" : "==";
            bubble.value = spec.output === "String" ? "" : "20";
        } else bubble.actions.splice(index === undefined ? bubble.actions.length : index, 0, id);
        node.container = bubble.id;
    }
    function remove(graph, id) {
        var bubble = graph.bubbles.find(function (b) { return b.id === id; });
        if (bubble) {
            graph.nodes.filter(function (n) { return n.container === id; }).forEach(function (n, i) { n.container = null; n.x = bubble.x + 440; n.y = bubble.y + i * 125; });
            graph.bubbles = graph.bubbles.filter(function (b) { return b.id !== id; });
        } else {
            detach(graph, id);
            graph.nodes = graph.nodes.filter(function (n) { return n.id !== id; });
            graph.edges = graph.edges.filter(function (e) { return e.from !== id && e.to !== id; });
        }
    }
    function literal(value, field) {
        if (field.type === "Range") {
            if (String(value).trim() === "null" && !field.required) return "null";
            var range; try { range = JSON.parse(String(value)); } catch (error) { throw new Error("请填写" + field.label); }
            if (!Array.isArray(range) || range.length !== 2 || !range.every(function (v) { return typeof v === "number" && Number.isFinite(v); }) || range[0] > range[1]) throw new Error(field.label + "需要两个从小到大排列的数值");
            return JSON.stringify(range);
        }
        if (field.type === "String") {
            if (field.required && !String(value).trim()) throw new Error("请填写" + field.label);
            return JSON.stringify(String(value)).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
        }
        if (field.type === "Boolean") {
            if (value !== true && value !== false) throw new Error(field.label + "必须为布尔值");
            return String(value);
        }
        if (field.type === "Function") {
            if (!String(value).trim()) throw new Error("请填写" + field.label);
            if (!/^[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*$/.test(String(value))) throw new Error(field.label + "应填写函数名称");
            return String(value);
        }
        if (value === "" || value === null || !/^(?:-?(?:\d+(?:\.\d*)?|\.\d+)|0x[\da-f]+)$/i.test(String(value))) throw new Error("请为" + field.label + "填写数值");
        var number = Number(value);
        if (!Number.isFinite(number) || Math.abs(number) > 1e12) throw new Error(field.label + "超出数值范围");
        if (field.min !== undefined && number < field.min || field.max !== undefined && number > field.max) throw new Error(field.label + "超出范围");
        if (field.type === "int" && (!Number.isInteger(number) || number < -2147483648 || number > 2147483647)) throw new Error(field.label + "必须为 int 整数");
        if (field.type === "uint" && (!Number.isInteger(number) || number < 0 || number > 4294967295)) throw new Error(field.label + "必须为 uint 整数");
        return /^0x/i.test(String(value)) ? "0x" + number.toString(16) : String(number);
    }
    function generate(graph) {
        var errors = [], lines = [], usedMain = false, scope, targetCount = 0;
        function startScope() { scope = { bindings: new Map(), declarations: [], guards: [] }; }
        function expression(id, visited) {
            var node = nodeById(graph, id);
            if (!node) throw new Error("卡片不存在");
            var spec = catalog[node.key];
            if (!usable(spec, graph.actor, graph.version)) throw new Error(actors[graph.actor].label + "没有 " + (spec.member || spec.key) + " 的调用入口");
            if (!available(spec, graph.version)) throw new Error(spec.key + " 需要 " + spec.since + " 起的版本");
            if (visited.has(id)) throw new Error("连接中存在循环");
            visited.add(id);
            if (spec.kind === "root") { if (node.key === "main") usedMain = true; return spec.code; }
            var edge = graph.edges.find(function (e) { return e.to === id; });
            if (!edge) throw new Error(spec.key + " 尚未连接 " + spec.owner);
            var source = nodeById(graph, edge.from);
            if (!source || catalog[source.key].output !== spec.owner) throw new Error(spec.key + " 的对象类型不匹配");
            var owner = expression(edge.from, visited);
            if (spec.dynamicOwner) {
                if (!scope.bindings.has(edge.from)) {
                    var targetName = "target" + (++targetCount);
                    scope.bindings.set(edge.from, targetName);
                    scope.declarations.push("var " + targetName + ":* = " + owner + ";");
                    scope.guards.push(targetName + " != null");
                }
                owner = scope.bindings.get(edge.from);
            }
            var args = spec.fields.map(function (f) { return literal(node.params[f.key], f); });
            if (spec.key === "goFrame" && Number(node.params.playFrame) < 0) throw new Error("播放帧数不能为负数");
            if (spec.key === "shake" && Number(node.params.time) < 0) throw new Error("震屏时长不能为负数");
            return owner + "." + (spec.member || spec.key) + (spec.assignment ? " " + (spec.operator || "=") + " " + args[0] : spec.property ? "" : "(" + args.join(", ") + ")");
        }
        function attempt(fn) { try { return fn(); } catch (error) { errors.push(error.message); return null; } }
        function statement(code, current) {
            var body = code + ";";
            if (current.guards.length) body = "if (" + current.guards.join(" && ") + ")\n{\n    " + body + "\n}";
            return (current.declarations.length ? current.declarations.join("\n") + "\n" : "") + body;
        }
        var units = graph.nodes.filter(function (n) { return !n.container && catalog[n.key].kind === "action"; }).map(function (n) { return { y: n.y, x: n.x, node: n }; });
        graph.bubbles.forEach(function (b) { units.push({ y: b.y, x: b.x, bubble: b }); });
        units.sort(function (a, b) { return a.y - b.y || a.x - b.x; });
        units.forEach(function (unit) {
            startScope();
            if (unit.node) { var result = attempt(function () { return expression(unit.node.id, new Set()); }); if (result) lines.push(statement(result, scope)); return; }
            var b = unit.bubble;
            var condition = attempt(function () {
                var node = nodeById(graph, b.condition);
                if (!node || catalog[node.key].kind !== "value") throw new Error("条件块缺少判断条件");
                var spec = catalog[node.key], value = expression(node.id, new Set());
                if (spec.output === "Boolean") {
                    if (!["truthy", "falsy"].includes(b.operator)) throw new Error("布尔条件需要选择是或否");
                    return b.operator === "falsy" ? "!(" + value + ")" : value;
                }
                var allowed = spec.output === "String" ? ["==", "!="] : [">=", ">", "<=", "<", "==", "!="];
                if (!allowed.includes(b.operator)) throw new Error("比较方式与返回类型不匹配");
                return value + " " + b.operator + " " + literal(b.value, { type: spec.output === "String" ? "String" : "Number", label: "比较值", required: false });
            });
            var conditionScope = scope;
            if (!b.actions.length) errors.push("条件块缺少执行内容");
            var actions = b.actions.map(function (id) { return attempt(function () {
                var node = nodeById(graph, id);
                if (!node || catalog[node.key].kind !== "action") throw new Error("执行区包含无效卡片");
                startScope();
                return statement(expression(id, new Set()), scope);
            }); }).filter(Boolean);
            if (condition) {
                if (conditionScope.guards.length) condition = conditionScope.guards.join(" && ") + " && " + condition;
                lines.push((conditionScope.declarations.length ? conditionScope.declarations.join("\n") + "\n" : "") + "if (" + condition + ")\n{\n" + actions.map(function (a) { return a.split("\n").map(function (line) { return "    " + line; }).join("\n"); }).join("\n") + "\n}");
            }
        });
        graph.nodes.filter(function (n) { return !n.container && catalog[n.key].kind === "value"; }).forEach(function (n, i) {
            startScope();
            var value = attempt(function () { return expression(n.id, new Set()); });
            if (value && scope.guards.length) value = scope.guards.join(" && ") + " && (" + value + ")";
            if (value && scope.declarations.length) lines.push(scope.declarations.join("\n"));
            if (value) lines.push("var value" + (i + 1) + ":" + catalog[n.key].output + " = " + value + ";");
        });
        var setup = usedMain ? "function get $self_main(): *\n{\n    for each (var i: * in parent.parent.parent.parent.getGameSprites())\n    {\n        if (i.getDisplay() == parent)\n        {\n            return i;\n        }\n    }\n}\n\n" : "";
        return { code: errors.length ? "" : setup + (graph.context && contexts[graph.context] ? "// " + contexts[graph.context] + "\n" : "") + lines.join("\n\n"), errors: Array.from(new Set(errors)) };
    }
    function parse(text) { return language.parse(text); }
    function fromText(text, version, rootKey) {
        var graph = createGraph(); graph.version = version || graph.version;
        if (actors[rootKey]) graph.actor = rootKey;
        else if (rootKey) graph.root = rootKey;
        var result = parse(text), notes = result.notes.slice();
        graph.context = result.context;
        if (result.actor && !graph.root) graph.actor = result.actor;
        // A single positive hit-and-play operation has a native helper with the same defaults
        if (!result.blocked && graph.actor === "character" && !graph.root && result.condition && result.condition.key === "justHit" && result.condition.operator === "truthy" && result.actions.length === 1) {
            var jump = result.actions[0];
            if (jump.key === "goFrame" && jump.params.isPlay && !jump.params.playFrame && !jump.explicit) {
                result.actions = [{ key: "justHitToPlay", params: { hitid: result.condition.params.hitId, frame: jump.params.name, noIdle: false, inCludeDefense: result.condition.params.includeDefense }, evidence: result.condition.evidence + " → " + jump.evidence, position: jump.position }];
                result.condition = null;
            }
        }
        var requestedRoot = /从\s*FighterCtrler/.test(text) ? "fighter" : /从\s*(?:FighterMcCtrler|Mc控制器)/.test(text) ? "mc" : null;
        var bubble = result.condition || result.blocked ? addBubble(graph, { x: 560, y: 230 }) : null;
        if (result.condition) {
            var key = result.condition.key;
            if (key === "getEnergy" && graph.root === "main") key = "energy";
            var condition = addNode(graph, contextualKey(key, graph.actor, {}), { params: result.condition.params || {}, x: 35, y: 260 });
            try { attachPath(graph, condition); } catch (error) { notes.push(error.message); }
            if (!result.blocked) {
                place(graph, condition.id, bubble.id, "condition");
                bubble.operator = result.condition.operator; bubble.value = result.condition.value;
            }
        }
        result.actions.forEach(function (action, index) {
            var params = Object.assign({}, action.params);
            if (action.key === "setCD" && action.unit) {
                params.time = graph.version === "3.8开发" ? Number(params.time) * (action.unit === "seconds" ? 30 : 1) : "";
                if (graph.version !== "3.8开发") notes.push("旧版 setCD 的时长换算不同，请对照接口说明填写冷却传入值");
            }
            var key = action.key;
            if (graph.root !== "main") {
                if (key === "goFrame" && !action.explicit && !Number(params.playFrame)) key = params.isPlay ? "gotoAndPlay" : "gotoAndStop";
                if (key === "setApplyG" && graph.actor === "character") key = "isApplyG";
            }
            var node = addNode(graph, contextualKey(key, graph.actor, params), { params: params, x: 40, y: 260 + index * 135 });
            try {
                var source = attachPath(graph, node, requestedRoot);
                if (action.hitId && source.key === "getHitVO") source.params.id = action.hitId;
            } catch (error) { notes.push(error.message); }
            if (bubble) place(graph, node.id, bubble.id, "actions");
        });
        (result.values || []).forEach(function (value, index) {
            var key = value.key === "getEnergy" && graph.root === "main" ? "energy" : value.key;
            var node = addNode(graph, contextualKey(key, graph.actor, value.params || {}), { params: value.params || {}, x: 40, y: 260 + index * 135 });
            try { attachPath(graph, node); } catch (error) { notes.push(error.message); }
        });
        var suggestions = (result.suggestions || []).map(function (key) { return contextualKey(key, graph.actor, {}); }).filter(function (key, index, keys) { return catalog[key] && keys.indexOf(key) === index && usable(catalog[key], graph.actor, graph.version); });
        return { graph: graph, notes: Array.from(new Set(notes)), suggestions: suggestions, matches: Array.from(new Set((result.condition ? [result.condition.evidence] : []).concat(result.actions.map(function (a) { return a.evidence; })))) };
    }
    function validateGraph(value) {
        if (!value || value.format !== 1 || !versions.includes(value.version) || (value.actor && !Object.hasOwn(actors, value.actor)) || !Array.isArray(value.nodes) || !Array.isArray(value.edges) || !Array.isArray(value.bubbles)) throw new Error("本地工作台数据无效");
        if (value.nodes.length > 150 || value.edges.length > 150 || value.bubbles.length > 20) throw new Error("卡片数量超出 demo 上限");
        if (value.context && !Object.hasOwn(contexts, value.context)) throw new Error("调用帧上下文无效");
        var graph = createGraph(); graph.context = value.context || null; graph.version = value.version; graph.actor = value.actor || "character";
        var ids = new Set();
        function identity(item) {
            if (!item || typeof item.id !== "string" || !/^[nb]\d{1,8}$/.test(item.id) || ids.has(item.id)) throw new Error("卡片编号无效或重复");
            ids.add(item.id);
            var x = Number(item.x), y = Number(item.y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("卡片坐标无效");
            return { id: item.id, x: Math.max(10, Math.min(x, 4000)), y: Math.max(10, Math.min(y, 4000)) };
        }
        value.nodes.forEach(function (item) {
            var base = identity(item), spec = catalog[item.key];
            if (!spec || !item.params || typeof item.params !== "object") throw new Error("卡片接口或参数无效");
            var params = {};
            spec.fields.forEach(function (f) {
                var v = item.params[f.key];
                if (!["number", "string", "boolean"].includes(typeof v) || String(v).length > 1000) throw new Error("卡片参数无效");
                params[f.key] = v;
            });
            graph.nodes.push(Object.assign(base, { key: spec.key, params: params, container: null }));
        });
        value.bubbles.forEach(function (item) {
            var base = identity(item);
            if (!Array.isArray(item.actions) || typeof item.operator !== "string" || !["number", "string"].includes(typeof item.value) || String(item.value).length > 1000) throw new Error("条件配置无效");
            var bubble = Object.assign(base, { condition: null, operator: item.operator, value: String(item.value), actions: [] });
            graph.bubbles.push(bubble);
            [item.condition].concat(item.actions).filter(Boolean).forEach(function (id, i) {
                var node = nodeById(graph, id);
                if (!node || node.container) throw new Error("同一卡片不能同时属于多个区域");
                if (item.condition === id) {
                    if (catalog[node.key].kind !== "value") throw new Error("判断条件类型无效");
                    bubble.condition = id;
                } else {
                    if (catalog[node.key].kind !== "action") throw new Error("执行卡片类型无效");
                    bubble.actions.push(id);
                }
                node.container = bubble.id;
            });
        });
        var targets = new Set();
        value.edges.forEach(function (e) {
            if (!e || targets.has(e.to)) throw new Error("同一对象输入存在多个连接");
            targets.add(e.to); connect(graph, e.from, e.to);
        });
        graph.nextId = Math.max(0, ...Array.from(ids, function (id) { return Number(id.slice(1)); })) + 1;
        return graph;
    }
    return { demoVersion: demoVersion, actors: actors, specs: specs, catalog: catalog, versions: versions, available: available, usable: usable, changeActor: changeActor, createGraph: createGraph, nodeById: nodeById, addNode: addNode, addBubble: addBubble, connect: connect, attachPath: attachPath, findPath: findPath, place: place, detach: detach, remove: remove, generate: generate, parse: parse, fromText: fromText, validateGraph: validateGraph };
}));
