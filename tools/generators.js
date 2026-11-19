(function (root, factory) {
    var api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.BvnTools = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    var versions = ["3.0", "3.3", "3.5", "3.6", "3.8开发", "FVO"];
    var hitTypes = ["砍", "打", "打（重击）", "魔法", "魔法（重击）", "砍（重击）", "火", "冰", "电", "石化", "抓"];
    var controllers = {
        fighter: { value: "$fighter_ctrler", label: "Fighter 控制器" },
        mc: { value: "parent.$mc_ctrler", label: "Mc 控制器" },
        assister: { value: "$assisterCtrler", label: "辅助人物控制器" },
        attacker: { value: "$attacker_ctrler", label: "攻击对象控制器", since: "3.3", fvo: true }
    };

    function available(item, version) {
        if (item.versions) return item.versions.indexOf(version) !== -1;
        if (!item.since) return true;
        return version === "FVO" ? !!item.fvo : versions.indexOf(version) >= versions.indexOf(item.since);
    }

    function numberField(key, label, value, options) {
        return Object.assign({ key: key, label: label, type: "number", defaultValue: value, step: "any" }, options);
    }

    function boolField(key, label, value, options) {
        return Object.assign({ key: key, label: label, type: "boolean", defaultValue: value }, options);
    }

    function selectField(key, label, value, choices, options) {
        return Object.assign({ key: key, label: label, type: "select", defaultValue: value, choices: choices }, options);
    }

    var attackFields = [
        numberField("power", "攻击力 · power", 0),
        selectField("hitType", "攻击类型 · hitType", "1", hitTypes.map(function (label, i) { return [String(i + 1), (i + 1) + " · " + label]; })),
        numberField("hitx", "横向受力 · hitx", 0),
        numberField("hity", "纵向受力 · hity", 0),
        numberField("hurtTime", "硬直时间 · hurtTime", 300, { min: 0, help: "单位：毫秒" }),
        selectField("hurtType", "受击方式 · hurtType", "0", [["0", "0 · 击退"], ["1", "1 · 击倒"]]),
        boolField("isBreakDef", "破防 · isBreakDef", false),
        numberField("powerRate", "伤害倍率 · powerRate", 1),
        boolField("checkDirect", "背击破防 · checkDirect", true),
        numberField("powerAdd", "攻击力增幅 · powerAdd", 0, { since: "3.5", help: "3.5 为固定加值；3.6 起为百分比" }),
        numberField("slowDown", "慢放时长 · slowDown", 0, { since: "3.5", min: 0, help: "单位：秒" }),
        boolField("focusTarget", "镜头聚焦目标 · focusTarget", false, { since: "3.5" }),
        boolField("isCounterDef", "防御耐力消耗加倍 · isCounterDef", false, { since: "3.8开发" }),
        boolField("isHurtBreak", "允许灵压爆发／替身术脱离 · isHurtBreak", true, { since: "3.8开发" }),
        numberField("hitxDef", "防御横向受力 · hitxDef", 0, { since: "3.8开发", help: "0 表示沿用通常受力" }),
        numberField("holdTime", "命中冻结时长 · holdTime", 0, { since: "3.8开发", min: 0, help: "单位：毫秒；0 沿用效果配置" }),
        { key: "onHit", label: "命中回调 · onHit", type: "text", defaultValue: "", since: "3.8开发", placeholder: "例如 onHit1", help: "已定义的函数名称，不加引号" },
        selectField("doubleHurtType", "第二击受击方式 · doubleHurtType", "0", [["0", "0 · 击退"], ["1", "1 · 击倒"]], { versions: ["FVO"] })
    ];

    function speedFields(axis, label, initial) {
        var condition = {}; condition[axis + "Mode"] = "variable";
        var fixed = {}; fixed[axis + "Mode"] = "fixed";
        return [
            selectField(axis + "Mode", label + "速度", "fixed", [["fixed", "固定速度"], ["variable", "可变速度"]]),
            numberField(axis, "固定速度 · " + axis, initial, { when: fixed }),
            numberField(axis + "_start", "初始速度 · start", initial, { when: condition }),
            numberField(axis + "_add", "加速度 · add", "", { when: condition, placeholder: "留空沿用默认值" }),
            numberField(axis + "_max", "速度上限 · max", "", { when: condition }),
            numberField(axis + "_min", "速度下限 · min", "", { when: condition }),
            numberField(axis + "_hit", "命中后速度 · hit", "", { when: condition })
        ];
    }

    function positionFields(axis, label) {
        var target = {}; target[axis + "Mode"] = "target";
        var offset = {}; offset[axis + "Mode"] = "offset";
        return [
            selectField(axis + "Mode", label + "位置", "source", [["source", "沿用元件位置"], ["offset", "固定偏移"], ["target", "目标定位／跟随"]]),
            numberField(axis, "固定偏移 · " + axis, 0, { when: offset }),
            boolField(axis + "_moveToTarget", "创建时定位到目标", true, { when: target }),
            boolField(axis + "_followTarget", "持续跟随目标", false, { when: target }),
            numberField(axis + "_offset", "目标位置偏移 · offset", "", { when: target }),
            numberField(axis + "_rangeStart", "范围起点 · range[0]", "", { when: target }),
            numberField(axis + "_rangeEnd", "范围终点 · range[1]", "", { when: target })
        ];
    }

    var specs = {
        defineAction: {
            title: "defineAction自动化编写器", nameLabel: "攻击 ID", namePlaceholder: "例如 k1", controllers: ["fighter", "assister"],
            doc: "../#/zh-cn/data-model-classes/HitVO?id=define-action-params",
            groups: [
                { title: "攻击配置", fields: attackFields.slice(0, 7) },
                { title: "非必需参数", collapsible: true, fields: attackFields.slice(7) }
            ]
        },
        fire: {
            title: "fire自动化编写器", nameLabel: "飞行道具元件名称", namePlaceholder: "例如 zh1atm", controllers: ["mc", "attacker", "assister"],
            doc: "../#/zh-cn/core-object-classes/Bullet?id=fire-params",
            groups: [
                { title: "水平方向", fields: speedFields("x", "水平", 5) },
                { title: "竖直方向", fields: speedFields("y", "竖直", 0) },
                { title: "非必需参数", collapsible: true, fields: [
                    numberField("hold", "存在时长 · hold", "", { help: "单位：秒；留空或 -1 不限时长" }),
                    numberField("hits", "可攻击次数 · hits", "", { integer: true, help: "留空或 -1 不限次数" }),
                    numberField("hp", "血量 · hp", "", { integer: true, min: 1, help: "留空使用默认值 100" }),
                    boolField("shadowEnabled", "启用残影", false, { versions: ["FVO", "3.8开发"] }),
                    numberField("shadowR", "残影颜色 · R", 0, { versions: ["FVO", "3.8开发"], when: { shadowEnabled: true }, integer: true }),
                    numberField("shadowG", "残影颜色 · G", 0, { versions: ["FVO", "3.8开发"], when: { shadowEnabled: true }, integer: true }),
                    numberField("shadowB", "残影颜色 · B", 0, { versions: ["FVO", "3.8开发"], when: { shadowEnabled: true }, integer: true })
                ] }
            ]
        },
        addAttacker: {
            title: "addAttacker自动化编写器", nameLabel: "攻击对象元件名称", namePlaceholder: "例如 bsmc", controllers: ["mc", "assister"],
            doc: "../#/zh-cn/core-object-classes/FighterAttacker?id=add-attacker-params",
            groups: [
                { title: "水平方向", fields: positionFields("x", "水平") },
                { title: "竖直方向", fields: positionFields("y", "竖直") },
                { title: "非必需参数", collapsible: true, fields: [boolField("applyG", "受重力影响 · applyG", true), boolField("allowCrossFloor", "允许穿过平台 · allowCrossFloor", false, { since: "3.8开发" })] }
            ]
        }
    };

    function numeric(raw, label, options) {
        options = options || {};
        var text = String(raw).trim();
        if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) throw new Error(label + "需要填写有效数字");
        var value = Number(text);
        if (!Number.isFinite(value) || (options.integer && !Number.isInteger(value))) throw new Error(label + (options.integer ? "需要填写整数" : "需要填写有限数字"));
        if (options.min !== undefined && value < options.min) throw new Error(label + "不能小于 " + options.min);
        return value;
    }

    function boolean(raw) {
        if (raw === true || raw === "true") return true;
        if (raw === false || raw === "false") return false;
        throw new Error("布尔配置必须选择 true 或 false");
    }

    function present(value) { return value !== undefined && value !== null && String(value).trim() !== ""; }
    function valueOf(values, field) { return values[field.key] === undefined ? field.defaultValue : values[field.key]; }
    function expression(value) { return { asExpression: value }; }

    function serialize(value, level, formatted) {
        level = level || 0;
        if (value && value.asExpression) return value.asExpression;
        if (Array.isArray(value)) return "[" + value.map(function (item) { return serialize(item, level, formatted); }).join(", ") + "]";
        if (value && typeof value === "object") {
            var keys = Object.keys(value);
            if (!keys.length) return "{}";
            if (!formatted) return "{" + keys.map(function (key) { return key + ": " + serialize(value[key], level + 1, false); }).join(", ") + "}";
            var pad = "    ".repeat(level + 1);
            return "{\n" + keys.map(function (key) { return pad + key + ": " + serialize(value[key], level + 1, true); }).join(",\n") + "\n" + "    ".repeat(level) + "}";
        }
        return JSON.stringify(value).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }

    function speed(values, axis, initial) {
        var mode = values[axis + "Mode"] || "fixed";
        if (mode === "fixed") {
            var value = numeric(present(values[axis]) ? values[axis] : initial, axis + "速度");
            return axis === "x" && value === 0 ? { start: 0 } : value;
        }
        if (mode !== "variable") throw new Error("请选择有效的速度模式");
        var result = { start: numeric(present(values[axis + "_start"]) ? values[axis + "_start"] : initial, axis + "初始速度") };
        ["add", "max", "min", "hit"].forEach(function (key) { if (present(values[axis + "_" + key])) result[key] = numeric(values[axis + "_" + key], axis + "." + key); });
        if (result.min !== undefined && result.max !== undefined && result.min > result.max) throw new Error(axis + "速度下限不能大于上限");
        return result;
    }

    function position(values, axis) {
        var mode = values[axis + "Mode"] || "source";
        if (mode === "source") return undefined;
        if (mode === "offset") return numeric(present(values[axis]) ? values[axis] : 0, axis + "偏移");
        if (mode !== "target") throw new Error("请选择有效的位置模式");
        var result = {};
        ["moveToTarget", "followTarget"].forEach(function (key) {
            var raw = values[axis + "_" + key];
            if (boolean(raw === undefined ? key === "moveToTarget" : raw)) result[key] = true;
        });
        if (present(values[axis + "_offset"])) result.offset = numeric(values[axis + "_offset"], axis + "偏移");
        var start = values[axis + "_rangeStart"], end = values[axis + "_rangeEnd"];
        if (present(start) !== present(end)) throw new Error(axis + "范围的起点和终点需要一起填写");
        if (present(start)) {
            result.range = [numeric(start, axis + "范围起点"), numeric(end, axis + "范围终点")];
            if (result.range[0] > result.range[1]) throw new Error(axis + "范围起点不能大于终点");
        }
        return result;
    }

    function build(tool, input) {
        var spec = specs[tool];
        if (!spec || !input || versions.indexOf(input.version) === -1) throw new Error("请选择有效的工具和目标版本");
        if (!spec.controllers.some(function (key) { return controllers[key].value === input.controller && available(controllers[key], input.version); })) throw new Error("当前版本不支持此控制器");
        var name = String(input.name || "").trim();
        if (!name) throw new Error("请填写" + spec.nameLabel);
        var v = input.values || {}, params = {}, warnings = [];
        if (tool === "defineAction") {
            attackFields.filter(function (field) { return available(field, input.version); }).forEach(function (field) {
                var raw = valueOf(v, field), value;
                if (field.key === "onHit") {
                    if (!present(raw)) return;
                    raw = String(raw).trim();
                    if (!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(raw)) throw new Error("onHit需要填写已定义的函数名称，不加引号");
                    value = expression(raw);
                } else if (field.type === "boolean") value = boolean(raw);
                else {
                    value = numeric(raw, field.label, field);
                    if (field.choices && !field.choices.some(function (choice) { return Number(choice[0]) === value; })) throw new Error(field.label + "超出可选范围");
                }
                if (["power", "hitType", "hitx", "hity", "hurtTime", "hurtType", "isBreakDef"].indexOf(field.key) !== -1 || value !== field.defaultValue && String(value) !== String(field.defaultValue)) params[field.key] = value;
            });
            if (params.hitType === 1 && params.hurtTime < 100) warnings.push("hitType 为 1 时，游戏会将不足 100 毫秒的硬直提高到 100 毫秒。");
        } else if (tool === "fire") {
            params.x = speed(v, "x", 5); params.y = speed(v, "y", 0);
            ["hold", "hits", "hp"].forEach(function (key) {
                if (!present(v[key])) return;
                var n = numeric(v[key], key, { integer: key !== "hold", min: key === "hp" ? 1 : -1 });
                if (key !== "hp" && n !== -1 && n <= 0) throw new Error(key + "需大于0，或使用-1表示不限制");
                params[key] = n;
            });
            if ((input.version === "FVO" || input.version === "3.8开发") && boolean(v.shadowEnabled === undefined ? false : v.shadowEnabled)) {
                params.effect = { shadow: ["R", "G", "B"].map(function (channel) { return numeric(present(v["shadow" + channel]) ? v["shadow" + channel] : 0, "残影" + channel, { integer: true }); }) };
            }
        } else {
            ["x", "y"].forEach(function (axis) { var value = position(v, axis); if (value !== undefined) params[axis] = value; });
            if (!boolean(v.applyG === undefined ? true : v.applyG)) params.applyG = false;
            if (input.version === "3.8开发" && boolean(v.allowCrossFloor === undefined ? false : v.allowCrossFloor)) params.allowCrossFloor = true;
        }
        var args = JSON.stringify(name);
        if (Object.keys(params).length) args += ", " + serialize(params, 0, input.formatted === true);
        return { code: input.controller + "." + tool + "(" + args + ");", warnings: warnings };
    }

    return { versions: versions, controllers: controllers, specs: specs, available: available, build: build };
}));
