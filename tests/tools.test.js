"use strict";

const assert = require("node:assert/strict");
const vm = require("node:vm");
const { test } = require("node:test");
const tools = require("../tools/generators.js");

function generate(tool, values, options) {
    return tools.build(tool, Object.assign({
        version: "3.8开发",
        controller: tool === "defineAction" ? "$fighter_ctrler" : "parent.$mc_ctrler",
        name: tool === "defineAction" ? "k1" : "zh1atm",
        values: values || {}
    }, options));
}

function execute(tool, result) {
    let captured;
    const controller = { [tool]: (...args) => { captured = args; } };
    const onHit1 = () => {};
    vm.runInNewContext(result.code, { $fighter_ctrler: controller, $assisterCtrler: controller, $attacker_ctrler: controller, parent: { $mc_ctrler: controller }, onHit1 });
    return { name: captured[0], params: captured[1], onHit1 };
}

test("attack configuration gates version fields and excludes runtime data", () => {
    const values = { power: 45, powerAdd: 10, slowDown: 0.5, isHurtBreak: false, holdTime: 80, lastDamage: 900 };
    const baseline = execute("defineAction", generate("defineAction", values, { version: "3.0" })).params;
    assert.equal(baseline.power, 45);
    for (const key of ["powerAdd", "slowDown", "isHurtBreak", "holdTime", "lastDamage"]) assert.equal(key in baseline, false);
    const v35 = execute("defineAction", generate("defineAction", values, { version: "3.5" })).params;
    assert.equal(v35.powerAdd, 10);
    assert.equal(v35.slowDown, 0.5);
    assert.equal("holdTime" in v35, false);
    const development = execute("defineAction", generate("defineAction", values)).params;
    assert.equal(development.isHurtBreak, false);
    assert.equal(development.holdTime, 80);
    assert.equal("lastDamage" in development, false);
});

test("callback is a function reference and names are escaped as string values", () => {
    const name = 'k1"; throw new Error("unexpected"); //';
    const result = execute("defineAction", generate("defineAction", { onHit: "onHit1" }, { name }));
    assert.equal(result.name, name);
    assert.equal(result.params.onHit, result.onHit1);
    assert.throws(() => generate("defineAction", { onHit: "onHit1()" }), /函数名称/);
});

test("FVO-only attack parameters stay out of BVN output", () => {
    assert.equal(execute("defineAction", generate("defineAction", { doubleHurtType: "1" }, { version: "FVO" })).params.doubleHurtType, 1);
    assert.equal("doubleHurtType" in execute("defineAction", generate("defineAction", { doubleHurtType: "1" })).params, false);
});

test("output defaults to one line and formatting preserves values and callbacks", () => {
    for (const [tool, values] of [
        ["defineAction", { onHit: "onHit1", power: 45 }],
        ["fire", { xMode: "variable", x_start: -8.5, x_add: 0.25, shadowEnabled: true }],
        ["addAttacker", { xMode: "target", x_rangeStart: -60, x_rangeEnd: 40 }]
    ]) {
        const options = { name: 'test  name "1"\nnext' };
        const single = generate(tool, values, options);
        const formatted = generate(tool, values, { ...options, formatted: true });
        assert.doesNotMatch(single.code, /[\r\n]/);
        assert.match(formatted.code, /\n {4}\w+: /);
        const compactArgs = execute(tool, single);
        const formattedArgs = execute(tool, formatted);
        assert.equal(compactArgs.name, options.name);
        assert.equal(formattedArgs.name, options.name);
        assert.equal(JSON.stringify(compactArgs.params), JSON.stringify(formattedArgs.params));
        if (tool === "defineAction") {
            assert.equal(compactArgs.params.onHit, compactArgs.onHit1);
            assert.equal(formattedArgs.params.onHit, formattedArgs.onHit1);
        }
    }
});

test("negative decimal velocities and variable speed produce valid code", () => {
    const result = execute("fire", generate("fire", { x: "-8.5", yMode: "variable", y_start: "-6", y_add: "0.25", y_min: "-10", y_max: "8", hold: "1.5", hp: "250" }));
    assert.equal(result.params.x, -8.5);
    assert.equal(result.params.y.start, -6);
    assert.equal(result.params.y.add, 0.25);
    assert.equal(result.params.y.min, -10);
    assert.equal(result.params.hold, 1.5);
    assert.equal(result.params.hp, 250);
});

test("zero horizontal velocity explicitly overrides the constructor default", () => {
    const p = execute("fire", generate("fire", { x: "0" })).params;
    assert.equal(p.x.start, 0);
});

test("shadow output has balanced nested objects, including zero color values", () => {
    for (const version of ["3.8开发", "FVO"]) {
        const p = execute("fire", generate("fire", { shadowEnabled: true, shadowR: 0, shadowG: -20, shadowB: 50 }, { version })).params;
        assert.deepEqual(Array.from(p.effect.shadow), [0, -20, 50]);
    }
    assert.equal("effect" in execute("fire", generate("fire", { shadowEnabled: true }, { version: "3.6" })).params, false);
});

test("attacker positions preserve negative offsets and full target ranges", () => {
    const p = execute("addAttacker", generate("addAttacker", { xMode: "target", x_offset: "-20", x_rangeStart: "-60", x_rangeEnd: "40", x_followTarget: true, yMode: "offset", y: "-15", applyG: false, allowCrossFloor: true })).params;
    assert.equal(p.x.offset, -20);
    assert.deepEqual(Array.from(p.x.range), [-60, 40]);
    assert.equal(p.x.followTarget, true);
    assert.equal(p.y, -15);
    assert.equal(p.applyG, false);
    assert.equal(p.allowCrossFloor, true);
    assert.equal("allowCrossFloor" in (execute("addAttacker", generate("addAttacker", { allowCrossFloor: true }, { version: "3.6" })).params || {}), false);
});

test("default attacker call can omit the entire configuration object", () => {
    const p = execute("addAttacker", generate("addAttacker"));
    assert.equal(p.params, undefined);
});

test("invalid input is rejected without generating incomplete code", () => {
    assert.throws(() => generate("fire", { hp: "NaN" }), /数字/);
    assert.throws(() => generate("fire", { x: "1e309" }), /有限数字/);
    assert.throws(() => generate("fire", { hits: "1.2" }), /整数/);
    assert.throws(() => generate("fire", { hp: "0" }), /不能小于/);
    assert.throws(() => generate("fire", { hold: "-0.5" }), /需大于0/);
    assert.throws(() => generate("fire", { xMode: "variable", x_min: 5, x_max: -5 }), /下限/);
    assert.throws(() => generate("addAttacker", { xMode: "target", x_rangeStart: 1 }), /一起填写/);
    assert.throws(() => generate("addAttacker", { xMode: "target", x_rangeStart: 10, x_rangeEnd: -10 }), /起点/);
    assert.throws(() => generate("defineAction", { hitType: 12 }), /范围/);
    assert.throws(() => generate("defineAction", {}, { name: "  " }), /请填写/);
    assert.throws(() => generate("fire", {}, { controller: "$attacker_ctrler", version: "3.0" }), /不支持/);
});

test("hit type warning explains the engine minimum without silently changing input", () => {
    const result = generate("defineAction", { hitType: "1", hurtTime: "50" });
    assert.equal(execute("defineAction", result).params.hurtTime, 50);
    assert.match(result.warnings[0], /100/);
});
