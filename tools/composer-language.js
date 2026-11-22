(function (root, factory) {
    var api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.BvnComposerLanguage = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    // Curated intent families from the chat analysis, with signatures checked against the API docs
    // Quoted labels and numbers are captured as data, never evaluated as scripts
    var number = "(-?\\d+(?:\\.\\d+)?|[零〇一二两三四五六七八九十百千]+)";
    var label = "(?:[“\"「']([^”\"」'\\n]+)[”\"」']|([A-Za-z0-9_\\u4e00-\\u9fff]+?)(?=就跳过去|就切过去|就转过去|继续播|停止播|并|然后|接着|的代码|的写法|有吗|怎么|咋|[，,。；;！？?\\s]|$))";
    function numeric(value) {
        if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
        var digits = "零一二三四五六七八九", units = { 十: 10, 百: 100, 千: 1000 }, total = 0, current = 0;
        value = value.replace(/两/g, "二").replace(/〇/g, "零");
        if (!/[十百千]/.test(value)) return Number(value.split("").map(function (v) { return digits.indexOf(v); }).join(""));
        value.split("").forEach(function (v) {
            if (units[v]) { total += (current || 1) * units[v]; current = 0; }
            else current = digits.indexOf(v);
        });
        return total + current;
    }
    function frame(match, offset) {
        if (match[offset || 1]) return match[offset || 1];
        return (match[(offset || 1) + 1] || "").split(/继续播(?:放)?|停止播(?:放)?|并|然后|接着|的代码|的写法|有吗|怎么|咋/)[0].trim();
    }
    var attributes = { 血: "Hp", 血量: "Hp", 生命值: "Hp", 耐力: "Energy", 体力: "Energy", 气量: "Qi", 气: "Qi", 伤害: "Power", 攻击力: "Power", 威力: "Power", 硬直时间: "HurtTime", 硬直: "HurtTime", 僵直: "HurtTime", 横向受力: "Hitx", 水平受力: "Hitx", 竖直受力: "Hity", 纵向受力: "Hity" };
    var operations = { 回: "add", 掉: "subtract", 设到: "set", 调到: "set", 要: "set", 设成: "set", 置为: "set", 改到: "set", 设: "set", 给: "give", 恢复: "add", 回复: "add", 消耗: "subtract", 扣: "subtract", 增加: "add", 提高: "add", 提升: "add", 加上: "add", 加: "add", 减少: "subtract", 降低: "subtract", 减去: "subtract", 扣除: "subtract", 减: "subtract", 设置为: "set", 设为: "set", 修改为: "set", 调整为: "set", 设置: "set", 改成: "set", 改为: "set", 调成: "set", 为: "set" };
    var bindings = { SJ: ["setSkill1", "砍技1"], WJ: ["setSkill2", "砍技2"], U: ["setZhao1", "招1"], SU: ["setZhao2", "招2"], WU: ["setZhao3", "招3"], ADJ: ["setCatch1", "摔1"], ADU: ["setCatch2", "摔2"], J:["setAttack","砍1"], K:["setJump","跳"], L:["setDash","瞬步"], I:["setBisha","必杀"], WI:["setBishaUP","上必杀"], SI:["setBishaSUPER","超必杀"], KJ:["setAttackAIR","跳砍"], KU:["setSkillAIR","跳招"], KI:["setBishaAIR","空中必杀"] };
    var bindingAliases = {"招1":"U","招2":"SU","招3":"WU","砍技1":"SJ","砍技2":"WJ",ZH1:"U",ZH2:"SU",ZH3:"WU",ZHAO1:"U",ZHAO2:"SU",ZHAO3:"WU",SKILL1:"SJ",SKILL2:"WJ","↓J":"SJ","↑J":"WJ","↓U":"SU","↑U":"WU","↓I":"SI","↑I":"WI"};
    function binding(value) {
        var key = value.toUpperCase().replace(/[+\s]/g, "");
        return bindings[bindingAliases[key] || key];
    }
    var bindingVerbs = "设置|设定|登记|绑定|开启|启用|允许|获得|获取|得到";
    function tokens(text) {
        var words = Object.keys(attributes).concat(Object.keys(operations)).sort(function (a, b) { return b.length - a.length; });
        var result = [], index = 0;
        while (index < text.length) {
            var tail = text.slice(index), m = tail.match(/^[“"「']([^”"」'\n]+)[”"」']/), token = null;
            if (m) token = { kind: "label", value: m[1], raw: m[0] };
            else {
                var word = words.find(function (v) { return tail.startsWith(v); });
                if (word) token = { kind: attributes[word] ? "attribute" : "operation", value: attributes[word] || operations[word], raw: word };
                else if ((m = tail.match(/^(?:招[123]|砍技[12]|[↑↓][+\s]*[A-Za-z]+|[A-Za-z_$][\w$]*)/))) token = { kind: binding(m[0]) ? "binding" : "identifier", value: m[0], raw: m[0] };
                else if ((m = tail.match(new RegExp("^" + number)))) token = { kind: "number", value: numeric(m[0]), raw: m[0] };
            }
            if (token) { token.start = index; token.end = index + token.raw.length; result.push(token); index = token.end; }
            else index++;
        }
        return result;
    }
    function analyze(text, literalRanges) {
        literalRanges = literalRanges || [];
        var list = tokens(text).filter(function (t) { return !literalRanges.some(function (span) { return t.start >= span[0] && t.start < span[1]; }); }), edits = [], registrations = [], declarations = [], entity = null;
        var declarationPattern = /(?:攻击(?:面|ID|编号)?|判定面|编号|(?:命中|打中|击中)(?:编号|ID))\s*(?:[“"「']([^”"」']+)[”"」']|([A-Za-z_$][\w$]*))/ig, declared;
        while ((declared = declarationPattern.exec(text))) {
            var withinLabel = list.some(function (t) { return t.kind === "label" && declared.index > t.start && declared.index < t.end; });
            if (!withinLabel && !literalRanges.some(function (span) { return declared.index >= span[0] && declared.index < span[1]; })) declarations.push({ value: declared[1] || declared[2], start: declared.index, end: declared.index + declared[0].length, event: /^(?:命中|打中|击中)/.test(declared[0]), trailing: /^[\s。；;，,！？?!]*$/.test(text.slice(declared.index + declared[0].length)) });
        }
        function gap(a, b, allowed) { return a && b && allowed.test(text.slice(a.end, b.start)); }
        function symbol(t) { return t && /^(identifier|label|binding)$/.test(t.kind); }
        list.forEach(function (t, i) {
            // Only symbols used as attack IDs establish a reusable attack context
            if (symbol(t)) {
                var after = text.slice(t.end), before = text.slice(0, t.start);
                var attackPrefix = before.match(/(?:攻击(?:面|ID|编号)?|判定面|编号)\s*$/);
                if (attackPrefix) t.attackStart = t.start - attackPrefix[0].length;
                if (/^(?:这一下|这一击|这招)?(?:的)?(?:伤害|攻击力|威力|硬直|僵直|横向受力|水平受力|竖直受力|纵向受力|命中|打中|击中)/.test(after.trimStart()) || /(?:攻击(?:面|ID|编号)?|判定面|编号)\s*$/.test(before)) entity = t;
            }
            if (t.kind === "attribute") {
                var op = list[i + 1], amount = list[i + 2];
                if (!(op && op.kind === "operation" && amount && amount.kind === "number" && gap(t, op, /^(?:的|麻烦|请|帮我|\s)*$/) && gap(op, amount, /^(?:自身|自己|人物|当前|对方|对面|敌人|目标|对手|\s)*$/))) {
                    op = list[i - 2]; amount = list[i - 1];
                    if (!(op && op.kind === "operation" && amount && amount.kind === "number" && gap(op, amount, /^(?:自身|自己|人物|当前|对方|对面|敌人|目标|对手|\s)*$/) && gap(amount, t, /^\s*(?:点|格|%)?(?:的)?\s*$/))) {
                        op = list[i - 1]; amount = list[i + 1];
                        if (!(op && op.kind === "operation" && amount && amount.kind === "number" && gap(op, t, /^(?:自身|自己|人物|当前|对方|对面|敌人|目标|对手|\s)*$/) && gap(t, amount, /^\s*$/))) return;
                    }
                }
                var position = Math.min(t.start, op.start), start = position, end = Math.max(t.end, amount.end);
                var hitField = /^(Power|HurtTime|Hitx|Hity)$/.test(t.value);
                var id = hitField && entity && entity.end <= start ? entity.value : "";
                if (id && /^(?:这一下|这一击|这招|的|\s)*$/.test(text.slice(entity.end, start))) start = entity.attackStart === undefined ? entity.start : entity.attackStart;
                if (hitField && !id) {
                    var qualifier = text.slice(0, start).match(/(?:某个攻击|攻击|技能|这一击|这招)(?:的)?\s*$/);
                    if (qualifier) start -= qualifier[0].length;
                    var context = declarations.filter(function (d) { return d.trailing; });
                    if (declarations.length === 1 && context.length === 1) id = context[0].value;
                }
                var target = false, recipientName = "";
                if (!hitField) {
                    target = /对方|对面|敌人|目标|对手/.test(text.slice(op.end, amount.start));
                    var recipient = text.slice(0, start).match(/(?:让|给|使)?(对方|对面|敌人|目标|对手|我自己|角色本人|自己|自身|本人|人物|我|他)(?:人物|角色)?(?:的)?\s*$/);
                    if (recipient) { recipientName = recipient[1]; target = /对方|对面|敌人|目标|对手/.test(recipientName); start -= recipient[0].length; }
                }
                var unit = (text.slice(amount.end, t.start).match(/^\s*(毫秒|秒|帧|点|格|%)/) || [])[1] || "";
                if (amount.start > t.start) {
                    var suffix = text.slice(amount.end).match(/^\s*(毫秒|秒|帧|点|格|%)/);
                    if (suffix) { unit = suffix[1]; end += suffix[0].length; }
                }
                edits.push({ field: t.value, operation: op.value === "give" ? (hitField ? "set" : op.start < t.start ? "add" : "ambiguous") : op.value, amount: amount.value, entity: id, target: target, recipient: recipientName, position: position, start: start, end: end, unit: unit });
            }
            if (t.kind === "binding" || t.kind === "label" && binding(t.value) && /^\s*(?:纽带|按键|技能)/.test(text.slice(t.end))) {
                var before = text.slice(Math.max(0, t.start - 12), t.start);
                var prefix = before.match(new RegExp("(?:" + bindingVerbs + ")\\s*$"));
                if (!prefix) return;
                var b = binding(t.value), rest = text.slice(t.end), name = rest.match(/^(?:纽带|按键|技能)?\s*(?:为|到|:|使用)?\s*[“"「']([^”"」']+)[”"」']/);
                registrations.push({ key: b[0], frame: name ? name[1] : b[1], start: t.start - prefix[0].length, end: t.end + (name ? name[0].length : (rest.match(/^(?:纽带|按键|技能)/) || [""])[0].length) });
            }
        });
        return { tokens: list, edits: edits, registrations: registrations, declarations: declarations };
    }
    function parse(input) {
        var text = String(input || "").trim().split(/([“"「'][^”"」'\n]*[”"」'])/).map(function (part, index) {
            return index % 2 ? part : part.normalize("NFKC");
        }).join("");
        text = text.split(/([“"「'][^”"」'\n]*[”"」'])/).map(function (part, i) {
            return i % 2 ? part : part.replace(/(?:当)?检测到|检查到|判断出/g, "如果").replace(/跳帧(?:到|至)?|跳转到|跳转至|切到|切去|跳回|转到/g, "跳到").replace(/的同时|与此同时|同时(?!满足)/g, "并");
        }).join("");
        // Request wrappers sit outside the operation; quoted labels are left intact
        text = text.replace(/^(?:(?:大佬们?|各位|请问|请|麻烦(?:帮我)?|帮(?:我|忙)(?:弄|做|配|加(?=一下|一个|个|下))?(?:一下|一个|个|下)?|我想(?:要|让)?|想要?|求(?:一个|个)?)[，,\s]*)+/, "");
        text = text.replace(/(?:[，,]\s*)?(?:能(?:不能)?帮我(?:配|做|弄|加)(?:一下|下)?(?:吗)?|(?:能|可以|可不可以|能不能)(?:配|做)(?:吗)?|怎么(?:写|配|实现)|(?:帮我|麻烦)(?:加上|加一下|配上|配一下|做下|做一下))[？?。！!\s]*$/, "");
        text = text.replace(/^(?:这一击|这次攻击|这招)(?:的)?(?=伤害|攻击力|硬直|僵直|横向受力|竖直受力)/, "");
        var operationContext = /^(?:这招|这个技能|当前招式|当前动作|这段动作)(?:里|中)?(?=消耗|扣|恢复|增加|减少|跳|闪|关闭|开启|移动)/.test(text);
        text = text.replace(/^(?:这招|这个技能|当前招式|当前动作|这段动作)(?:里|中)?(?=消耗|扣|恢复|增加|减少|跳|闪|关闭|开启|移动)/, "");
        var hurtStart = text.match(/^(?:在)?(?:受击|挨打)(?:这段|当前|这个)?(?:效果|动作|动画)(?:的)?(?:开头|开始(?:的)?帧)(?:时|中|里)?[，,\s]*/);
        if (hurtStart) text = text.slice(hurtStart[0].length);
        var hurtContext = text.match(/[，,]\s*(?:给我|帮我)?(?:配|放|加|写)进(?:受击|挨打)(?:效果|动作|动画)?里[。！？?!\s]*$/);
        if (hurtContext) text = text.slice(0, hurtContext.index);
        var actionPlacement = text.match(/[，,]\s*(?:给我|帮我)?(?:接|配|放|加|写)(?:进|到|在)(?:招式|动作)(?:执行)?帧(?:里|中)[。！？?!\s]*$/);
        if (actionPlacement) text = text.slice(0, actionPlacement.index);
        text = text.replace(/^(?:把|将)(?:人物的?|自身的?)?动作(?=跳到|切换到|播放)/, "");
        var currentFrameContext = text.match(/^(?:招式|动作)(?:执行|播放)到(?:这|当前)(?:一)?帧(?:时|就)?[，,\s]*/);
        if (currentFrameContext) text = text.slice(currentFrameContext[0].length);
        var placement = text.match(/[，,]\s*(?:代码)?(?:放|写|加|配)(?:到|在|进)?(?:这|当前)(?:一)?帧(?:里|中)[。！？?!\s]*$/);
        if (placement) text = text.slice(0, placement.index);
        var frameContext = text.match(/^(?:在)?(?:施放|释放|发动|执行|播放)(?:这个|当前|这段)动作(?:时|的帧中|的帧里)[，,\s]*/);
        if (frameContext) text = text.slice(frameContext[0].length);
        text = text.replace(/(?:[，,]\s*)?(?:一次)?(?:就好|就行|就可以了)[。！？?!\s]*$/, "");
        text = text.replace(/[，,]\s*(?:数值|数额|数量|额度|回复量|恢复量|名字|名称|目标标签|具体标签|动作标签|标签)(?:的话)?(?:你|我)?(?:先|暂时|以后|之后|稍后|回头|晚点)?(?:再)?(?:帮我)?(?:决定|确定|填写|指定|补上|定|填|补|选|说)(?:一个|个|一下)?(?:合适(?:的|值)|就行)?[。！？?!\s]*$/, "");
        text = text.replace(/[，,]\s*(?:具体)?(?:回多少|扣多少|加多少|恢复多少)(?:我|你)?(?:还|暂时)?(?:没想好|未确定|以后再定)[。！？?!\s]*$/, "");
        text = text.replace(/[，,]\s*(?:名字|名称|标签名)(?:还|暂时)?(?:没定|未定|没想好)[。！？?!\s]*$/, "");
        // Action-label data is not another command, even when it is unquoted
        var literalRanges = [], literalMatch, literalPattern = new RegExp("(?:跳转(?:到|至)?|跳到|切换到|播放动作|动作到)\\s*(?:(?:已有(?:的)?)?(?:动作标签|帧标签|标签)\\s*|动作(?=\\s|[“\"「'])\\s*)?" + label, "g");
        while ((literalMatch = literalPattern.exec(text))) {
            var rawLabel = literalMatch[1] || literalMatch[2];
            if (!literalMatch[1] && /^第(?:[\d零〇一二两三四五六七八九十百千]|$)/.test(rawLabel)) continue;
            var labelStart = literalMatch.index + literalMatch[0].lastIndexOf(rawLabel);
            literalRanges.push([labelStart, labelStart + rawLabel.length]);
        }
        var slots = analyze(text, literalRanges);
        var result = { context: (hurtContext || hurtStart) ? "hurtFrame" : frameContext ? "actionStart" : (operationContext || currentFrameContext || placement || actionPlacement) ? "actionFrame" : null, intents: slots, condition: null, actions: [], values: [], notes: frameContext ? ["请将这段代码放在该动作开始执行的帧中"] : [], suggestions: [], blocked: false, actor: null };
        var claimed = [], conditions = [], quoted = [];
        var intentText = text.replace(/[“"「'][^”"」'\n]*[”"」']/g, function (value, index) {
            quoted.push([index, index + value.length]); return " ".repeat(value.length);
        });
        literalRanges.forEach(function (span) { quoted.push(span); });
        var intentChars = intentText.split("");
        literalRanges.forEach(function (span) { for (var i = span[0]; i < span[1]; i++) intentChars[i] = " "; });
        intentText = intentChars.join("");
        if (text.length > 4000) { result.notes.push("请把需求拆成不超过 4000 字的一句操作"); return result; }
        function suggest(keys) { keys.forEach(function (key) { if (!result.suggestions.includes(key)) result.suggestions.push(key); }); }
        function consume(m) { claimed.push([m.index, m.index + m[0].length]); }
        function action(key, params, m, hitId) {
            if (claimed.some(function (span) { return m.index >= span[0] && m.index + m[0].length <= span[1]; })) return;
            result.actions.push({ key: key, params: params || {}, evidence: m[0], position: m.position === undefined ? m.index : m.position, hitId: hitId }); consume(m);
        }
        function condition(key, operator, value, m, params) {
            conditions.push({ key: key, operator: operator, value: value, evidence: m[0], position: m.index, params: params || {} }); consume(m);
        }
        function scan(re, fn) {
            var regex = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"), m;
            while ((m = regex.exec(text))) { if (!quoted.some(function (span) { return m.index > span[0] && m.index < span[1]; })) fn(m); if (!m[0].length) break; }
        }
        function matches(pattern, fn) { scan(new RegExp(pattern, "i"), fn); }
        function blocked(note) { result.blocked = true; result.notes.push(note); }
        function attackId(position) {
            var source = position === undefined ? text : text.slice(0, position);
            var re = /(?:攻击(?:面|ID|编号)?|判定面|命中|打中|击中)\s*(?:[“"「']([^”"」'\n]+)[”"」']|([a-zA-Z_$][\w$]*))/ig;
            var match, id = "";
            while ((match = re.exec(source))) { id = match[1] || match[2]; if (position === undefined) break; }
            return id;
        }
        var actor = text.match(/^(?:(?:大佬|请问|请|怎么|如何|咋|我想|想|让|使|给)\s*)*(辅助|攻击对象)(?:自身|自己)?/);
        if (actor) result.actor = actor[1] === "辅助" ? "assister" : "attacker";

        // Troubleshooting and frame scheduling are discovery requests, not executable commands
        var diagnostic = /报错|没反应|没有反应|不生效|失效|不起作用|为什么|为啥|怎么回事|怎么办|咋办|哪里错|无法|不能正常|放在哪(?:一)?帧|放哪帧|写在哪/.test(intentText);
        var blackoutLogic = /黑幕|黑屏|时停/.test(intentText) && /攻击|判定|继续播放|继续动|动画|行动|移动|render/i.test(intentText);
        if (/当身|防反|反制|setHurtAction/.test(intentText)) suggest(["setHurtAction"]);
        if (/命中|打中|击中|justHit/.test(intentText)) suggest(["justHit", "goFrame"]);
        if (/转向|转身|朝向|面向/.test(intentText)) suggest(["setDirectToTarget", "setDirectReverse"]);
        if (/重力|下落/.test(intentText)) suggest(["setApplyG"]);
        if (/无敌/.test(intentText)) suggest(["setAllowBeHit", "isAllowBeHit"]);
        if (/冷却|\bCD\b/i.test(intentText)) suggest(["setCD"]);
        if (/攻击面|伤害|攻击力|硬直/.test(intentText)) suggest(["getHitVO", "setPower", "setHurtTime"]);
        if (/黑幕|黑屏/.test(intentText) && !blackoutLogic) suggest(["bisha", "endBisha"]);
        if (blackoutLogic) suggest(["addRenderFunc", "renderAnimate"]);
        if (/render|逐帧|每帧/i.test(intentText)) suggest(["addRenderFunc", "renderAnimate"]);
        if (diagnostic || blackoutLogic || /addRenderFunc/.test(intentText)) {
            result.notes.push(blackoutLogic ? "黑幕中的动画与判定涉及更新时机，请结合动作帧脚本查看相关接口" : "排查需要对应的帧脚本和触发时机，可先查看下方相关接口");
            return result;
        }
        scan(/(?:逐帧|每(?:一)?帧)(?:执行|检测|判断)?|持续(?:地)?(?:执行|检测|判断)?|一直(?:执行|检测|判断)?/ , function (m) { result.repeat = true; consume(m); });
        scan(/(?:使用|用)?(?:delayCall|setAnimateFrameOut)(?:循环)?/, function (m) { result.repeat = true; result.scheduler = /setAnimate/.test(m[0]) ? "animate" : "delay"; consume(m); });
        var actionAliases = { "招1":"zhao1", "招2":"zhao2", "招3":"zhao3", "砍技1":"skill1", "砍技2":"skill2", "跳招":"skillAIR", "跳砍":"attackAIR", "空中必杀":"bishaAIR", "超必杀":"bishaSUPER", "上必杀":"bishaUP", "必杀":"bisha", "普通攻击":"attack", "普攻":"attack", "防御":"defense", "跳跃":"jump", "瞬步":"dash", "变身":"waiKai", "左移":"moveLeft", "右移":"moveRight", "U":"zhao1", "SU":"zhao2", "WU":"zhao3", "SJ":"skill1", "WJ":"skill2", "J":"attack", "K":"jump", "L":"dash", "I":"bisha", "WI":"bishaUP", "SI":"bishaSUPER", "KU":"skillAIR", "KJ":"attackAIR", "KI":"bishaAIR", "ADJ":"catch1", "ADU":"catch2", "JK":"waiKai", "WJK":"waiKaiW", "SJK":"waiKaiS", "zhao1":"zhao1", "zhao2":"zhao2", "zhao3":"zhao3", "attack":"attack", "skill1":"skill1", "skill2":"skill2" };
        Object.keys(bindingAliases).forEach(function (alias) { actionAliases[alias] = actionAliases[bindingAliases[alias]]; });
        var aliasLookup = {};
        Object.keys(actionAliases).forEach(function (alias) {aliasLookup[alias.toLowerCase()] = actionAliases[alias];});
        var aliases = Object.keys(actionAliases).sort(function (a,b) { return b.length-a.length; }).map(function (alias) {return /^[↑↓]/.test(alias) ? alias[0] + "[+\\s]*" + alias.slice(1) : alias;}).join("|");
        function actionName(value) { return aliasLookup[value.replace(/[+\s]/g, "").toLowerCase()]; }
        matches("(?:解除禁用|恢复使用)\\s*[“\"「']?(" + aliases + ")[”\"」']?(?![A-Za-z0-9_])", function (m) { action("removeDisabled", {action:actionName(m[1])}, m); });
        matches("(?:禁用|禁止使用|不许使用|关闭纽带)\\s*[“\"「']?(" + aliases + ")[”\"」']?(?![A-Za-z0-9_])", function (m) { action("disableAction", {action:actionName(m[1])}, m); });
        scan(/(?:parent\.\$mc_ctrler\.)?getAction\(\)\.([A-Za-z]+[0-9]*)\s*=\s*null\s*;?/, function (m) {
            if (!Object.values(actionAliases).includes(m[1])) { blocked("请确认需要清除的动作纽带属性"); consume(m); return; }
            action("clearBinding", {action:m[1]}, m); result.repeat = true;
        });
        var cdLabel = "(?:[“\"「']([^”\"」']+)[”\"」']|([A-Za-z_$][\\w$]*?))", cdState = "(未结束|没结束|未完成|没有结束|结束|完成|好了)";
        matches("(?:冷却|CD)\\s*(?:ID)?\\s*" + cdLabel + "\\s*(?:的)?" + cdState, function (m) { condition("CDOK", /未|没/.test(m[3]) ? "falsy" : "truthy", "", m, {id:frame(m)}); result.repeat=true; });
        matches(cdLabel + "\\s*(?:的)?(?:冷却|CD)" + cdState, function (m) { condition("CDOK", /未|没/.test(m[3]) ? "falsy" : "truthy", "", m, {id:frame(m)}); result.repeat=true; });
        if (/(?:取消|关闭|结束|不要|别)(?:当身|防反|反制)/.test(intentText)) { result.notes.push("请结合当前动作说明要如何结束当身，再配置状态切换"); return result; }
        if (/(?:素材|原图|序列图|头像|图层|导出|软件)/.test(intentText) && !/跳转|跳到|血量|耐力|气量|攻击力|当身|防反/.test(intentText)) {
            result.notes.push("这是素材或编辑器操作需求，请描述要由脚本实现的效果"); return result;
        }

        matches("(耐力|体力|血量|生命值|气量|气)\\s*(?:(?:范围|数值)\\s*)?(?:介于|处于|位于|落在|范围在|范围为|在|为|是)?\\s*"+number+"\\s*(%|格|点)?\\s*(?:到|至|和|与|~|～|—|-)\\s*"+number+"\\s*(%|格|点)?(?:之间|范围内|区间内|范围|区间)?(?:[（(]([^）)]+)[）)])?",function (m) {
            var key=/耐力|体力/.test(m[1]) ? "getEnergy" : /气/.test(m[1]) ? "qi" : "hp", unit=m[5] || m[3] || "", bounds=m[6] || "";
            if (m[3] && m[5] && m[3] !== m[5] || unit === "%" && key !== "hp" || unit === "格" && key !== "qi") {blocked("区间两端需要使用同一种有效单位");consume(m);return;}
            if (bounds && !/^(?:(?:含|包含|不含|不包含)(?:下限|上限|两端|两侧)[，,、\s]*)+$/.test(bounds)) {blocked("请用包含下限、包含上限或不含两端说明区间边界");consume(m);return;}
            var lo=true,hi=true;
            bounds.replace(/(不包含|不含|包含|含)(下限|上限|两端|两侧)/g,function (_,verb,side) {var included=!verb.startsWith("不");if (side !== "上限") lo=included;if (side !== "下限") hi=included;return _;});
            var rate=unit === "%" ? .01 : unit === "格" ? 100 : 1;
            condition(unit === "%" ? "hpRate" : key,"between",JSON.stringify({lower:String(numeric(m[2])*rate),upper:String(numeric(m[4])*rate),includeLower:lo,includeUpper:hi}),m);
        });
        var operators = { "不足": "<", "少于": "<", "不多于": "<=", "达到": ">=", "不少于": ">=", "不低于": ">=", "至少": ">=", "大于等于": ">=", "小于等于": "<=", "不超过": "<=", "不高于": "<=", "至多": "<=", "高于": ">", "超过": ">", "大于": ">", "低于": "<", "小于": "<", "等于": "==", "不等于": "!=" };
        ["足够", "足以", "够", "不够", "不足以"].forEach(function (word) {
            ["", "支付", "消耗", "扣除", "扣", "使用"].forEach(function (verb) { operators[word + verb] = word.startsWith("不") ? "<" : ">="; });
        });
        matches("(耐力|体力|血量|生命值|气量|气)\\s*(" + Object.keys(operators).sort(function (a, b) { return b.length - a.length; }).join("|") + "|>=|<=|==|!=|>|<)\\s*" + number + "(?![零〇一二两三四五六七八九十百千半\\d.])\\s*(%|格|点)?", function (m) {
            var key = /耐力|体力/.test(m[1]) ? "getEnergy" : /气/.test(m[1]) ? "qi" : "hp";
            if (m[4] === "%" && key !== "hp") { blocked("比例条件目前支持血量，请把耐力或气量换成具体数值"); return; }
            if (m[4] === "格" && key !== "qi") { blocked("格数换算目前用于气量，请为这项属性填写具体数值"); return; }
            condition(m[4] === "%" ? "hpRate" : key, operators[m[2]] || m[2], String(numeric(m[3]) * (m[4] === "%" ? .01 : m[4] === "格" ? 100 : 1)), m);
        });
        scan(/(?:血量|生命值)(?:低于|少于|不足)(?:一半|半血)/, function (m) { condition("hpRate", "<", "0.5", m); });
        scan(/半血以下/, function (m) { condition("hpRate", "<=", "0.5", m); });
        scan(/耐力过载/, function (m) { condition("getEnergyOverload", /没有|未|不处于/.test(text.slice(Math.max(0, m.index - 5), m.index)) ? "falsy" : "truthy", "", m); });
        scan(/(?:(对方|对面|目标|敌人|对手|我方|自己|自身|人物|我)(?:角色|人物)?(?:的)?\s*)?(不在|不处于|未处于|在|处于)?(空中|地面)(?:状态|上)?(?:时)?/, function (m) {
            var target = /对方|对面|目标|敌人|对手/.test(m[1] || ""), negative = /不|未/.test(m[2] || "");
            condition(target ? "targetIsInAir" : "isInAir", (m[3] === "地面") !== negative ? "falsy" : "truthy", "", m);
        });
        matches("(?:当前动作|动作标签)\\s*(?:是|为|等于)\\s*" + label, function (m) { condition("getCurAction", "==", frame(m), m); });
        var states = { "正常": 0, "硬直": 40, "攻击": 10, "使用技能": 11, "使用必杀": 12, "使用超必杀": 13, "跳跃": 14, "瞬步": 15, "当身": 16, "防御": 20, "受击": 21, "被打": 21, "击飞": 22, "击倒弹起": 24, "击倒": 23, "死亡": 30, "卍解": 50, "开场": 60, "胜利": 61, "失败": 62 };
        var stateWords = Object.keys(states).sort(function (a, b) { return b.length - a.length; }).join("|");
        matches("(对方|对面|目标|敌人|对手|我方|自己|自身|人物|我)(?:角色|人物)?(?:的)?(?:状态(?:是|为))?(不处于|没有处于|不在|不是|正在|处于|在|是)?(" + stateWords + ")(?:状态)?(?:中)?(?=时|后|的|[，,。；;\\s]|$)", function (m) {
            var target = /对方|对面|目标|敌人|对手/.test(m[1]);
            condition(target ? "getTargetState" : "actionState", /^不|^没有/.test(m[2] || "") ? "!=" : "==", String(states[m[3]]), m);
        });
        var patientHit = text.match(/(对方|对面|目标|敌人|对手)(?:角色|人物)?\s*吃到\s*(?:[“"「']([^”"」']+)[”"」']|([A-Za-z_$][\w$]*))\s*(?:这一下|这一击|这招)?(?:以后|之后|时|后)/);
        var hit = intentText.match(/(?:命中|打中|击中)/), hitPatientEnd = -1;
        if (patientHit && !quoted.some(function (span) { return patientHit.index >= span[0] && patientHit.index < span[1]; })) {
            hit = { index: patientHit.index, 0: patientHit[0] };
            hitPatientEnd = patientHit.index + patientHit[0].length;
        }
        if (hit && /后|时|如果|当|判断|检测|就/.test(intentText)) {
            var hitEntity = slots.tokens.filter(function (t) { return /^(identifier|label|binding)$/.test(t.kind) && t.end <= hit.index; }).pop();
            if (hitEntity && !/^(?:的)?\s*(?:未|没|没有)?\s*$/.test(text.slice(hitEntity.end, hit.index))) hitEntity = null;
            var eventDeclaration = slots.declarations.find(function (d) { return d.event && d.start === hit.index; });
            var resolvedHit = patientHit && hitPatientEnd >= 0 ? patientHit[2] || patientHit[3] : eventDeclaration ? eventDeclaration.value : attackId(hit.index) || (hitEntity ? hitEntity.value : "");
            var patientTail = text.slice(hit.index + hit[0].length).match(/^\s*(对方|对面|目标|敌人|对手)(?:角色|人物)?/);
            if (patientTail) {
                hitPatientEnd = hit.index + hit[0].length + patientTail[0].length;
                consume({ index: hit.index + hit[0].length, 0: patientTail[0] });
            }
            if (eventDeclaration) {
                var eventPrefix = text.slice(0, eventDeclaration.start).match(/(?:攻击|技能|这次攻击|这招)\s*$/);
                if (eventPrefix) consume({ index: eventDeclaration.start - eventPrefix[0].length, 0: eventPrefix[0] });
                var eventEnd = eventDeclaration.end, eventTail = text.slice(eventEnd).match(/^\s*(?:的)?\s*攻击(?:面)?/);
                consume({ index: eventDeclaration.start, 0: text.slice(eventDeclaration.start, eventEnd + (eventTail ? eventTail[0].length : 0)) });
            }
            if (hitEntity && resolvedHit === hitEntity.value) {
                var hitStart = hitEntity.attackStart === undefined ? hitEntity.start : hitEntity.attackStart;
                consume({ index: hitStart, 0: text.slice(hitStart, hitEntity.end) });
            }
            var hitParams = { hitId: resolvedHit, includeDefense: /包括防御|计入防御/.test(intentText) };
            if (/判断|检测/.test(intentText) && !/后|时|如果/.test(intentText)) { result.values.push({ key: "justHit", params: hitParams }); consume(hit); }
            else {
                var negative = text.slice(0, hit.index).match(/(?:未|没|没有)\s*$/);
                if (negative) consume({ index: hit.index - negative[0].length, 0: negative[0] });
                condition("justHit", negative ? "falsy" : "truthy", "", hit, hitParams);
            }
        }
        if (/气满|满气/.test(intentText) && /如果|时|才|才能/.test(intentText)) {
            var full = text.match(/气满|满气/); condition("qi", ">=", "", full);
            result.notes.push("请在条件块中填写人物实际的满气数值");
        }

        slots.edits.forEach(function (edit) {
            if (edit.operation === "ambiguous") { blocked("请说明是增加当前资源，还是将当前资源设为指定数值"); return; }
            // An elided damage recipient can refer to the immediately preceding hit patient
            var inheritsPatient = hitPatientEnd >= 0 && edit.start >= hitPatientEnd && /^[\s，,]*(?:以后|之后|时|后)?(?:就|再|然后|接着)?\s*$/.test(text.slice(hitPatientEnd, edit.start));
            if (edit.recipient === "他" && !inheritsPatient) { blocked("请明确“他”对应的目标对象"); return; }
            if (inheritsPatient && (edit.recipient === "他" || (!edit.recipient && edit.field === "Hp" && edit.operation === "subtract"))) edit.target = true;
            slots.declarations.filter(function (d) { return d.trailing && edit.entity === d.value; }).forEach(function (d) { consume({ index: d.start, 0: text.slice(d.start, d.end) }); });
            if (edit.target && (edit.field !== "Hp" || edit.unit === "%" || edit.operation === "set")) {
                consume({ index: edit.start, 0: text.slice(edit.start, edit.end) });
                blocked("这类对方属性修改还需明确对应接口，暂不生成自身属性操作"); return;
            }
            if (edit.target) {
                action(edit.operation === "add" ? "targetAddHp" : "targetLoseHp", { v: edit.amount }, { index: edit.start, position: edit.position, 0: text.slice(edit.start, edit.end) }); return;
            }
            if (edit.unit === "%") {
                if (edit.field === "Hp" && edit.operation !== "set") {
                    action(edit.operation === "add" ? "addHpPercent" : "loseHpPercent", { v: edit.amount / 100 }, { index: edit.start, position: edit.position, 0: text.slice(edit.start, edit.end) });
                } else blocked("这部分百分比需要明确计算基准，请先换成具体数值");
                return;
            }
            if (/^(帧|秒|毫秒)$/.test(edit.unit)) {
                if (edit.field !== "HurtTime" || edit.unit === "帧") {
                    blocked("属性时长需要明确单位；硬直按毫秒填写，帧数还需结合动画更新速度换算");
                    return;
                }
                edit.amount *= edit.unit === "秒" ? 1000 : 1;
            }
            if (edit.unit === "格" && edit.field !== "Qi") { blocked("格数换算目前用于气量，请为这项属性填写具体数值"); return; }
            var resource = { Hp: ["addHp", "loseHp", "v"], Energy: ["addEnergy", "loseEnergy", "delta"], Qi: ["addQi", "loseQi", "qi"] }[edit.field];
            var key = edit.operation === "set" ? "set" + edit.field : resource ? resource[edit.operation === "add" ? 0 : 1] : edit.operation + edit.field;
            var param = !resource || edit.operation === "set" ? "value" : edit.operation === "subtract" ? "v" : resource[2], params = {};
            params[param] = edit.amount * (edit.unit === "格" ? 100 : 1);
            action(key, params, { index: edit.start, position: edit.position, 0: text.slice(edit.start, edit.end) }, edit.entity);
        });
        slots.registrations.forEach(function (r) { action(r.key, { action: r.frame }, { index: r.start, 0: text.slice(r.start, r.end) }); });
        var spatial = text.match(new RegExp("(?:对方|对面|目标|敌人)(?:角色|人物)?(?:在|处于)(?:我|自己|自身)?(?:的)?(面前|前方|前面|身后|后方|后面)(?:\\s*(?:距离)?\\s*" + number + "(?:\\s*(?:到|至|~)\\s*" + number + ")?\\s*(?:像素|范围|距离|以内|内)*)?(?:的)?(?:时候|时)?"));
        if (spatial) {
            var distance = spatial[2] === undefined ? null : numeric(spatial[2]), far = spatial[3] === undefined ? distance : numeric(spatial[3]);
            var behind = /身后|后方|后面/.test(spatial[1]), near = spatial[3] === undefined ? 0 : distance;
            var range = distance === null ? "" : JSON.stringify(behind ? [-far, -near] : [near, far]);
            if (distance !== null && (distance < 0 || far < near)) { blocked("距离范围需要从近到远的非负数值"); range = ""; }
            condition("targetInRange", "truthy", "", spatial, { rx: range, ry: "null" });
            if (!range) result.notes.push("已识别对方位置条件，请填写相对朝向的水平范围，例如前方 [0,100]");
        }
        // Registration APIs own their later jump; do not also emit an immediate goFrame
        var registered = false, counter = intentText.match(/当身|防反|反制|\bsetHurtAction\b/);
        if (counter && claimed.some(function (span) { return counter.index >= span[0] && counter.index < span[1]; })) counter = null;
        if (counter) {
            var counterFrame = text.match(new RegExp("(?:当身|防反|反制)[^，。；;\\n]{0,15}?(?:跳转到|跳到|执行|播放|动作为|动作设为)\\s*" + label));
            action("setHurtAction", { action: counterFrame ? frame(counterFrame) : "" }, counterFrame || counter);
            if (!counterFrame) result.notes.push("当身需要填写触发后的已有动作标签");
            registered = true;
        }
        var floor = text.match(new RegExp("(?:落地|触地)(?:后|时)?[^，。；;\\n]{0,6}?(?:跳转到|跳到|播放|执行)\\s*" + label));
        if (floor) { action("setTouchFloor", { frame: frame(floor), breakAct: true }, floor); registered = true; }
        var cooldownLabel = "(?:[“\"「']([^”\"」'\\n]+)[”\"」']|([a-zA-Z_][\\w]*))";
        matches("(?:设置|设定|添加)\\s*(?:冷却|CD)\\s*" + cooldownLabel + "(?:\\s*(?:为|到|:)\\s*|\\s+)" + number + "\\s*(秒|帧)", function (m) {
            action("setCD", { id: frame(m), time: numeric(m[3]) }, m);
            var a = result.actions[result.actions.length - 1]; if (a && a.key === "setCD") a.unit = m[4] === "秒" ? "seconds" : "frames";
        });
        matches("循环播放\\s*(?:(?:已有(?:的)?)?(?:动作标签|帧标签|标签)\\s*|动作(?=\\s|[“\"「'])\\s*)?" + label, function (m) { action("loop", { frame: frame(m) }, m); });
        matches("动作到\\s*(?:(?:已有(?:的)?)?(?:动作标签|帧标签|标签)\\s*)?" + label + "(?:就)?(?:跳过去|切过去|转过去)(停住|停止播放|继续播放|播放)?", function (m) {
            action("goFrame", { name: frame(m), isPlay: !/停/.test(m[3] || ""), playFrame: 0 }, m);
        });
        if (new RegExp("第\\s*" + number + "\\s*帧").test(intentText)) blocked("这里描述的是时间轴帧号；跳帧卡片接收动作标签，请填写已有标签，按帧等待还需配置触发时机");
        if (!registered) {
            matches("(?:跳转(?:到|至)?|跳到|切换到|播放动作)\\s*第\\s*" + number + "\\s*帧", function (m) {
                action("goFrame", { name: "", isPlay: true, playFrame: 0 }, m);
            });
            matches("(?:跳转(?:到|至)?|跳到|切换到|播放动作)\\s*(?:(?:已有(?:的)?)?(?:动作标签|帧标签|标签)\\s*|动作(?=\\s|[“\"「'])\\s*)?" + label, function (m) {
                var playback = text.slice(m.index + m[0].length).match(/^\s*(?:标签)?(?:[，,]?\s*(?:并|接着|然后|再|随后))?\s*(?:继续播(?:放)?|停止播(?:放)?|不播放|停止|停住|播放)/);
                var name = frame(m);
                if (!m[1] && (/^(?:继续播(?:放)?|停止播(?:放)?|播放)$/.test(name) || /^(?:那个|某个).*(?:标签|动作)$/.test(name))) name = "";
                action("goFrame", { name: name, isPlay: !playback || !/停止|不播放|停住/.test(playback[0]), playFrame: 0 }, m);
                if (playback) consume({ index: m.index + m[0].length, 0: playback[0] });
            });
            if (!result.actions.some(function (a) { return a.key === "goFrame"; }) && /\bgoFrame\b/.test(intentText)) {
                action("goFrame", { name: "", isPlay: true, playFrame: 0 }, text.match(/\bgoFrame\b/));
                result.actions[result.actions.length - 1].explicit = true;
            }
        }

        var collision = intentText.match(/(?:碰到|碰撞到?|接触到?|触碰到?)(?:对方|对面|目标|敌人)(?:角色|人物)?(?:的时候|时|后)?/);
        if (collision) {
            var checker = slots.tokens.filter(function (t) { return /^(identifier|label|binding)$/.test(t.kind) && t.end <= collision.index && /^[的\s]*$/.test(text.slice(t.end, collision.index)); }).pop();
            var checkerStart = checker ? (checker.attackStart === undefined ? checker.start : checker.attackStart) : collision.index;
            var collisionSpan = { index: checkerStart, 0: text.slice(checkerStart, collision.index + collision[0].length) };
            var jump = result.actions.find(function (a) { return a.key === "goFrame" && a.position >= collision.index; });
            if (jump && jump.params.isPlay && !jump.params.playFrame) {
                jump.key = "setHitTarget"; jump.params = { checker: checker ? checker.value : "", action: jump.params.name };
                jump.evidence = collisionSpan[0] + " → " + jump.evidence;
            } else {
                action("setHitTarget", { checker: checker ? checker.value : "", action: "" }, collisionSpan);
                result.notes.push("碰撞检测需要待检测对象名称与触发后的动作标签，后续操作写在目标动作帧中");
            }
            consume(collisionSpan); registered = true;
        }
        if (spatial) {
            var capture = intentText.match(/捕捉|捕获|抓取|抓住/);
            if (capture && !claimed.some(function (span) { return capture.index >= span[0] && capture.index < span[1]; })) {
                if (result.actions.some(function (a) { return a.key === "goFrame"; })) consume(capture);
                else {
                    action("goFrame", { name: "", isPlay: true, playFrame: 0 }, capture);
                    result.notes.push("捕捉需要已有的抓取动作及投技判定，请填写要跳转的动作标签");
                }
            }
        }
        [
            ["addHp", "恢复|回复|增加|加", "血量|生命值|血", "v"],
            ["loseHp", "扣除|扣掉|减少|减|扣", "血量|生命值|血", "v"],
            ["addEnergy", "恢复|回复|增加|加", "耐力|体力", "delta"],
            ["loseEnergy", "消耗|扣除|扣掉|减少|扣", "耐力|体力", "v"],
            ["addQi", "恢复|回复|增加|加", "气量|气", "qi"],
            ["loseQi", "消耗|扣除|扣掉|减少|扣", "气量|气", "v"]
        ].forEach(function (rule) {
            var source = "(?:" + rule[1] + ")\\s*(?:自身|人物|当前|自己)?\\s*(?:" + rule[2] + ")\\s*" + number + "|(?:" + rule[1] + ")\\s*" + number + "\\s*(?:点)?(?:" + rule[2] + ")";
            matches(source, function (m) { var params = {}; params[rule[3]] = numeric(m[1] || m[2]); action(rule[0], params, m); });
        });
        [
            ["Hp", "血量|生命值|血", "v", "addHp", "loseHp"],
            ["Energy", "耐力|体力", "delta", "addEnergy", "loseEnergy"],
            ["Qi", "气量|气", "qi", "addQi", "loseQi"]
        ].forEach(function (rule) {
            var recipientWords = "对方|对面|目标|敌人|对手|我自己|角色本人|自己|自身|人物|我|他";
            var missing = "(?:(?:给|让|使)?(" + recipientWords + ")\\s*)?(恢复|回复|增加|加|回|消耗|扣除|扣掉|减少|减|扣|掉)\\s*(?:点)?(" + rule[1] + ")(?![量零〇一二两三四五六七八九十百千\\d])";
            matches(missing, function (m) {
                if (claimed.some(function (span) { return m.index >= span[0] && m.index < span[1]; })) return;
                var target = /对方|对面|目标|敌人|对手/.test(m[1] || "");
                if (m[1] === "他") {
                    if (hitPatientEnd < 0 || !/^[\s，,]*(?:以后|之后|时|后)?(?:就|再|然后|接着)?\s*$/.test(text.slice(hitPatientEnd, m.index))) { blocked("请明确“他”对应的目标对象"); consume(m); return; }
                    target = true;
                }
                if (target && rule[0] !== "Hp") { blocked("这类对方属性修改还需明确对应接口，暂不生成自身属性操作"); consume(m); return; }
                var loss = /消耗|扣|减|掉/.test(m[2]), params = {};
                params[loss ? "v" : rule[2]] = "";
                action(target ? loss ? "targetLoseHp" : "targetAddHp" : rule[loss ? 4 : 3], params, m);
            });
        });
        matches("(?:回血|补血)\\s*" + number + "\\s*(%)?", function (m) { action(m[2] ? "addHpPercent" : "addHp", { v: numeric(m[1]) / (m[2] ? 100 : 1) }, m); });
        [["setHp", "血量|生命值"], ["setEnergy", "耐力|体力"], ["setQi", "气量|气"]].forEach(function (rule) {
            matches("(?:" + rule[1] + ")\\s*(?:设为|设置为|改为|修改为|调成)\\s*" + number, function (m) { action(rule[0], { value: numeric(m[1]) }, m); });
        });
        scan(/(?:取消|关闭|不)(?:破防)|(?:设置|开启|可以|能|会)破防/, function (m) { action("setBreakDef", { value: !/取消|关闭|不/.test(m[0]) }, m, attackId(m.index)); });
        scan(/背(?:对(?:着)?|向)(?:对方|对面|敌人|目标|对手)/, function (m) {
            if (claimed.some(function (span) { return m.index >= span[0] && m.index < span[1]; })) return;
            action("setDirectToTarget", {}, m);
            result.actions.push({ key: "setDirectReverse", params: {}, evidence: m[0], position: m.index + .01 });
            var preceding = text.slice(0, m.index).match(/转(?:个)?身[，,\s]*(?:让|使)?(?:人物|角色)?$/);
            if (preceding) consume({ index: m.index - preceding[0].length, 0: preceding[0] });
            var follow = text.slice(m.index + m[0].length).match(/^[，,\s]*(?:直接)?(?:转过去|转过来|转身)/);
            if (follow) consume({ index: m.index + m[0].length, 0: follow[0] });
        });
        scan(/(?:面向|面朝|面对|朝向|朝)(?:对方|对面|敌人|目标|对手)(?:那边)?|(?:自动转身|自动转向|转向对方)|\bsetDirectToTarget\b/, function (m) { action("setDirectToTarget", {}, m); });
        scan(/反向转身|反向转向|反转朝向|翻转朝向|转身180度|\bsetDirectReverse\b/, function (m) { action("setDirectReverse", {}, m); });
        matches("(向前移动|向后移动|往前挪|往后挪|往前移动|往后移动|向前|前进|向后|后退|挪|移动|冲过去|冲过来)\\s*" + number + "\\s*(?:像素|单位)", function (m) {
            action("moveOnce", { x: /后/.test(m[1]) ? -numeric(m[2]) : numeric(m[2]), y: 0 }, m);
        });
        var directions = "身前|身后|背后|后方|前方|面前|前面|后面|位置|身上";
        matches("(?:移动到|瞬移到|传送到)(?:(?:对方|对面|敌人|目标)(?:的)?(?:((?:" + directions + ")))?|((?:" + directions + ")))(?:\\s*" + number + "\\s*(?:像素|单位)?)?", function (m) {
            var direction = m[1] || m[2] || "", distance = m[3] === undefined ? 50 : Math.abs(numeric(m[3]));
            var x = /身后|背后|后方|后面/.test(direction) ? distance : /身前|前方|面前|前面/.test(direction) ? -distance : 0;
            action("moveToTarget", { x: x, y: 0, setDirect: true }, m);
        });
        scan(/(?:取消|关闭|关掉|关|禁用|不受|不受制于)(?:重力)|(?:开启|恢复|受)(?:重力)/, function (m) { action("setApplyG", { value: !/取消|关闭|关掉|关|禁用|不受/.test(m[0]) }, m); });
        scan(/重力(?:先|暂时|现在)?(?:取消|关闭|关掉|关|禁用|开启|恢复|启用)(?:了)?/, function (m) { action("setApplyG", { value: /开启|恢复|启用/.test(m[0]) }, m); });
        scan(/(?:开启|设置|进入|设为)无敌|(?:取消|关闭|结束)无敌/, function (m) { action("setAllowBeHit", { value: /取消|关闭|结束/.test(m[0]) }, m); });
        if (/无敌/.test(intentText) && !result.actions.some(function (a) { return a.key === "setAllowBeHit"; })) {
            var invulnerable = text.match(/无敌/);
            if (/无敌时/.test(intentText)) condition("isAllowBeHit", "falsy", "", invulnerable);
            else if (/读取|判断|检测|是否/.test(intentText)) {
                result.values.push({ key: "isAllowBeHit", params: {} }); consume(invulnerable);
                result.notes.push("读取的是是否允许受击；false 对应关闭受击判定");
            }
            else action("setAllowBeHit", { value: false }, invulnerable);
        }
        scan(/停止移动|停止运动|\bstopMove\b/, function (m) { action("stopMove", {}, m); });
        scan(/闪(?:白光|红光|蓝光|光)|白色闪光/, function (m) { action("shine", { color: /红/.test(m[0]) ? "0xff0000" : /蓝/.test(m[0]) ? "0x0000ff" : "0xffffff" }, m); });
        scan(/震屏|屏幕抖动|屏幕震动/, function (m) {
            action("shake", {}, m); result.notes.push("震屏暂用强度 3 / 3、时长 0.2 秒，可在卡片中调整");
        });
        scan(/(?:结束|取消|关闭)黑幕|\bendBisha\b/, function (m) { action("endBisha", {}, m); });
        scan(/(?:开启|开始|播放|加上|添加)(?:必杀)?黑幕|\bbisha\b/, function (m) { action("bisha", { isSuper: /拉近镜头|超必杀/.test(intentText) }, m); });
        matches("(?:慢动作|慢放)\\s*" + number + "\\s*秒", function (m) { action("slowDown", { time: numeric(m[1]) }, m); });

        if (!result.actions.length && !conditions.length && /读取|获取|取得|检测|判断|查看|读出/.test(intentText)) {
            var readKey = /耐力|体力/.test(intentText) ? "getEnergy" : /血量|生命值/.test(intentText) ? "hp" : /气量|气/.test(intentText) ? "qi" : /当前动作|动作标签/.test(intentText) ? "getCurAction" : null;
            if (readKey) result.values.push({ key: readKey, params: {} });
        }
        conditions.sort(function (a,b) {return a.position-b.position;});
        conditions.forEach(function (row,index) {
            row.join = "and";
            if (!index) return;
            var previous = conditions[index-1], start = previous.position + previous.evidence.length;
            var between = text.slice(start,row.position), connector = between.match(/^(?:[\s，,]|时|的时候)*(并且|同时满足|以及|而且|且|和|或者|或|&&|\|\|)(?:[\s，,]|如果)*$/);
            if (!connector) {blocked("多个条件之间请明确使用“且”或“或”"); return;}
            row.join = /或|\|\|/.test(connector[1]) ? "or" : "and";
            consume({index:start,0:between});
        });
        if (registered && result.actions.length > 1) blocked("当身、触地或碰撞触发后的其他操作，请写在登记的目标动作帧中");
        result.condition = conditions[0] || null;
        if (result.condition && !result.actions.length && /读取|获取|检测|判断|查看/.test(intentText) && !/如果|时|后/.test(intentText) && !result.blocked) {
            result.values.push({ key: result.condition.key, params: result.condition.params }); result.condition = null;
        }
        if (result.condition && result.actions.some(function (a) { return a.position < result.condition.position; })) blocked("条件前还有独立操作，请把它们拆成两句配置");
        var remaining = text.split("");
        claimed.forEach(function (span) { for (var i = span[0]; i < span[1]; i++) remaining[i] = " "; });
        remaining = remaining.join("");
        if (/否则|或者|并且|同时满足|且|循环|每隔|不要|不能|禁止|不得|别/.test(remaining)) blocked("分支、复合条件、定时循环或否定操作请拆开配置");
        if (/如果|当.{0,20}(?:时|后)|(?:被打|受击|命中|落地|触地)后/.test(remaining) && !result.condition && !registered) blocked("尚未识别触发条件，请补充条件接口");
        if (/(?:血量|生命值|耐力|体力|气量).{0,12}(?:时|才能|才可)/.test(remaining)) blocked("尚未识别这部分数值条件，请换成具体的比较方式");
        if (registered && /跳转|跳到|切换到|播放动作/.test(remaining)) blocked("触发动作请先填写一个目标标签，其余操作放在目标帧中");
        if (/变身|召唤|生成|吸附|拉远|镜头|隐藏|透明|隐身|变蓝|变红|冷却|CD\b|攻击面|被打面/i.test(remaining)) {
            // Attack IDs are labels for the matched HitVO operations, not additional unhandled commands
            var withoutId = remaining.replace(/(?:攻击(?:面|ID|编号)?|判定面)\s*(?:[“"「'][^”"」']+[”"」']|[a-zA-Z_$][\w$]*)/ig, "");
            if (/变身|召唤|生成|吸附|拉远|镜头|隐藏|透明|隐身|变蓝|变红|冷却|CD\b|攻击面|被打面/i.test(withoutId)) blocked("还有未配置的效果，请拆成更具体的操作或从相关接口中补充");
        }
        if (result.actions.some(function (a) { return /(?:set|add|subtract)(?:Power|HurtTime|Hitx|Hity)|setBreakDef/.test(a.key) && !a.hitId; })) result.notes.push("请在“取得攻击配置”卡片中填写已定义的攻击 ID");
        if (/(?:气量|气|耐力)(?:的)?(?:消耗|花费|消耗量)(?:设|改|调|为|是)/.test(remaining)) {
            blocked("这是招式消耗配置；若要在招式执行帧直接消耗资源，请改写为消耗指定数值");
        }
        if (/(?:气量|气|耐力)(?:的)?(?:消耗|花费|消耗量)(?:配置|配一下)/.test(remaining)) {
            blocked("请说明是在招式执行帧消耗资源，还是配置招式登记时的消耗，并补充数值");
        }
        if (result.actions.length || result.condition) {
            var residue = remaining.replace(/(?:攻击(?:面|ID|编号)?|判定面)\s*(?:[“"「'][^”"」']+[”"」']|[a-zA-Z_$][\w$]*)/ig, "");
            if (result.actions.some(function (a) { return a.key === "goFrame"; })) residue = residue.replace(/并停止|停止播放|不播放|并播放/g, "");
            residue = residue.replace(/FighterCtrler|FighterMcCtrler|FighterMC|从|出发|找到|大佬们?|请问|我想|想要|求个?|有没有|有吗|可不可以|能不能|怎么|如何|怎样|咋|写法|代码|接口|效果|人物|角色|自身|自己|当前|攻击对象|辅助|当身|防反|反制|触发|成功|实现|谢谢|麻烦了|一次就行|一下|如果|的话|就|请|让|使|给|将|把|先|然后|接着|再|并|的|个|吗|时候|以后|之后|时|后|点|[\s，,。；;！？?、:：]/g, "");
            if (residue) blocked((/对方|对面|敌人|目标/.test(residue) ? "尚未识别对方相关条件或操作：" : "尚未识别：") + "“" + residue.slice(0, 40) + "”，请补充对应的状态、对象或操作");
        }
        if (/特效/.test(intentText) && !result.actions.some(function (a) { return ["shine", "shake", "bisha", "endBisha"].includes(a.key); })) {
            suggest(["shine", "shake"]);
            result.notes.push("请说明特效类型，例如闪光、震屏；若是已有动作动画，请提供动作标签");
        }
        if (!result.actions.length && !result.values.length && !result.condition && !result.notes.length) result.notes.push("没有匹配到可直接拼装的操作，可查看相关接口或补充效果描述");
        if (!result.actions.length && /转向|转身|朝向/.test(intentText)) result.notes.push("请说明是面向对方，还是反向转身");
        if (result.actions.length > 40) { result.actions = result.actions.slice(0, 40); blocked("操作过多，请拆成较短的需求"); }
        result.actions.sort(function (a, b) { return a.position - b.position; });
        result.conditions = result.condition ? conditions : [];
        return result;
    }
    function aliasTerms(value) {
        var entry = binding(String(value));
        if (!entry) return [];
        var member = entry[0].slice(3);
        return [entry[0], member[0].toLowerCase() + member.slice(1), entry[1]];
    }
    return { parse: parse, analyze: analyze, aliasTerms: aliasTerms };
}));
