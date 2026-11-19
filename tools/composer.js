(function () {
    "use strict";
    var api = window.BvnComposer;
    var $ = function (id) { return document.getElementById(id); };
    var graph = api.createGraph(), selected = null, pending = null, drag = null, zoom = 1;
    var history = [], saveTimer, noticeTimer, docRequest = 0, docCache = new Map();
    var storageKey = "bvn-api-composer-demo-v1";
    var board = $("board"), world = $("world");
    var stage = document.createElement("div"); stage.style.position = "relative";
    board.insertBefore(stage, world); stage.appendChild(world);

    // Embedded demos inherit the API theme and do not expose a separate switch
    if (window.parent !== window) {
        try {
            var parentRoot = window.parent.document.documentElement;
            function followTheme() {
                var link = window.parent.document.getElementById("theme_css");
                if (link) $("theme_css").href = link.href;
                document.documentElement.dataset.theme = parentRoot.dataset.theme;
                document.documentElement.style.colorScheme = parentRoot.dataset.theme;
            }
            followTheme();
            window.addEventListener("bvn-theme-change", followTheme);
            new MutationObserver(followTheme).observe(parentRoot, { attributes: true, attributeFilter: ["data-theme"] });
        } catch (error) { /* Standalone theme remains available across origins */ }
    }
    function el(tag, cls, text) {
        var node = document.createElement(tag); if (cls) node.className = cls;
        if (text !== undefined) node.textContent = text;
        return node;
    }
    function button(text, handler, cls) {
        var node = el("button", cls, text); node.type = "button"; node.addEventListener("click", handler); return node;
    }
    function notify(message) {
        $("notice").textContent = message; clearTimeout(noticeTimer);
        noticeTimer = setTimeout(function () { $("notice").textContent = ""; }, 6000);
    }
    function remember() { history.push(JSON.stringify(graph)); if (history.length > 40) history.shift(); }
    function save() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function () {
            try { localStorage.setItem(storageKey, JSON.stringify(graph)); $("save-state").textContent = "已保存在此浏览器"; }
            catch (error) { $("save-state").textContent = "可导出组合保存"; }
        }, 180);
    }
    function update(fn) {
        var before = JSON.stringify(graph);
        try { fn(); history.push(before); if (history.length > 40) history.shift(); pending = null; render(); }
        catch (error) { graph = JSON.parse(before); render(); notify(error.message); }
    }
    function summary(node) {
        var spec = api.catalog[node.key];
        if (spec.kind === "root") return spec.code;
        if (spec.assignment) return spec.member + " = " + String(node.params.value);
        return (spec.member || spec.key) + (spec.property ? "" : "(" + spec.fields.map(function (f) {
            var value = node.params[f.key]; return value === "" ? "…" : f.type === "String" ? JSON.stringify(value) : String(value);
        }).join(", ") + ")");
    }
    function nodeElement(node) {
        var spec = api.catalog[node.key], card = el("article", "node");
        card.dataset.node = node.id; card.dataset.kind = spec.kind; card.tabIndex = 0;
        card.setAttribute("aria-label", spec.label + " " + spec.key);
        if (selected === node.id) card.classList.add("selected");
        if (pending === node.id) card.classList.add("pending-source");
        if (!node.container) { card.style.left = node.x + "px"; card.style.top = node.y + "px"; }
        var header = el("div", "node-header"); header.appendChild(el("strong", "", spec.label));
        header.appendChild(el("small", "", spec.since || "3.0")); card.appendChild(header);
        var body = el("div", "node-body"); body.appendChild(el("code", "", summary(node)));
        var detail = spec.kind === "root" ? spec.output : spec.owner + " → " + spec.output;
        body.appendChild(el("p", "", detail)); card.appendChild(body);
        var ports = el("div", "node-ports");
        if (spec.owner) {
            var input = el("div", "port-group"), inPort = el("button", "port");
            inPort.type = "button"; inPort.dataset.port = "in"; inPort.dataset.node = node.id;
            inPort.setAttribute("aria-label", "连接 " + spec.key + " 的 " + spec.owner + " 输入"); inPort.title = "对象输入 · " + spec.owner;
            if (graph.edges.some(function (e) { return e.to === node.id; })) inPort.classList.add("connected");
            input.appendChild(inPort); input.appendChild(el("span", "", spec.owner)); ports.appendChild(input);
        }
        if (spec.output !== "void") {
            var output = el("div", "port-group"); output.appendChild(el("span", "", spec.output));
            var outPort = el("button", "port"); outPort.type = "button"; outPort.dataset.port = "out"; outPort.dataset.node = node.id;
            outPort.title = "输出 · " + spec.output; outPort.setAttribute("aria-label", "从 " + spec.key + " 输出 " + spec.output);
            if (graph.edges.some(function (e) { return e.from === node.id; })) outPort.classList.add("connected");
            output.appendChild(outPort); ports.appendChild(output);
        }
        card.appendChild(ports);
        card.addEventListener("click", function (event) { if (!event.target.closest("button")) select(node.id); });
        card.addEventListener("keydown", function (event) { if (event.target === card && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); select(node.id); } });
        return card;
    }
    function operators(node) {
        var spec = node && api.catalog[node.key];
        if (!spec) return [[">=", "不少于 ≥"], ["==", "等于 ="]];
        if (spec.output === "Boolean") return [["truthy", "是"], ["falsy", "否"]];
        if (spec.output === "String") return [["==", "等于"], ["!=", "不等于"]];
        return [[">=", "不少于 ≥"], [">", "大于 >"], ["<=", "不超过 ≤"], ["<", "小于 <"], ["==", "等于 ="], ["!=", "不等于 ≠"]];
    }
    function choice(choices, value) {
        var select = el("select"); choices.forEach(function (c) { var option = el("option", "", c[1]); option.value = c[0]; select.appendChild(option); }); select.value = value; return select;
    }
    function bubbleElement(bubble) {
        var card = el("section", "bubble"); card.dataset.bubble = bubble.id; card.style.left = bubble.x + "px"; card.style.top = bubble.y + "px";
        if (selected === bubble.id) card.classList.add("selected");
        var header = el("div", "bubble-header"); header.appendChild(el("strong", "", "如果")); header.appendChild(el("span", "", "if (…) { … }")); card.appendChild(header);
        header.addEventListener("click", function () { select(bubble.id); });
        var condition = el("div", "drop-region"); condition.dataset.region = "condition"; condition.dataset.bubble = bubble.id;
        condition.appendChild(el("h3", "", "条件 · 放入一张返回值卡片"));
        var conditionNode = api.nodeById(graph, bubble.condition);
        if (conditionNode) condition.appendChild(nodeElement(conditionNode));
        else condition.appendChild(el("p", "", "将“当前耐力”“是否在空中”等读取值拖到这里"));
        var comparison = el("div", "bubble-comparison");
        var operator = choice(operators(conditionNode), bubble.operator); operator.setAttribute("aria-label", "比较方式");
        operator.addEventListener("change", function () { update(function () { bubble.operator = operator.value; }); }); comparison.appendChild(operator);
        if (!conditionNode || api.catalog[conditionNode.key].output !== "Boolean") {
            var value = el("input"); value.value = bubble.value; value.setAttribute("aria-label", "比较值");
            value.addEventListener("focus", remember);
            value.addEventListener("input", function () { bubble.value = value.value; preview(); save(); }); comparison.appendChild(value);
        }
        condition.appendChild(comparison); card.appendChild(condition);
        var actions = el("div", "drop-region"); actions.dataset.region = "actions"; actions.dataset.bubble = bubble.id;
        actions.appendChild(el("h3", "", "成立时执行 · 按下列顺序"));
        if (!bubble.actions.length) actions.appendChild(el("p", "", "将跳帧、修改属性或特效卡片拖到这里"));
        bubble.actions.forEach(function (id) { var node = api.nodeById(graph, id); if (node) actions.appendChild(nodeElement(node)); });
        card.appendChild(actions); return card;
    }
    function renderCanvas() {
        $("node-layer").replaceChildren(); $("bubble-layer").replaceChildren();
        graph.nodes.filter(function (n) { return !n.container; }).forEach(function (n) { $("node-layer").appendChild(nodeElement(n)); });
        graph.bubbles.forEach(function (b) { $("bubble-layer").appendChild(bubbleElement(b)); });
        $("node-count").textContent = graph.nodes.length + " 张卡片";
        $("empty-board").hidden = graph.nodes.length + graph.bubbles.length > 0;
        resizeWorld(); requestAnimationFrame(drawWires);
    }
    function resizeWorld() {
        var width = 900, height = 760;
        graph.nodes.filter(function (n) { return !n.container; }).forEach(function (n) { width = Math.max(width, n.x + 260); height = Math.max(height, n.y + 160); });
        graph.bubbles.forEach(function (b) {
            var node = world.querySelector('.bubble[data-bubble="' + b.id + '"]');
            width = Math.max(width, b.x + 430); height = Math.max(height, b.y + (node ? node.offsetHeight : 400) + 60);
        });
        world.style.width = width + "px"; world.style.height = height + "px";
        world.style.transformOrigin = "top left"; world.style.transform = "scale(" + zoom + ")";
        world.style.position = "absolute"; stage.style.width = width * zoom + "px"; stage.style.height = height * zoom + "px";
    }
    function point(port) {
        var rect = port.getBoundingClientRect(), base = world.getBoundingClientRect();
        return { x: (rect.left + rect.width / 2 - base.left) / zoom, y: (rect.top + rect.height / 2 - base.top) / zoom };
    }
    function drawWires() {
        var svg = $("wires"); svg.replaceChildren();
        function path(a, b, temporary) {
            var line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            var bend = Math.max(50, Math.abs(b.x - a.x) * .45);
            line.setAttribute("d", "M" + a.x + "," + a.y + " C" + (a.x + bend) + "," + a.y + " " + (b.x - bend) + "," + b.y + " " + b.x + "," + b.y);
            line.setAttribute("class", "wire" + (temporary ? " pending" : "")); svg.appendChild(line);
        }
        graph.edges.forEach(function (edge) {
            var a = world.querySelector('button[data-port="out"][data-node="' + edge.from + '"]'), b = world.querySelector('button[data-port="in"][data-node="' + edge.to + '"]');
            if (a && b) path(point(a), point(b));
        });
        if (pending && drag && drag.kind === "wire") {
            var port = world.querySelector('button[data-port="out"][data-node="' + pending + '"]');
            if (port) path(point(port), drag.point, true);
        }
    }
    function select(id) { selected = id; renderCanvas(); renderInspector(); }
    function clearSelection() { selected = null; pending = null; renderCanvas(); renderInspector(); }
    function constrainInspector() {
        var panel = $("inspector"), frame = $("canvas-frame");
        if (panel.hidden) return;
        if (panel.style.left) panel.style.left = Math.max(12, Math.min(frame.clientWidth - panel.offsetWidth - 12, panel.offsetLeft)) + "px";
        panel.style.top = Math.max(12, Math.min(frame.clientHeight - panel.offsetHeight - 12, panel.offsetTop)) + "px";
    }
    function renderLibrary() {
        var list = $("library-list"); list.replaceChildren();
        var query = $("library-search").value.trim().toLowerCase();
        var terms = window.BvnSearchAliases ? window.BvnSearchAliases.expand([query]) : [query];
        var count = 0;
        [["root", "可用对象"], ["object", "取得对象"], ["value", "读取值 / 判断条件"], ["action", "执行操作"]].forEach(function (group) {
            var items = api.specs.filter(function (spec) {
                return spec.kind === group[0] && api.usable(spec, graph.actor, graph.version) && (!query || terms.some(function (q) { return (spec.key + " " + spec.label + " " + spec.owner + " " + (spec.words || "")).toLowerCase().includes(q); }));
            });
            if (items.length) list.appendChild(el("h3", "library-group", group[1]));
            items.forEach(function (spec) {
                var item = button("", function () { addInterface(spec.key); }, "library-item"); item.dataset.kind = spec.kind;
                item.appendChild(el("strong", "", spec.label)); item.appendChild(el("code", "", (spec.member || spec.key) + (spec.since ? " · " + spec.since + "起" : "")));
                item.disabled = !api.available(spec, graph.version); list.appendChild(item); count++;
            });
        });
        $("library-count").textContent = count + " 项";
    }
    function addInterface(key) {
        update(function () {
            var spec = api.catalog[key], index = graph.nodes.filter(function (n) { return !n.container && api.catalog[n.key].kind !== "object" && api.catalog[n.key].kind !== "root"; }).length;
            var node = api.addNode(graph, key, { x: 35 + index % 3 * 230, y: 300 + Math.floor(index / 3) * 140 });
            if (spec.kind === "root") { node.x = 35; node.y = 45 + graph.nodes.filter(function (n) { return api.catalog[n.key].kind === "root"; }).length * 135; }
            else if ($("auto-path").checked) {
                try { api.attachPath(graph, node); } catch (error) { notify(error.message); }
            }
            selected = node.id;
        });
    }
    function preview() {
        var result = api.generate(graph);
        $("code").textContent = result.code || (result.errors.length ? "补齐参数和连接后显示代码" : "从卡片中生成的代码会显示在这里");
        $("copy").disabled = !result.code; $("errors").replaceChildren();
        result.errors.forEach(function (error) { $("errors").appendChild(el("p", "", error)); });
        $("undo").disabled = !history.length;
    }
    function renderInspector() {
        var host = $("inspector-fields"); host.replaceChildren(); $("doc-panel").hidden = true; $("selection-type").textContent = ""; docRequest++;
        var node = api.nodeById(graph, selected), bubble = graph.bubbles.find(function (b) { return b.id === selected; });
        $("inspector").hidden = !node && !bubble;
        if (bubble) {
            host.appendChild(el("h3", "", "条件泡泡"));
            host.appendChild(el("p", "muted", "把读取值放进条件区，把操作放进执行区。拖动执行区内的卡片可以调整顺序。"));
            host.appendChild(button("删除泡泡，保留卡片", function () { update(function () { api.remove(graph, bubble.id); selected = null; }); }, "danger"));
            return;
        }
        if (!node) { host.appendChild(el("p", "muted", "选中一张卡片，查看参数与说明。")); return; }
        var spec = api.catalog[node.key]; $("selection-type").textContent = spec.output;
        host.appendChild(el("h3", "", spec.label)); host.appendChild(el("div", "signature", (spec.owner ? spec.owner + "." : "") + (spec.member || spec.key) + (spec.property || spec.assignment || spec.kind === "root" ? "" : "(…)") + " → " + spec.output));
        if (!spec.fields.length) host.appendChild(el("p", "muted", spec.kind === "root" ? "作为其他卡片的调用起点。" : "此接口无需参数。"));
        spec.fields.forEach(function (field) {
            var label = el("label", "", field.label); label.appendChild(el("span", "field-type", field.type));
            var input = field.type === "Boolean" ? choice([["true", "是 · true"], ["false", "否 · false"]], String(node.params[field.key])) : el("input");
            if (field.type !== "Boolean") { input.value = node.params[field.key]; input.type = "text"; input.autocomplete = "off"; }
            input.setAttribute("aria-label", field.label); input.addEventListener("focus", remember);
            input.addEventListener(field.type === "Boolean" ? "change" : "input", function () {
                node.params[field.key] = field.type === "Boolean" ? input.value === "true" : input.value;
                var card = world.querySelector('.node[data-node="' + node.id + '"] .node-body code'); if (card) card.textContent = summary(node);
                preview(); resizeWorld(); requestAnimationFrame(drawWires); save();
            }); label.appendChild(input); host.appendChild(label);
        });
        var buttons = el("div", "inspector-buttons");
        if (spec.owner) {
            buttons.appendChild(button("补齐对象路径", function () { update(function () { api.attachPath(graph, node); }); }));
            buttons.appendChild(button("断开对象连接", function () { update(function () { graph.edges = graph.edges.filter(function (e) { return e.to !== node.id; }); }); }));
        }
        if (node.container) buttons.appendChild(button("移回工作台", function () { update(function () { api.detach(graph, node.id); node.x = 35; node.y = 420; }); }));
        var bubbles = graph.bubbles;
        if (!node.container && bubbles.length && ["value", "action"].includes(spec.kind)) buttons.appendChild(button("放入条件泡泡", function () { update(function () { api.place(graph, node.id, bubbles[0].id, spec.kind === "value" ? "condition" : "actions"); }); }));
        buttons.appendChild(button("删除卡片", function () { update(function () { api.remove(graph, node.id); selected = null; }); }, "danger")); host.appendChild(buttons);
        showDoc(spec);
    }
    async function showDoc(spec) {
        var requestId = ++docRequest, path = spec.doc + ".md", anchor = (spec.anchor || spec.key).toLowerCase();
        var url = new URL("../index.html", location.href); url.hash = "#/" + spec.doc + (spec.kind === "root" ? "" : "?id=" + anchor);
        $("doc-link").href = url.href; $("doc-panel").hidden = false; $("doc-excerpt").textContent = "读取项目文档…";
        try {
            if (!docCache.has(path)) docCache.set(path, fetch(new URL("../" + path, location.href)).then(function (response) { if (!response.ok) throw new Error("文档暂不可用"); return response.text(); }).catch(function (error) { docCache.delete(path); throw error; }));
            var source = await docCache.get(path);
            if (requestId !== docRequest) return;
            var lines = source.split(/\r?\n/), start = -1;
            lines.some(function (line, index) {
                if (/^> #{5,6} /.test(line) && line.replace(/^> #{5,6} /, "").replace(/^3\.\d+(?:开发)?增加\s*/, "").toLowerCase() === anchor) { start = index; return true; } return false;
            });
            var section = start < 0 ? source.slice(0, 900) : lines.slice(start + 1).join("\n").split(/\n> #{5,6} /)[0];
            var description = section.match(/说明：[\s\S]*?(?=使用示例：|```|$)/);
            var text = description ? description[0] : section.split(/```/)[0];
            $("doc-excerpt").textContent = text.replace(/<[^>]*>/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*`#>]/g, "").trim().slice(0, 650) || "通过上方链接查看完整说明与使用示例。";
        } catch (error) { if (requestId === docRequest) $("doc-excerpt").textContent = "暂时无法读取说明，可以通过上方链接打开文档。"; }
    }
    function render() {
        $("actor").value = graph.actor; $("version").value = graph.version;
        var examples = graph.actor === "character" ? [
            ["耐力条件与跳帧", "耐力不少于20时，跳到“招2”并播放"],
            ["血量条件与恢复", "血量低于500时，恢复100点血量并闪白光"],
            ["修改攻击配置", "将攻击“k1”的攻击力改为80"]
        ] : [
            ["跳转动作", "跳到“招2”并播放"],
            ["闪光与震屏", "闪白光并震屏"],
            graph.actor === "assister" ? ["修改攻击配置", "将攻击“k1”的攻击力改为80"] : ["血量条件与跳帧", "血量低于500时，跳到“招2”并播放"]
        ];
        document.querySelectorAll("[data-example]").forEach(function (button, index) { button.textContent = examples[index][0]; button.dataset.example = examples[index][1]; });
        renderLibrary(); renderCanvas(); renderInspector(); preview(); save();
    }
    function arrange() {
        var levels = new Map(), slots = {};
        function depth(node, stack) {
            if (levels.has(node.id)) return levels.get(node.id);
            if (stack.has(node.id)) return 0;
            stack.add(node.id);
            var edge = graph.edges.find(function (e) { return e.to === node.id; });
            var parent = edge && api.nodeById(graph, edge.from);
            var level = parent ? depth(parent, stack) + 1 : 0; levels.set(node.id, level); return level;
        }
        var bottom = 80, objectBottom = 80;
        graph.nodes.filter(function (n) { return !n.container && ["root", "object"].includes(api.catalog[n.key].kind); }).forEach(function (n) {
            var level = depth(n, new Set()), row = slots[level] || 0; slots[level] = row + 1;
            n.x = 35 + level * 230; n.y = 45 + row * 140; bottom = Math.max(bottom, n.y + 130);
            if (level > 0) objectBottom = Math.max(objectBottom, n.y + 130);
        });
        graph.bubbles.forEach(function (b, i) { b.x = 265 + i * 420; b.y = objectBottom + 50; });
        graph.nodes.filter(function (n) { return !n.container && ["value", "action"].includes(api.catalog[n.key].kind); }).forEach(function (n, i) { n.x = 35; n.y = bottom + 50 + i * 140; });
    }
    function fit() {
        var right = 400, bottom = 400;
        graph.nodes.filter(function (n) { return !n.container; }).forEach(function (n) { right = Math.max(right, n.x + 230); bottom = Math.max(bottom, n.y + 150); });
        graph.bubbles.forEach(function (b) { var element = world.querySelector('.bubble[data-bubble="' + b.id + '"]'); right = Math.max(right, b.x + 400); bottom = Math.max(bottom, b.y + (element ? element.offsetHeight : 420) + 30); });
        zoom = Math.max(.45, Math.min(1, (board.clientWidth - 15) / right, (board.clientHeight - 15) / bottom));
        board.scrollLeft = 0; board.scrollTop = 0; resizeWorld(); requestAnimationFrame(drawWires);
    }
    function extract() {
        if (!$("prompt").value.trim()) { notify("先写一句想实现的效果"); return; }
        var result = api.fromText($("prompt").value, graph.version, graph.actor);
        update(function () { graph = result.graph; arrange(); selected = null; });
        $("matches").replaceChildren();
        result.matches.forEach(function (match) { $("matches").appendChild(el("span", "", match)); });
        result.notes.forEach(function (note) { $("matches").appendChild(el("span", "match-note", note)); });
        if (result.matches.length) $("matches").appendChild(el("span", "match-note", "已替换工作台内容，可撤销恢复上一个组合"));
        requestAnimationFrame(function () {
            fit();
            document.querySelector(".basket").scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"
            });
        });
    }
    function position(event) { var rect = world.getBoundingClientRect(); return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom }; }
    function startWire(id) { pending = id; renderCanvas(); notify("连接到另一张卡片左侧的圆点；返回值卡片可直接拖入条件区"); }
    function finishWire(id) {
        if (!pending) { notify("先选择一张卡片右侧的输出圆点"); return; }
        var from = pending; update(function () { api.connect(graph, from, id); selected = id; });
    }
    world.addEventListener("pointerdown", function (event) {
        if (event.button !== 0 || event.target.closest("input, select")) return;
        var port = event.target.closest("button[data-port]");
        if (port) {
            event.preventDefault();
            if (port.dataset.port === "in") { finishWire(port.dataset.node); return; }
            startWire(port.dataset.node); drag = { kind: "wire", point: position(event), startX: event.clientX, startY: event.clientY, moved: false }; return;
        }
        var header = event.target.closest(".node-header, .bubble-header");
        if (!header) return;
        event.preventDefault();
        var card = header.parentElement, id = card.dataset.node || card.dataset.bubble;
        var rect = card.getBoundingClientRect(), point = position(event), base = world.getBoundingClientRect();
        selected = id; renderInspector();
        drag = { kind: "card", id: id, card: card, startX: event.clientX, startY: event.clientY, offsetX: point.x - (rect.left - base.left) / zoom, offsetY: point.y - (rect.top - base.top) / zoom, moved: false };
    });
    board.addEventListener("pointerdown", function (event) {
        if (event.button !== 0 || event.target.closest(".node, .bubble")) return;
        clearSelection();
        if (event.pointerType !== "touch") {
            event.preventDefault();
            drag = { kind: "pan", startX: event.clientX, startY: event.clientY, left: board.scrollLeft, top: board.scrollTop };
            world.style.cursor = "grabbing";
        }
    });
    $("inspector-heading").addEventListener("pointerdown", function (event) {
        if (event.button !== 0 || event.target.closest("button")) return;
        event.preventDefault();
        var panel = $("inspector");
        drag = { kind: "inspector", startX: event.clientX, startY: event.clientY, left: panel.offsetLeft, top: panel.offsetTop };
    });
    window.addEventListener("pointermove", function (event) {
        if (!drag) return;
        if (drag.kind === "inspector") {
            var panel = $("inspector"), frame = $("canvas-frame");
            panel.style.left = Math.max(12, Math.min(frame.clientWidth - panel.offsetWidth - 12, drag.left + event.clientX - drag.startX)) + "px";
            panel.style.top = Math.max(12, Math.min(frame.clientHeight - panel.offsetHeight - 12, drag.top + event.clientY - drag.startY)) + "px";
            panel.style.right = "auto";
            return;
        }
        if (drag.kind === "pan") {
            board.scrollLeft = drag.left - event.clientX + drag.startX;
            board.scrollTop = drag.top - event.clientY + drag.startY;
            return;
        }
        if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5) drag.moved = true;
        if (drag.kind === "wire") { drag.point = position(event); drawWires(); return; }
        if (!drag.moved) return;
        if (!drag.ghost) { drag.ghost = drag.card.cloneNode(true); drag.ghost.classList.add("drag-ghost"); drag.ghost.style.position = "absolute"; drag.ghost.style.width = drag.card.offsetWidth + "px"; world.appendChild(drag.ghost); drag.card.classList.add("is-dragging"); }
        var point = position(event); drag.ghost.style.left = Math.max(10, point.x - drag.offsetX) + "px"; drag.ghost.style.top = Math.max(10, point.y - drag.offsetY) + "px";
        world.querySelectorAll(".drop-hover").forEach(function (n) { n.classList.remove("drop-hover"); });
        var target = document.elementFromPoint(event.clientX, event.clientY), region = target && target.closest(".drop-region");
        if (region && api.nodeById(graph, drag.id)) region.classList.add("drop-hover");
    });
    window.addEventListener("pointerup", function (event) {
        if (!drag) return;
        var action = drag; drag = null;
        if (action.kind === "inspector") return;
        if (action.kind === "pan") { world.style.cursor = ""; return; }
        if (action.kind === "wire") {
            var target = document.elementFromPoint(event.clientX, event.clientY), port = target && target.closest('button[data-port="in"]');
            if (action.moved && port) finishWire(port.dataset.node); else drawWires(); return;
        }
        if (action.ghost) action.ghost.remove(); action.card.classList.remove("is-dragging");
        world.querySelectorAll(".drop-hover").forEach(function (n) { n.classList.remove("drop-hover"); });
        if (!action.moved) { select(action.id); return; }
        var drop = document.elementFromPoint(event.clientX, event.clientY), region = drop && drop.closest(".drop-region"), point = position(event);
        if (!drop || !board.contains(drop)) { renderCanvas(); return; }
        update(function () {
            var node = api.nodeById(graph, action.id), bubble = graph.bubbles.find(function (b) { return b.id === action.id; });
            if (node && region) {
                var index = Array.from(region.querySelectorAll(".node:not(.drag-ghost)")).filter(function (card) { return card.dataset.node !== action.id && event.clientY > card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2; }).length;
                api.place(graph, node.id, region.dataset.bubble, region.dataset.region, index);
            } else {
                if (node) api.detach(graph, node.id);
                var item = node || bubble;
                item.x = Math.max(10, Math.min(4000, point.x - action.offsetX)); item.y = Math.max(10, Math.min(4000, point.y - action.offsetY));
            }
        });
    });
    window.addEventListener("pointercancel", function () { if (drag && drag.ghost) drag.ghost.remove(); drag = null; world.style.cursor = ""; renderCanvas(); });
    window.addEventListener("keydown", function (event) {
        if (event.key === "Escape") clearSelection();
        if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.target.closest("input, textarea, select")) { event.preventDefault(); undo(); }
    });
    function undo() { if (!history.length) return; graph = JSON.parse(history.pop()); selected = null; pending = null; render(); }
    $("undo").addEventListener("click", undo);
    $("close-inspector").addEventListener("click", clearSelection);
    $("toggle-library").addEventListener("click", function () {
        var collapsed = document.querySelector(".composer-layout").classList.toggle("library-collapsed");
        this.setAttribute("aria-expanded", String(!collapsed)); this.textContent = collapsed ? "接口库" : "收起接口库";
        requestAnimationFrame(fit);
    });
    $("extract").addEventListener("click", extract);
    $("prompt").addEventListener("keydown", function (event) { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") extract(); });
    document.querySelectorAll("[data-example]").forEach(function (node) { node.addEventListener("click", function () { $("prompt").value = node.dataset.example; extract(); }); });
    $("library-search").addEventListener("input", renderLibrary);
    $("version").replaceChildren(); api.versions.forEach(function (version) { var option = el("option", "", version); option.value = version; $("version").appendChild(option); });
    $("version").addEventListener("change", function () { update(function () { graph.version = $("version").value; }); });
    $("actor").addEventListener("change", function () {
        update(function () {
            var notes = api.changeActor(graph, $("actor").value);
            arrange();
            if (notes.length) notify(notes.join("；"));
        });
        requestAnimationFrame(fit);
    });
    $("add-bubble").addEventListener("click", function () { update(function () { var b = api.addBubble(graph, { x: 265 + graph.bubbles.length * 60, y: 230 + graph.bubbles.length * 60 }); selected = b.id; }); });
    $("arrange").addEventListener("click", function () { update(arrange); requestAnimationFrame(fit); });
    var fitButton = button("适应", fit); $("arrange").after(fitButton);
    fitButton.after(button("1:1", function () { zoom = 1; resizeWorld(); requestAnimationFrame(drawWires); }));
    $("clear").addEventListener("click", function () { update(function () { var next = api.createGraph(); next.version = graph.version; next.actor = graph.actor; graph = next; selected = null; }); $("matches").replaceChildren(); zoom = 1; resizeWorld(); });
    $("copy").addEventListener("click", async function () {
        var result = api.generate(graph); if (!result.code) return;
        try { await navigator.clipboard.writeText(result.code); notify("代码已复制"); }
        catch (error) {
            var range = document.createRange(); range.selectNodeContents($("code")); var selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); notify("自动复制不可用，已选中代码，可按 Ctrl+C 复制");
        }
    });
    new ResizeObserver(function () { requestAnimationFrame(drawWires); }).observe(board);
    new ResizeObserver(constrainInspector).observe($("inspector"));
    var restored = false;
    try { var saved = localStorage.getItem(storageKey); if (saved) { graph = api.validateGraph(JSON.parse(saved)); restored = true; } }
    catch (error) { notify("本地组合无法恢复，已打开空白工作台"); }
    if (!restored) {
        $("prompt").value = "耐力不少于20时，跳到“招2”并播放";
        var initial = api.fromText($("prompt").value); graph = initial.graph; arrange();
        initial.matches.forEach(function (match) { $("matches").appendChild(el("span", "", match)); });
    }
    document.querySelector(".demo-tag").textContent = "DEMO v" + api.demoVersion;
    render(); requestAnimationFrame(fit);
}());
