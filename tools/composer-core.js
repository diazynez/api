(function (root, factory) {
    var language = typeof module === "object" && module.exports ? require("./composer-language.js") : root.BvnComposerLanguage;
    var api = factory(language);
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.BvnComposer = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function (language) {
    "use strict";

    // Update the composer.html asset versions with each demo release
    var demoVersion = "0.14.12";
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
    // Common operations are grouped by their actual receiver, including the inverse operations
    var actionDoc = "zh-cn/core-object-classes/FighterAction";
    var bindingNames = ["moveLeft", "moveRight", "defense", "jump", "jumpQuick", "jumpDown", "dash", "attack", "skill1", "skill2", "zhao1", "zhao2", "zhao3", "catch1", "catch2", "bisha", "bishaUP", "bishaSUPER", "waiKai", "waiKaiW", "waiKaiS", "attackAIR", "skillAIR", "bishaAIR"];
    function method(key, label, owner, doc, fields, since, output, extra) {
        specs.push(Object.assign({ key: key, label: label, owner: owner, doc: doc, fields: fields || [], since: since, output: output || "void", kind: output ? "value" : "action" }, extra));
    }
    function property(key, member, label, owner, doc, type, value, since) {
        method(key, "读取" + label, owner, doc, [], since, type, { member: member, anchor: member.toLowerCase(), property: true });
        method("write" + key[0].toUpperCase() + key.slice(1), "设置" + label, owner, doc, [field("value", label, type, value, true)], since, null, { member: member, anchor: member.toLowerCase(), assignment: true });
    }
    method("setDisabled", "禁用动作", "FighterAction", actionDoc, [field("action", "动作标识", "ActionName", "zhao2", true), field("condition", "禁用条件：true、动画帧数或函数名", "DisableCondition", "true", true)], "3.8开发");
    method("removeDisabled", "解除动作禁用", "FighterAction", actionDoc, [field("action", "动作标识（null 为全部）", "NullableActionName", "zhao2", true)], "3.8开发");
    method("setAllDisabled", "禁用通常动作", "FighterAction", actionDoc, [field("condition", "禁用条件：true、动画帧数或函数名", "DisableCondition", "true", true)], "3.8开发");
    method("isDisabled", "动作是否被禁用", "FighterAction", actionDoc, [field("action", "动作标识", "ActionName", "zhao2", true)], "3.8开发", "Boolean");
    method("CDOK", "冷却是否结束", "FighterAction", actionDoc, [field("id", "冷却 ID", "String", "", true)], null, "Boolean", { watchCondition: true });
    method("getCD", "读取剩余冷却", "FighterAction", actionDoc, [field("id", "冷却 ID", "String", "", true)], "3.8开发", "Number", { watchCondition: true });
    method("clearBinding", "清除动作纽带", "FighterAction", actionDoc, [field("action", "动作纽带属性", "BindingName", "zhao2", true)], null, null, { computedMember: true, nullAssignment: true, anchor: "zhao2", repeatRequired: true, hint: "持续禁用时放入逐帧执行块；停止清空后，后续动作登记会恢复纽带。" });
    method("writeBinding", "设置动作纽带", "FighterAction", actionDoc, [field("action", "动作纽带属性", "BindingName", "zhao2", true), field("frame", "动作标签", "String", "", true)], null, null, { computedMember: true, anchor: "zhao2" });
    ["isMoving", "isJumping", "isDefensing", "isDashing", "isHurting", "isHurtFlying", "isDefenseHiting", "isSteelHiting"].forEach(function (name) {
        var labels = { isMoving: "移动", isJumping: "跳跃", isDefensing: "防御", isDashing: "冲刺", isHurting: "受击", isHurtFlying: "击飞", isDefenseHiting: "防御受击", isSteelHiting: "钢身受击" };
        method(name, "是否处于" + labels[name], "FighterAction", actionDoc, [], name === "isSteelHiting" ? "3.8开发" : null, "Boolean", { property: true });
    });
    ["airMove", "airHitTimes", "jumpTimes", "bishaQi", "bishaUPQi", "bishaSUPERQi", "bishaAIRQi"].forEach(function (name) {
        var labels = { airMove: "空中移动许可", airHitTimes: "空中可攻击次数", jumpTimes: "可跳跃次数", bishaQi: "必杀耗气", bishaUPQi: "上必杀耗气", bishaSUPERQi: "超必杀耗气", bishaAIRQi: "空中必杀耗气" };
        property("action" + name[0].toUpperCase() + name.slice(1), name, labels[name], "FighterAction", actionDoc, name === "airMove" ? "Boolean" : "int", name === "airMove" ? true : 1);
    });
    [["speed", "移动速度", 6], ["jumpPower", "跳跃能力", 15], ["energyMax", "最大耐力", 100], ["customHpMax", "自定义最大血量", 0], ["fzqi", "辅助能量", 100]].forEach(function (s) { property("main" + s[0], s[0], s[1], "FighterMain", mainDoc, "Number", s[2]); });
    [["isSteelBody", "钢身"], ["isSuperSteelBody", "超级钢身"]].forEach(function (s) { property(s[0], s[0], s[1], "FighterMain", mainDoc, "Boolean", true, "3.3"); });
    [["powerRate", "伤害倍率", "Number", 1], ["hitType", "攻击类型", "int", 1], ["hurtType", "受击方式", "int", 0], ["checkDirect", "背击破防", "Boolean", true], ["powerAdd", "攻击力增幅", "Number", 0, "3.5"], ["slowDown", "攻击慢放秒数", "Number", 0, "3.5"], ["focusTarget", "镜头聚焦目标", "Boolean", false, "3.5"], ["hitxDef", "防御受击横向受力", "Number", 0, "3.8开发"], ["holdTime", "命中冻结毫秒数", "Number", 0, "3.8开发"], ["isCounterDef", "防御耐力消耗加倍", "Boolean", true, "3.8开发"], ["isHurtBreak", "允许受击脱离", "Boolean", true, "3.8开发"]].forEach(function (s) { property("hit" + s[0], s[0], s[1], "HitVO", "zh-cn/data-model-classes/HitVO", s[2], s[3], s[4]); });
    method("setPowerRate", "设置全部攻击的伤害倍率", "FighterHitModel", modelDoc, [field("v", "倍率", "Number", 1, true)]);
    method("getHitVOByDisplayName", "按攻击面元件名取得攻击配置", "FighterHitModel", modelDoc, [field("name", "元件名称", "String", "", true)], null, "HitVO", { kind: "object" });
    method("getHitVOLike", "按 ID 片段查找攻击配置", "FighterHitModel", modelDoc, [field("likeId", "ID 片段", "String", "", true)], null, "Vector.<HitVO>");
    [["idle", "恢复站立或下落", [field("frame", "站立标签", "String", "站立", true)]], ["stop", "停止动画"], ["dash", "开始冲刺", [field("speedPlus", "速度倍率", "Number", 3)]], ["dashStop", "结束冲刺", [field("loseSpdPercent", "失速度比例", "Number", .5)]], ["setAllAct", "登记全部地面动作"], ["setAirAllAct", "登记全部空中动作"], ["setAirMove", "设置空中移动", [field("v", "允许移动", "Boolean", true)]], ["setMove", "登记行走"], ["setDefense", "登记防御"], ["endAct", "结束当前动作登记"], ["damping", "设置移动阻力", [field("x", "水平阻力", "Number", 0), field("y", "竖直阻力", "Number", 0)]], ["movePercent", "按角色速度比例移动", [field("x", "水平比例", "Number", 0), field("y", "竖直比例", "Number", 0)]], ["dampingPercent", "按角色速度比例设置阻力", [field("x", "水平比例", "Number", 0), field("y", "竖直比例", "Number", 0)]]].forEach(function (s) { method(s[0], s[1], "FighterMcCtrler", mcDoc, s[2]); });
    [["setJump", "登记跳跃", "跳"], ["setJumpDown", "登记下台阶", "落"], ["setDash", "登记瞬步", "瞬步"], ["setAttack", "登记普通攻击", "砍1"], ["setAttackAIR", "登记空中攻击", "跳砍"], ["setSkillAIR", "登记空中技能", "跳招"]].forEach(function (s) { method(s[0], s[1], "FighterMcCtrler", mcDoc, [field("action", "动作标签", "String", s[2], true)]); });
    [["setBisha", "登记必杀", "必杀", 100], ["setBishaUP", "登记上必杀", "上必杀", 100], ["setBishaSUPER", "登记超必杀", "超必杀", 300], ["setBishaAIR", "登记空中必杀", "空中必杀", 100]].forEach(function (s) { method(s[0], s[1], "FighterMcCtrler", mcDoc, [field("action", "动作标签", "String", s[2], true), field("qi", "消耗气量", "int", s[3])]); });
    method("setSteelBody", "设置钢身效果", "FighterMcCtrler", mcDoc, [field("v", "开启钢身", "Boolean", true), field("isSuper", "超级钢身", "Boolean", false)], "3.3");
    method("setTouchSide", "登记触边动作", "FighterMcCtrler", mcDoc, [field("action", "触边后的动作标签", "String", "", true)], "3.8开发");
    method("getAssister", "取得在场辅助控制器", "FighterMcCtrler", mcDoc, [], "3.8开发", "AssisiterCtrler", { kind: "object", nullable: true });
    method("getAssisterGlobal", "取得己方配置的辅助主体", "FighterMcCtrler", mcDoc, [], "3.8开发", "Assister", { kind: "object", nullable: true });
    method("getAttacker", "取得已加入的攻击对象控制器", "FighterMcCtrler", mcDoc, [field("name", "对象名称", "String", "", true)], null, "FighterAttackerCtrler", { kind: "object", nullable: true });
    [["startShake", "开始持续震屏", [field("x", "水平振幅", "Number", 0), field("y", "竖直振幅", "Number", 3)]], ["endShake", "结束持续震屏"], ["shadow", "开启残影", [field("r", "红色", "int", 0), field("g", "绿色", "int", 0), field("b", "蓝色", "int", 0)]], ["endShadow", "结束残影"], ["startGlow", "开始发光", [field("color", "颜色", "uint", "0xffffff")], "3.3"], ["endGlow", "结束发光", [], "3.3"], ["playImpactEffect", "播放黑白闪冲击", [field("config", "效果配置（JSON，可留空）", "ObjectConfig", "")], "3.8开发"], ["stopImpactEffect", "结束黑白闪冲击", [], "3.8开发"]].forEach(function (s) { method(s[0], s[1], "FighterEffectCtrl", effectDoc, s[2], s[3]); });
    [["", "FighterMcCtrler", mcDoc], ["assister", "AssisiterCtrler", assisterDoc], ["attacker", "FighterAttackerCtrler", attackerDoc]].forEach(function (context) {
        var prefix = context[0], owner = context[1], doc = context[2];
        function name(member) { return prefix ? prefix + member[0].toUpperCase() + member.slice(1) : member; }
        method(name("fire"), "发射飞行道具", owner, doc, [field("mcName", "道具元件名称", "String", "", true), field("params", "道具配置（JSON，可留空）", "ObjectConfig", "")], prefix === "attacker" ? "3.3" : null, null, { member: "fire", anchor: "fire" });
        if (prefix !== "attacker") method(name("addAttacker"), "加入攻击对象", owner, doc, [field("mcName", "攻击对象元件名称", "String", "", true), field("params", "对象配置（JSON，可留空）", "ObjectConfig", "")], null, null, { member: "addAttacker", anchor: "addattacker" });
        if (!prefix) return;
        ["owner_mc_ctrler", "owner_fighter_ctrler"].forEach(function (member) { method(name(member), "取得主人" + (member === "owner_mc_ctrler" ? "Mc" : "Fighter") + "控制器", owner, doc, [], null, member === "owner_mc_ctrler" ? "FighterMcCtrler" : "FighterCtrler", { kind: "object", property: true, nullable: true, manualPath: true, member: member, anchor: member }); });
        method(name("removeSelf"), "移除自身", owner, doc, [], null, null, { member: "removeSelf", anchor: "removeself" });
        method(name("getOwner"), "取得主人对象", owner, doc, [], prefix === "attacker" ? "3.8开发" : null, "IGameSprite", { kind: "object", nullable: true, manualPath: true, member: "getOwner", anchor: "getowner" });
        ["stop", "endAct", "damping", "setTouchFloor", "setTouchSide", "removeRenderFunc"].forEach(function (member) {
            var args = member === "damping" ? [field("x", "水平阻力", "Number", 0), field("y", "竖直阻力", "Number", 0)] : member === "setTouchFloor" || member === "setTouchSide" ? [field("frame", "动作标签", "String", "", true)] : member === "removeRenderFunc" ? [field("func", "回调函数名称", "Function", "", true)] : [];
            method(name(member), {stop:"停止动画",endAct:"结束动作登记",damping:"设置阻力",setTouchFloor:"登记触地动作",setTouchSide:"登记触边动作",removeRenderFunc:"移除逐帧回调"}[member], owner, doc, args, /setTouchSide|removeRenderFunc/.test(member) ? "3.8开发" : null, null, { member: member, anchor: member.toLowerCase() });
        });
    });
    method("assisterFinish", "结束辅助并退场", "AssisiterCtrler", assisterDoc, [field("showEffect", "播放退场特效", "Boolean", true)], null, null, { member: "finish", anchor: "finish" });
    method("removeRenderFunc", "移除逐帧回调", "FighterCtrler", fighterDoc, [field("func", "回调函数名称", "Function", "", true)], "3.8开发");
    ["delayCall", "setAnimateFrameOut"].forEach(function (member) { method(member, member === "delayCall" ? "延迟逻辑帧调用" : "延迟动画帧调用", "FighterMain", baseDoc, [field("func", "回调函数名称", "Function", "", true), field("frame", "延迟帧数", "int", 1, true)]); });
    var catalog = Object.create(null);
    specs.forEach(function (spec) { catalog[spec.key] = spec; spec.fields = spec.fields || []; });
    specs.forEach(function (spec) {
        spec.fields.forEach(function (f) {if (/^(?:NullableActionName|ActionName|BindingName)$/.test(f.type)) f.choices = (f.type === "NullableActionName" ? ["null"] : []).concat(bindingNames);});
        var key = spec.semantic || spec.key;
        var quantity = {hp:["hp","current"], hpRate:["hp","ratio"], energy:["energy","current"], getEnergy:["energy","current"], mainenergyMax:["energy","maximum"], maincustomHpMax:["hp","maximum"], qi:["qi","current"]}[key];
        if (quantity) spec.quantity = { resource: quantity[0], basis: quantity[1] };
        if (key === "hpRate") spec.hint = "当前血量占满血的比例，1 为满血；百分比除以 100，几成除以 10，不是绝对血量";
        if (key === "moveToTarget" && spec.fields.some(function (f) {return f.key === "setDirect";})) spec.hint = "移动到对方位置的相对偏移；x 按自身朝向取向，常规面对对方时正数对应身后、负数对应身前；y=0 与对方同高；setDirect 控制移动后面向对方";
    });
    var searchConcepts = [
        {members:["goFrame","gotoAndPlay","gotoAndStop","loop","justHitToPlay"], words:"跳帧 跳转 切换动作 帧标签 goFrame"},
        {members:["isApplyG","setApplyG"], words:"重力 下落"},
        {members:["addRenderFunc","removeRenderFunc","delayCall","setAnimateFrameOut"], words:"逐帧 回调 定时 延迟"}
    ];
    function demoExamples(actor, version) {
        version=version || "3.8开发";
        if (actor === "attacker" && version !== "3.8开发") return [["跳转并播放", "跳到“招2”并播放"],["跳转并停止", "跳到“招3”并停止"],["组合特效", "闪白光并震屏"]];
        if (actor === "character") return [
            ["多条件判断", "血量低于500并且自身在地面时，恢复100血量"],
            ["条件禁用", "血量低于100时禁用su"],
            ["条件登记纽带", "气量不少于150时，获得“招2”纽带"],
            ["修改攻击配置", "攻击k1伤害增加30，然后攻击k2硬直改为500"],
            ["对方状态与瞬移", "如果对方不在空中，瞬移到对方身后"],
            ["逐帧判断", "每帧如果耐力不少于20，闪白光"],
            ["命中后跳帧", "攻击k1命中后跳到“招2”"]
        ];
        return [
            actor === "assister" && version === "3.0" ? ["跳转并播放", "跳到“招2”并播放"] : ["条件跳帧", "血量低于500时，跳到“招2”并播放"],
            actor === "assister" ? ["修改攻击配置", "攻击k1伤害增加30，然后攻击k2硬直改为500"] : ["多条件跳帧", "血量低于500并且自身在空中时，跳到“招2”"],
            ["跳帧与重力", "跳到“招2”并关闭重力"],
            ["组合特效", "闪白光并震屏"]
        ];
    }
    function searchSpecs(terms, actor, version) {
        if (typeof terms === "string") terms = [terms].concat(language.aliasTerms(terms));
        return specs.filter(function (spec) {
            if (!usable(spec,actor,version)) return false;
            var member=spec.member || spec.key, semantic=spec.semantic || member;
            var peers=specs.filter(function (other) {return (other.semantic || other.member || other.key) === semantic;});
            var words=[spec.key,member,spec.owner,spec.output,spec.label,spec.words || "",spec.owner+"."+member,semantic];
            peers.forEach(function (other) {words.push(other.label,other.words || "");});
            searchConcepts.forEach(function (concept) {if (concept.members.includes(member) || concept.members.includes(semantic)) words.push(concept.words);});
            spec.fields.forEach(function (f) {words.push(f.label,f.key);});
            var text=words.join(" ").toLowerCase();
            return terms.some(function (term) {return text.includes(term.toLowerCase());});
        });
    }
    function available(spec, version) { return !spec.since || versions.indexOf(version) >= versions.indexOf(spec.since); }
    function createGraph() { return { format: 1, revision: 3, context: null, version: "3.8开发", actor: "character", root: null, nextId: 1, nodes: [], edges: [], bubbles: [] }; }
    function nodeById(graph, id) { return graph.nodes.find(function (node) { return node.id === id; }); }
    function parameters(spec, values) {
        var params = {};
        spec.fields.forEach(function (f) { params[f.key] = values && values[f.key] !== undefined ? values[f.key] : f.value; });
        return params;
    }
    function addNode(graph, key, options) {
        if (graph.nodes.length >= 150) throw new Error("首版最多放置 150 张卡片");
        var spec = catalog[key];
        if (!spec) throw new Error("未知接口：" + key);
        var node = Object.assign({ id: "n" + graph.nextId++, key: key, x: 40, y: 40, container: null }, options);
        node.params = parameters(spec, options && options.params);
        graph.nodes.push(node);
        return node;
    }
    function addBubble(graph, options) {
        if (graph.bubbles.length >= 40) throw new Error("最多放置 40 个执行块");
        var bubble = Object.assign({ id: "b" + graph.nextId++, x: 590, y: 230, kind: "condition", scheduler: "auto", renderMode: "animation", frames: -1, container: null, extraConditions: [], condition: null, operator: ">=", value: "20", actions: [] }, options);
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
    function findPath(type, target, version, allowManual) {
        var queue = [{ type: type, path: [] }], visited = new Set();
        while (queue.length) {
            var step = queue.shift();
            if (step.type === target) return step.path;
            if (visited.has(step.type)) continue;
            visited.add(step.type);
            specs.filter(function (spec) { return spec.kind === "object" && (!spec.manualPath || allowManual) && spec.owner === step.type && available(spec, version); }).forEach(function (spec) {
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
        return roots.some(function (key) { return findPath(catalog[key].output, spec.owner, version, true) !== null; });
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
            n.params = parameters(catalog[key], n.params);
            try {
                var source = attachPath(graph, n);
                if (source.key === "getHitVO" && hitIds.has(n.id)) source.params.id = hitIds.get(n.id);
            } catch (error) { notes.push(error.message); }
        });
        return Array.from(new Set(notes));
    }
    function blockById(graph, id) { return graph.bubbles.find(function (b) { return b.id === id; }); }
    function conditionsOf(block) {
        return (block.condition ? [{id:block.condition, operator:block.operator, value:block.value, join:"and"}] : []).concat(block.extraConditions || []);
    }
    function setConditions(block, rows) {
        var first = rows[0];
        block.condition = first ? first.id : null;
        if (first) { block.operator = first.operator; block.value = first.value; }
        block.extraConditions = rows.slice(1).map(function (r) { return Object.assign({}, r); });
    }
    function updateCondition(graph, blockId, nodeId, changes) {
        var block = blockById(graph, blockId);
        if (!block) throw new Error("执行块不存在");
        setConditions(block, conditionsOf(block).map(function (r) { return r.id === nodeId ? Object.assign({}, r, changes) : r; }));
    }
    function hasFrameAncestor(graph, block) {
        var seen = new Set();
        while (block) {
            if (seen.has(block.id)) throw new Error("执行块存在嵌套循环");
            seen.add(block.id);
            if (block.kind === "frame") return true;
            block = blockById(graph, block.container);
        }
        return false;
    }
    function promoteFrame(graph, block) {
        if (block.kind === "frame") return;
        if (conditionsOf(block).length) {
            var child = addBubble(graph, {container:block.id, actions:block.actions.slice()});
            setConditions(child, conditionsOf(block));
            conditionsOf(child).map(function (r) {return r.id;}).concat(child.actions).forEach(function (id) {
                (nodeById(graph,id) || blockById(graph,id)).container = child.id;
            });
            setConditions(block, []); block.actions = [child.id];
        }
        block.kind = "frame";
    }
    function detach(graph, id) {
        graph.bubbles.forEach(function (block) {
            setConditions(block, conditionsOf(block).filter(function (r) {return r.id !== id;}));
            block.actions = block.actions.filter(function (value) { return value !== id; });
        });
        var item = nodeById(graph, id) || blockById(graph, id);
        if (item) item.container = null;
    }
    function place(graph, id, blockId, region, index) {
        var node = nodeById(graph, id), child = blockById(graph, id), block = blockById(graph, blockId);
        if ((!node && !child) || !block) throw new Error("卡片或执行块不存在");
        if (region !== "condition" && region !== "actions") throw new Error("未知放置区域");
        if (region === "condition" && (!node || catalog[node.key].kind !== "value")) throw new Error("条件区需要数值、布尔值或文字卡片");
        if (region === "actions" && node && catalog[node.key].kind !== "action") throw new Error("执行区需要操作卡片或执行块");
        var promote = node && (region === "condition" && catalog[node.key].watchCondition || region === "actions" && catalog[node.key].repeatRequired) && !hasFrameAncestor(graph,block);
        if (promote) {
            var pending = block.actions.slice(), visited = new Set();
            while (pending.length) {
                var nested = blockById(graph,pending.pop());
                if (!nested || visited.has(nested.id)) continue;
                visited.add(nested.id);
                if (nested.kind === "frame") throw new Error("已有逐帧子块，请将需要逐帧执行的卡片放入该子块");
                pending = pending.concat(nested.actions);
            }
        }
        if (child) {
            var parent = block, depth = 0;
            while (parent) {
                if (parent.id === id) throw new Error("不能将执行块放入自身或其子块");
                if (++depth > 12) throw new Error("执行块嵌套过深");
                parent = blockById(graph, parent.container);
            }
            var descendants = [child], seen = new Set();
            while (descendants.length) {
                var current = descendants.pop();
                if (seen.has(current.id)) throw new Error("执行块存在嵌套循环");
                seen.add(current.id);
                if (current.kind === "frame" && hasFrameAncestor(graph, block)) throw new Error("逐帧块内请嵌套条件块，避免每帧重复登记循环");
                current.actions.forEach(function (cid) { var nested = blockById(graph, cid); if (nested) descendants.push(nested); });
            }
        }
        var previous = node && conditionsOf(block).find(function (r) {return r.id === id;});
        detach(graph, id);
        if (region === "condition") {
            var spec = catalog[node.key], rows = conditionsOf(block);
            var row = previous || { id:id, operator:spec.output === "Boolean" ? "truthy" : "==", value:spec.output === "String" ? "" : "20", join:"and" };
            rows.splice(index === undefined ? rows.length : index, 0, row); setConditions(block, rows);
        } else {
            block.actions.splice(index === undefined ? block.actions.length : index, 0, id);
        }
        (node || child).container = block.id;
        if (promote) promoteFrame(graph,block);
    }
    function remove(graph, id) {
        var block = blockById(graph, id);
        if (block) {
            var children = conditionsOf(block).map(function (r) {return r.id;}).concat(block.actions);
            var parent = blockById(graph, block.container), position = parent ? parent.actions.indexOf(id) : -1;
            detach(graph, id);
            children.forEach(function (cid, i) {
                var item = nodeById(graph, cid) || blockById(graph, cid);
                if (!item) return;
                item.container = null; item.x = block.x + 440; item.y = block.y + i * 125;
                if (parent && block.actions.includes(cid)) {parent.actions.splice(position++, 0, cid); item.container = parent.id;}
            });
            graph.bubbles = graph.bubbles.filter(function (b) {return b.id !== id;});
        } else {
            detach(graph, id);
            graph.nodes = graph.nodes.filter(function (n) {return n.id !== id;});
            graph.edges = graph.edges.filter(function (e) {return e.from !== id && e.to !== id;});
            graph.nodes.forEach(function (node) {if (node.release) node.release.conditions = node.release.conditions.filter(function (r) {return r.id !== id;});});
        }
    }
    function simplifyDisabledBlocks(graph) {
        if (graph.version !== "3.8开发") return;
        function signature(rows) {
            return JSON.stringify(rows.map(function (r,index) {
                var node = nodeById(graph,r.id);
                return [r.id,r.operator,node && catalog[node.key].output === "Boolean" ? "" : String(r.value),index ? r.join : "and"];
            }));
        }
        var changed = true;
        while (changed) {
            changed = false;
            graph.bubbles.slice().reverse().forEach(function (block) {
                if (block.actions.length !== 1) return;
                var node = nodeById(graph,block.actions[0]);
                if (!node || node.key !== "setDisabled" || !node.release || !node.release.conditions.length) return;
                var rows = conditionsOf(block), same = signature(rows) === signature(node.release.conditions);
                var redundant = block.kind === "condition" ? same && node.release.negate :
                    block.kind === "frame" && Number(block.frames) === -1 && (!rows.length || same && !node.release.negate);
                if (!redundant) return;
                remove(graph,block.id); node.x = block.x; node.y = block.y; changed = true;
            });
        }
    }
    function literal(value, field) {
        if (field.type === "ObjectConfig") {
            if (value === "" || value === "null") return "null";
            var obj; try { obj = JSON.parse(String(value)); } catch (error) { throw new Error(field.label + "需要合法 JSON"); }
            if (!obj || Array.isArray(obj) || typeof obj !== "object") throw new Error(field.label + "需要对象");
            return JSON.stringify(obj).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
        }
        if (/^(?:NullableActionName|ActionName|BindingName)$/.test(field.type)) {
            if (value === "null" && field.type === "NullableActionName") return "null";
            var normalized = value === "moveLEFT" ? "moveLeft" : value === "moveRIGHT" ? "moveRight" : value;
            if (!bindingNames.includes(normalized)) throw new Error("请选择有效的动作标识");
            if (field.type !== "BindingName") normalized = normalized === "moveLeft" ? "moveLEFT" : normalized === "moveRight" ? "moveRIGHT" : normalized;
            return JSON.stringify(normalized);
        }
        if (field.type === "DisableCondition") {
            if (String(value) === "true") return "true";
            if (/^\d+$/.test(String(value)) && Number(value) > 0 && Number(value) <= 2147483647) return String(Number(value));
            if (/^(false|null|undefined|return|function|this)$/.test(String(value))) throw new Error("禁用条件需要 true、正整数帧数或函数名");
            return literal(value, { type: "Function", label: "禁用条件函数" });
        }
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
    function readRange(value) {
        var range;
        try {range=JSON.parse(value);} catch (error) {throw new Error("请填写区间下限和上限");}
        if (!range || typeof range !== "object" || Array.isArray(range) || !["string","number"].includes(typeof range.lower) || !["string","number"].includes(typeof range.upper) || typeof range.includeLower !== "boolean" || typeof range.includeUpper !== "boolean") throw new Error("区间配置无效");
        return range;
    }
    function generate(graph) {
        graph = JSON.parse(JSON.stringify(graph)); simplifyDisabledBlocks(graph);
        var errors = [], lines = [], usedMain = false, scope, targetCount = 0, rangeCount = 0, frameCount = 0, inFrame = false;
        function startScope() { scope = { bindings: new Map(), declarations: [], guards: [] }; }
        function expression(id, visited) {
            var node = nodeById(graph, id);
            if (!node) throw new Error("卡片不存在");
            var spec = catalog[node.key];
            if (spec.repeatRequired && !inFrame) throw new Error(spec.label + "需要放入逐帧执行块");
            if (spec.computedMember && graph.version === "3.0" && ["waiKaiW", "waiKaiS"].includes(node.params.action)) throw new Error("方向变身纽带需要 3.3 起的版本");
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
            if (spec.dynamicOwner || catalog[source.key].nullable) {
                if (!scope.bindings.has(edge.from)) {
                    var targetName = "target" + (++targetCount);
                    scope.bindings.set(edge.from, targetName);
                    scope.declarations.push("var " + targetName + ":* = " + (scope.guards.length ? "(" + scope.guards.join(" && ") + ") ? " + owner + " : null" : owner) + ";");
                    scope.guards.push(targetName + " != null");
                }
                owner = scope.bindings.get(edge.from);
            }
            var args = spec.fields.map(function (f) { return literal(node.params[f.key], f); });
            if (node.key === "setDisabled" && node.release) {
                var actionScope = scope, release = combinedConditions(node.release.conditions);
                if (!release.test) throw new Error("请为禁用卡片选择解除条件");
                args[1] = "function():Boolean\n{\n" + indent(release.prefix + "return " + (node.release.negate ? "(" + release.test + ")" : "!(" + release.test + ")") + ";") + "\n}";
                scope = actionScope;
            }
            if (spec.computedMember) return owner + "." + JSON.parse(args[0]) + " = " + (spec.nullAssignment ? "null" : args[1]);
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
        function frameCode(body, block, stop) {
            var scheduler = block.scheduler || "auto", count = Number(block.frames === undefined ? -1 : block.frames);
            if (!["auto", "delay", "animate", "render"].includes(scheduler)) throw new Error("逐帧调用方式无效");
            if (block.frames === null || !Number.isInteger(count) || count === 0 || count < -1 || count > 2147483647) throw new Error("执行帧数需要正整数，持续执行填 -1");
            if (scheduler === "auto") scheduler = graph.version === "3.8开发" ? "render" : "delay";
            if (scheduler === "render" && graph.version !== "3.8开发") throw new Error("addRenderFunc 需要 3.8开发");
            var owner;
            if (graph.actor === "character") {
                owner = graph.version === "3.8开发" ? "parent.$fighter_ctrler.getSelf()" : "$self_main";
                if (owner === "$self_main") usedMain = true;
            } else {
                var root = graph.actor === "assister" ? "assister" : "attacker", self = catalog[root + "Self"];
                if (!available(self, graph.version)) throw new Error("当前版本缺少逐帧调用所需的自身主体入口");
                owner = catalog[root].code + ".getSelf()";
            }
            var i = ++frameCount, func = "updateFrame" + i, host = "frameOwner" + i, remaining = "frameRemaining" + i;
            var mode = block.renderMode || "animation";
            if (!["animation", "logic", "global"].includes(mode)) throw new Error("逐帧回调分支无效");
            var schedule = host + "." + (scheduler === "animate" ? "setAnimateFrameOut" : "delayCall") + "(" + func + ", 1);";
            var output = "// 登记一次\nvar " + host + ":* = " + owner + ";\n";
            if (count > 0) output += "var " + remaining + ":int = " + count + ";\n";
            output += "function " + func + "():void\n{\n";
            if (stop.test) output += indent(stop.prefix + "if (" + stop.test + ")\n{\n" + (scheduler === "render" ? "    " + host + ".removeRenderFunc(" + func + ");\n" : "") + "    return;\n}") + "\n";
            output += indent(body);
            if (count > 0) output += "\n    if (--" + remaining + " <= 0)\n    {\n" + (scheduler === "render" ? "        " + host + ".removeRenderFunc(" + func + ");\n" : "") + "        return;\n    }";
            if (scheduler !== "render") output += "\n    " + schedule;
            return output + "\n}\n" + (scheduler === "render" ? host + ".addRenderFunc(" + func + (mode === "animation" ? "" : mode === "logic" ? ", {isFollowFps:true}" : ", {isFollowFps:true, isPermanent:true}") + ");" : schedule);
        }
        function indent(body) { return body.split("\n").map(function (line) {return "    " + line;}).join("\n"); }
        function conditionCode(row) {
            startScope();
            var node = nodeById(graph, row.id);
            if (!node || catalog[node.key].kind !== "value") throw new Error("条件块缺少判断条件");
            var spec = catalog[node.key], value = expression(node.id, new Set()), test;
            if (spec.output === "Boolean") {
                if (!["truthy", "falsy"].includes(row.operator)) throw new Error("布尔条件需要选择是或否");
                test = row.operator === "falsy" ? "!(" + value + ")" : value;
            } else if (row.operator === "between" && ["int","uint","Number"].includes(spec.output)) {
                var range=readRange(row.value), lower=literal(range.lower,{type:"Number",label:"区间下限"}), upper=literal(range.upper,{type:"Number",label:"区间上限"});
                if (Number(lower) > Number(upper)) throw new Error("区间下限不能大于上限");
                var name="rangeValue"+(++rangeCount);
                scope.declarations.push("var "+name+":Number = "+(scope.guards.length ? "("+scope.guards.join(" && ")+") ? "+value+" : NaN" : value)+";");
                test=name+(range.includeLower ? " >= " : " > ")+lower+" && "+name+(range.includeUpper ? " <= " : " < ")+upper;
            } else {
                var allowed = spec.output === "String" ? ["==", "!="] : [">=", ">", "<=", "<", "==", "!="];
                if (!allowed.includes(row.operator)) throw new Error("比较方式与返回类型不匹配");
                test = value + " " + row.operator + " " + literal(row.value, {type:spec.output === "String" ? "String" : "Number", label:"比较值"});
            }
            if (scope.guards.length) test = scope.guards.join(" && ") + " && " + test;
            return {test:test, declarations:scope.declarations.slice()};
        }
        function combinedConditions(rows) {
            var test = null, prefix = "";
            rows.forEach(function (row,index) {
                if (index && !["and", "or"].includes(row.join)) throw new Error("条件连接方式无效");
                var operand = conditionCode(row), value = operand.test;
                // Keep nullable reads inside each operand so logical operators short circuit
                if (operand.declarations.length) {
                    if (rows.length > 1) value = "(function():Boolean\n{\n" + indent(operand.declarations.join("\n") + "\nreturn " + value + ";") + "\n})()";
                    else prefix = operand.declarations.join("\n") + "\n";
                }
                test = index ? (index > 1 ? "(" + test + ")" : test) + (row.join === "or" ? " || " : " && ") + value : value;
            });
            return {test:test,prefix:prefix};
        }
        function emitAction(id, stack) {
            var block = blockById(graph, id);
            if (block) return emitBlock(block, stack);
            var node = nodeById(graph, id);
            if (!node || catalog[node.key].kind !== "action") throw new Error("执行区包含无效卡片");
            startScope(); return statement(expression(id, new Set()), scope);
        }
        function emitBlock(block, stack) {
            if (stack.includes(block.id)) throw new Error("执行块存在嵌套循环");
            if (stack.length >= 12) throw new Error("执行块嵌套过深");
            var wasInFrame = inFrame;
            if (inFrame && block.kind === "frame") throw new Error("逐帧块内不能再次登记逐帧循环");
            inFrame = inFrame || block.kind === "frame";
            try {
                var rows = conditionsOf(block), combined = combinedConditions(rows), test = combined.test, prefix = combined.prefix;
                if (!rows.length && block.kind !== "frame") errors.push("条件块缺少判断条件");
                if (!block.actions.length) errors.push(block.kind === "frame" ? "逐帧执行块缺少执行内容" : "条件块缺少执行内容");
                var actions = block.actions.map(function (id) {return attempt(function () {return emitAction(id, stack.concat(block.id));});}).filter(Boolean);
                var body = actions.join("\n");
                if (block.kind === "frame") return frameCode(body, block, combined);
                if (test) {
                    body = prefix + "if (" + test + ")\n{\n" + indent(body) + "\n}";
                }
                return body;
            } finally { inFrame = wasInFrame; }
        }
        var units = graph.nodes.filter(function (n) {return !n.container && catalog[n.key].kind === "action";}).concat(graph.bubbles.filter(function (b) {return !b.container;}));
        units.sort(function (a,b) {return a.y-b.y || a.x-b.x;});
        units.forEach(function (unit) {var code = attempt(function () {return emitAction(unit.id, []);}); if (code) lines.push(code);});
        var releaseValues = new Set(graph.nodes.flatMap(function (n) {return n.release ? n.release.conditions.map(function (r) {return r.id;}) : [];}));
        graph.nodes.filter(function (n) { return !n.container && !releaseValues.has(n.id) && catalog[n.key].kind === "value"; }).forEach(function (n, i) {
            startScope();
            var value = attempt(function () { return expression(n.id, new Set()); });
            if (value && scope.guards.length) value = scope.guards.join(" && ") + " && (" + value + ")";
            if (value && scope.declarations.length) lines.push(scope.declarations.join("\n"));
            if (value) lines.push("var value" + (i + 1) + ":" + catalog[n.key].output + " = " + value + ";");
        });
        var setup = usedMain ? "function get $self_main(): * {for each(var i: * in parent.parent.parent.parent.getGameSprites()) if (i.getDisplay() == parent) return i;}\n\n" : "";
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
        if (!result.blocked && graph.actor === "character" && !graph.root && result.condition && (!result.conditions || result.conditions.length <= 1) && result.condition.key === "justHit" && result.condition.operator === "truthy" && result.actions.length === 1) {
            var jump = result.actions[0];
            if (jump.key === "goFrame" && jump.params.isPlay && !jump.params.playFrame && !jump.explicit) {
                result.actions = [{ key: "justHitToPlay", params: { hitid: result.condition.params.hitId, frame: jump.params.name, noIdle: false, inCludeDefense: result.condition.params.includeDefense }, evidence: result.condition.evidence + " → " + jump.evidence, position: jump.position }];
                result.condition = null;
            }
        }
        var requestedRoot = /从\s*FighterCtrler/.test(text) ? "fighter" : /从\s*(?:FighterMcCtrler|Mc控制器)/.test(text) ? "mc" : null;
        var repeat = result.repeat || result.actions.some(function (a) { return a.key === "disableAction" && graph.version !== "3.8开发" || a.key === "clearBinding"; }) || result.condition && ["CDOK", "getCD", "isDisabled"].includes(result.condition.key);
        var bubble = result.condition || result.blocked || repeat ? addBubble(graph, { x: 560, y: 230, kind: repeat && !result.blocked ? "frame" : "condition", scheduler: result.scheduler || "auto" }) : null;
        if (bubble && bubble.kind === "frame" && result.condition) {
            var inner = addBubble(graph);
            place(graph,inner.id,bubble.id,"actions"); bubble = inner;
        }
        var requestedConditions = result.conditions || (result.condition ? [result.condition] : []);
        if (!result.condition) requestedConditions = [];
        var nativeDisable = graph.version === "3.8开发" && !result.blocked && !result.repeat && requestedConditions.length && result.actions.length && result.actions.every(function (a) {return a.key === "disableAction";}) && requestedConditions.every(function (row) {
            var spec = catalog[row.key];
            return spec && spec.kind === "value" && row.key !== "justHit" && !spec.watchCondition;
        });
        requestedConditions.forEach(function (row) {
            var key = row.key;
            if (repeat && key === "getEnergy" && ["3.0", "3.3", "3.5"].includes(graph.version)) key = "energy";
            if (key === "getEnergy" && graph.root === "main") key = "energy";
            var condition = addNode(graph, contextualKey(key, graph.actor, {}), {params:row.params || {}, x:35, y:260});
            try {attachPath(graph,condition);} catch (error) {notes.push(error.message);}
            if (!result.blocked) {
                place(graph, condition.id, bubble.id, "condition");
                updateCondition(graph,bubble.id,condition.id,{operator:row.operator,value:row.value,join:row.join || "and"});
            }
        });
        result.actions.forEach(function (action, index) {
            var params = Object.assign({}, action.params);
            if (action.key === "setCD" && action.unit) {
                params.time = graph.version === "3.8开发" ? Number(params.time) * (action.unit === "seconds" ? 30 : 1) : "";
                if (graph.version !== "3.8开发") notes.push("旧版 setCD 的时长换算不同，请对照接口说明填写冷却传入值");
            }
            var key = action.key;
            if (key === "disableAction") { key = graph.version === "3.8开发" ? "setDisabled" : "clearBinding"; if (key === "setDisabled") params.condition = "true"; }
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
        if (nativeDisable) {
            var rows = conditionsOf(bubble), disabled = bubble.actions.map(function (id) {return nodeById(graph,id);});
            disabled.forEach(function (node) {node.release = {conditions:rows.map(function (row) {return Object.assign({},row);}),negate:true};});
            remove(graph,bubble.id);
            disabled.forEach(function (node,index) {node.x=bubble.x;node.y=bubble.y+index*135;});
        }
        (result.values || []).forEach(function (value, index) {
            var key = value.key === "getEnergy" && graph.root === "main" ? "energy" : value.key;
            var node = addNode(graph, contextualKey(key, graph.actor, value.params || {}), { params: value.params || {}, x: 40, y: 260 + index * 135 });
            try { attachPath(graph, node); } catch (error) { notes.push(error.message); }
        });
        var suggestions = (result.suggestions || []).map(function (key) { return contextualKey(key, graph.actor, {}); }).filter(function (key, index, keys) { return catalog[key] && keys.indexOf(key) === index && usable(catalog[key], graph.actor, graph.version); });
        return { graph: graph, notes: Array.from(new Set(notes)), suggestions: suggestions, matches: Array.from(new Set(requestedConditions.map(function (r) {return r.evidence;}).concat(result.actions.map(function (a) { return a.evidence; })))) };
    }
    function validateGraph(value) {
        if (!value || value.format !== 1 || !versions.includes(value.version) || (value.actor && !Object.hasOwn(actors, value.actor)) || !Array.isArray(value.nodes) || !Array.isArray(value.edges) || !Array.isArray(value.bubbles)) throw new Error("本地工作台数据无效");
        if (value.revision !== undefined && ![1,2,3].includes(value.revision)) throw new Error("本地工作台版本不支持");
        if (value.nodes.length > 150 || value.edges.length > 150 || value.bubbles.length > 40) throw new Error("卡片数量超出 demo 上限");
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
            if (!Array.isArray(item.actions) || item.actions.length > 170 || typeof item.operator !== "string" || !["number", "string"].includes(typeof item.value) || String(item.value).length > 1000) throw new Error("条件配置无效");
            if (item.extraConditions !== undefined && (!Array.isArray(item.extraConditions) || item.extraConditions.length > 149)) throw new Error("条件配置无效");
            if (item.kind && !["condition", "frame"].includes(item.kind)) throw new Error("执行块类型无效");
            if (item.scheduler && !["auto", "delay", "animate", "render"].includes(item.scheduler)) throw new Error("逐帧调用方式无效");
            if (item.renderMode && !["animation","logic","global"].includes(item.renderMode)) throw new Error("逐帧回调分支无效");
            var frames = Number(item.frames === undefined || item.frames === 0 && (!value.revision || value.revision === 1) ? -1 : item.frames);
            if (item.frames === null || !Number.isInteger(frames) || frames < -1 || frames > 2147483647) throw new Error("执行帧数无效");
            graph.bubbles.push(Object.assign(base, {kind:item.kind || "condition", scheduler:item.scheduler || "auto", renderMode:item.renderMode || "animation", frames:frames, container:null, condition:null, extraConditions:[], operator:item.operator, value:String(item.value), actions:[]}));
        });
        value.bubbles.forEach(function (item) {
            var block = blockById(graph, item.id), rows = conditionsOf(item);
            rows.forEach(function (row) {
                if (!row || typeof row.operator !== "string" || !["number", "string"].includes(typeof row.value) || String(row.value).length > 1000 || row.join !== undefined && !["and","or"].includes(row.join)) throw new Error("条件配置无效");
                var node = nodeById(graph, row.id);
                if (!node || node.container) throw new Error("同一卡片不能同时属于多个区域");
                if (catalog[node.key].kind !== "value") throw new Error("判断条件类型无效");
                node.container = block.id;
            });
            setConditions(block, rows.map(function (r) {return {id:r.id, operator:r.operator, value:String(r.value), join:r.join || "and"};}));
            item.actions.forEach(function (id) {
                var node = nodeById(graph, id), child = blockById(graph, id), target = node || child;
                if (!target || target.container) throw new Error("同一卡片不能同时属于多个区域");
                if (node && catalog[node.key].kind !== "action") throw new Error("执行卡片类型无效");
                block.actions.push(id); target.container = block.id;
            });
        });
        function checkBlocks(block, trail, frame) {
            if (trail.includes(block.id)) throw new Error("执行块存在嵌套循环");
            if (trail.length >= 12) throw new Error("执行块嵌套过深");
            if (frame && block.kind === "frame") throw new Error("逐帧块内不能再次登记逐帧循环");
            block.actions.forEach(function (id) {var nested = blockById(graph,id); if (nested) checkBlocks(nested,trail.concat(block.id),frame || block.kind === "frame");});
        }
        graph.bubbles.forEach(function (block) {checkBlocks(block,[],false);});
        var targets = new Set();
        value.edges.forEach(function (e) {
            if (!e || targets.has(e.to)) throw new Error("同一对象输入存在多个连接");
            targets.add(e.to); connect(graph, e.from, e.to);
        });
        graph.nextId = Math.max(0, ...Array.from(ids, function (id) { return Number(id.slice(1)); })) + 1;
        value.nodes.forEach(function (item) {
            if (!item.release) return;
            if (item.key !== "setDisabled" || !Array.isArray(item.release.conditions) || item.release.conditions.length > 150 || typeof item.release.negate !== "boolean") throw new Error("禁用解除条件无效");
            var rows = item.release.conditions.map(function (row) {
                var node = row && nodeById(graph,row.id);
                if (!node || catalog[node.key].kind !== "value" || typeof row.operator !== "string" || !["number","string"].includes(typeof row.value) || String(row.value).length > 1000 || !["and","or"].includes(row.join)) throw new Error("禁用解除条件无效");
                return {id:row.id,operator:row.operator,value:String(row.value),join:row.join};
            });
            nodeById(graph,item.id).release = {conditions:rows,negate:item.release.negate};
        });
        if (!value.revision || value.revision < 3) {
            value.bubbles.forEach(function (item) {
                var block = blockById(graph,item.id), rows = conditionsOf(block);
                if (item.releaseDisabled && rows.length && hasFrameAncestor(graph,block)) block.actions.forEach(function (id) {
                    var node = nodeById(graph,id);
                    if (node && node.key === "setDisabled") node.release = {conditions:rows.map(function (r) {return Object.assign({},r);}),negate:true};
                });
                if (block.kind === "frame" && rows.length) {block.kind = "condition"; promoteFrame(graph,block);}
            });
        }
        simplifyDisabledBlocks(graph);
        return graph;
    }
    return { demoVersion: demoVersion, readRange: readRange, demoExamples: demoExamples, searchSpecs: searchSpecs, aliasTerms: language.aliasTerms, actors: actors, specs: specs, catalog: catalog, versions: versions, available: available, usable: usable, changeActor: changeActor, conditionsOf: conditionsOf, updateCondition: updateCondition, blockById: blockById, hasFrameAncestor: hasFrameAncestor, promoteFrame: promoteFrame, simplifyDisabledBlocks: simplifyDisabledBlocks, createGraph: createGraph, nodeById: nodeById, addNode: addNode, addBubble: addBubble, connect: connect, attachPath: attachPath, findPath: findPath, place: place, detach: detach, remove: remove, generate: generate, parse: parse, fromText: fromText, validateGraph: validateGraph };
}));
