(function (root, factory) {
    var api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.BvnSearchAliases = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    // Each group names one concept; distinct game mechanics stay in separate groups
    var groups = [
        ["反制", "防反", "当身"],
        ["血量", "生命值", "生命"],
        ["最大血量", "血量上限", "血量最大值", "最大生命值", "生命值上限"],
        ["耐力", "体力"],
        ["最大耐力", "耐力上限", "耐力最大值"],
        ["最大气量", "气量上限", "气量最大值"],
        ["辅助能量", "辅助冷却", "辅助冷却值"],
        ["最大辅助能量", "辅助冷却最大值", "辅助能量上限"],
        ["小队模式", "3v3", "3对3", "三对三"],
        ["小队", "队伍"],
        ["人物", "角色"],
        ["飞行道具", "子弹"],
        ["硬直", "僵直"],
        ["替身术", "替身"],
        ["伤害倍率", "攻击力倍数"]
    ];

    function expand(keywords) {
        var result = [], seen = Object.create(null);
        function add(word) {
            var key = word.toLowerCase();
            if (!seen[key]) { seen[key] = true; result.push(word); }
        }
        keywords.forEach(add);
        keywords.forEach(function (keyword) {
            groups.forEach(function (group) {
                if (group.some(function (word) { return word.toLowerCase() === keyword.toLowerCase(); })) group.forEach(add);
            });
        });
        return result;
    }

    return { expand: expand };
}));
