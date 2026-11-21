(function () {
    "use strict";
    var api = window.BvnComposer;
    var $ = function (id) { return document.getElementById(id); };
    var graph = api.createGraph(), selected = null, pending = null, drag = null, zoom = 1;
    var history = [], saveTimer, noticeTimer, docRequest = 0, docCache = new Map(), libraryOpen = new Map(), suppressLibraryClick = null;
    var storageKey = "bvn-api-composer-demo-v1";
    var board = $("board"), world = $("world");
    var stage = document.createElement("div"); stage.className = "canvas-stage";
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
    function notify(message, kind) {
        var notice = $("notice"); notice.replaceChildren(); notice.dataset.kind = kind || "warning";
        if (kind !== "info") {var icon=el("span","notice-icon","⚠");icon.setAttribute("aria-hidden","true");notice.appendChild(icon);}
        notice.appendChild(document.createTextNode(message)); clearTimeout(noticeTimer);
        noticeTimer = setTimeout(function () { $("notice").textContent = ""; }, 6000);
    }
    function remember() { history.push(JSON.stringify(graph)); if (history.length > 40) history.shift(); }
    function save() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function () {
            try { localStorage.setItem(storageKey, JSON.stringify(graph)); $("save-state").textContent = "已保存在此浏览器"; }
            catch (error) { $("save-state").textContent = "未能保存到此浏览器"; }
        }, 180);
    }
    function update(fn) {
        var before = JSON.stringify(graph);
        try { fn(); api.simplifyDisabledBlocks(graph); history.push(before); if (history.length > 40) history.shift(); pending = null; render(); }
        catch (error) { graph = JSON.parse(before); render(); notify(error.message); }
    }
    function summary(node) {
        var spec = api.catalog[node.key];
        if (spec.kind === "root") return spec.code;
        if (spec.computedMember) return node.params.action + " = " + (spec.nullAssignment ? "null" : JSON.stringify(node.params.frame));
        if (spec.assignment) return spec.member + " " + (spec.operator || "=") + " " + String(node.params.value);
        return (spec.member || spec.key) + (spec.property ? "" : "(" + spec.fields.map(function (f) {
            if (node.key === "setDisabled" && f.key === "condition" && node.release) return "function():Boolean { … }";
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
            var output = el("div", "port-group port-output"); output.appendChild(el("span", "", spec.output));
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
    function joinButton(value, handler) {
        var join = button(value === "or" ? "或 ||" : "且 &&", function () {handler(value === "or" ? "and" : "or");}, "condition-join");
        join.setAttribute("aria-label", "条件连接方式：" + (value === "or" ? "或，点击切换为且" : "且，点击切换为或")); return join;
    }
    function checkbox(label, checked, handler) {
        var host = el("label","checkbox-field"), input = el("input"); input.type = "checkbox"; input.checked = checked;
        input.addEventListener("change",function () {handler(input.checked);}); host.append(input,document.createTextNode(label)); return host;
    }
    function bubbleElement(bubble) {
        var card = el("section", "bubble"); card.dataset.bubble = bubble.id;
        if (!bubble.container) {card.style.left = bubble.x + "px"; card.style.top = bubble.y + "px";}
        if (selected === bubble.id) card.classList.add("selected");
        var header = el("div", "bubble-header"); header.appendChild(el("strong", "", bubble.kind === "frame" ? "逐帧执行" : "如果"));
        var frequency = bubble.scheduler === "render" || bubble.scheduler === "auto" && graph.version === "3.8开发" ? {animation:"动画帧",logic:"逻辑帧",global:"全局常驻"}[bubble.renderMode || "animation"] : {auto:"自动",delay:"逻辑帧",animate:"动画帧"}[bubble.scheduler || "auto"];
        header.appendChild(el("span", "", bubble.kind === "frame" ? "每帧 · " + frequency : "if (…) { … }")); card.appendChild(header);
        card.tabIndex=0; card.setAttribute("aria-label",bubble.kind === "frame" ? "逐帧执行块" : "条件块");
        card.addEventListener("click",function (event) {
            if (event.target.closest(".node, input, select, button, a") || event.target.closest(".bubble") !== card) return;
            event.stopPropagation(); select(bubble.id);
        });
        card.addEventListener("keydown",function (event) {if (event.target === card && ["Enter"," "].includes(event.key)) {event.preventDefault();event.stopPropagation();select(bubble.id);}});
        var condition = el("div", "drop-region"); condition.dataset.region = "condition"; condition.dataset.bubble = bubble.id;
        condition.appendChild(el("h3", "", bubble.kind === "frame" ? "满足时停止 · 可留空" : "条件 · 拖入返回值卡片，可添加多个"));
        var rows = api.conditionsOf(bubble);
        if (!rows.length) condition.appendChild(el("p", "", "将读取值拖到这里"));
        rows.forEach(function (row,index) {
            var node = api.nodeById(graph,row.id), wrapper=el("div","condition-row"); wrapper.dataset.condition=row.id;
            if (!node) return;
            if (index) {
                wrapper.appendChild(joinButton(row.join || "and",function (value) {update(function () {api.updateCondition(graph,bubble.id,row.id,{join:value});});}));
            }
            wrapper.appendChild(nodeElement(node));
            var comparison=el("div","bubble-comparison");
            if (api.catalog[node.key].output === "Boolean") comparison.appendChild(checkbox("条件为真",row.operator === "truthy",function (checked) {update(function () {api.updateCondition(graph,bubble.id,row.id,{operator:checked ? "truthy" : "falsy"});});}));
            else {
                var operator=choice(operators(node),row.operator); operator.setAttribute("aria-label","比较方式");
                operator.addEventListener("change",function () {update(function () {api.updateCondition(graph,bubble.id,row.id,{operator:operator.value});});}); comparison.appendChild(operator);
            }
            if (api.catalog[node.key].output !== "Boolean") {
                var value=el("input"); value.value=row.value; value.setAttribute("aria-label","比较值"); value.addEventListener("focus",remember);
                value.addEventListener("input",function () {api.updateCondition(graph,bubble.id,row.id,{value:value.value}); preview(); save();}); comparison.appendChild(value);
            }
            wrapper.appendChild(comparison); condition.appendChild(wrapper);
        });
        if (rows.length > 1) condition.appendChild(el("p","condition-order","按从上到下的顺序组合条件"));
        card.appendChild(condition);
        var actions=el("div","drop-region"); actions.dataset.region="actions"; actions.dataset.bubble=bubble.id;
        actions.appendChild(el("h3","",bubble.kind === "frame" ? "每帧执行 · 可嵌套条件块" : "成立时执行 · 可放卡片或执行块"));
        if (!bubble.actions.length) actions.appendChild(el("p","","将操作卡片或条件块拖到这里"));
        bubble.actions.forEach(function (id) {var node=api.nodeById(graph,id), child=api.blockById(graph,id); if (node) actions.appendChild(nodeElement(node)); else if (child) actions.appendChild(bubbleElement(child));});
        card.appendChild(actions); return card;
    }
    function renderCanvas() {
        $("node-layer").replaceChildren(); $("bubble-layer").replaceChildren();
        graph.nodes.filter(function (n) { return !n.container; }).forEach(function (n) { $("node-layer").appendChild(nodeElement(n)); });
        graph.bubbles.filter(function (b) {return !b.container;}).forEach(function (b) { $("bubble-layer").appendChild(bubbleElement(b)); });
        $("node-count").textContent = graph.nodes.length + " 张卡片";
        $("empty-board").hidden = graph.nodes.length + graph.bubbles.length > 0;
        resizeWorld(); requestAnimationFrame(drawWires);
    }
    function resizeWorld() {
        // Cover the viewport even when there are few cards or the view is zoomed out
        var width = Math.max(900, Math.ceil(board.clientWidth / zoom)), height = Math.max(760, Math.ceil(board.clientHeight / zoom));
        graph.nodes.filter(function (n) { return !n.container; }).forEach(function (n) { width = Math.max(width, n.x + 260); height = Math.max(height, n.y + 160); });
        graph.bubbles.filter(function (b) {return !b.container;}).forEach(function (b) {
            var node = world.querySelector('.bubble[data-bubble="' + b.id + '"]');
            width = Math.max(width, b.x + 430); height = Math.max(height, b.y + (node ? node.offsetHeight : 400) + 60);
        });
        world.style.width = width + "px"; world.style.height = height + "px";
        world.style.transformOrigin = "top left"; world.style.transform = "scale(" + zoom + ")";
        world.style.position = "absolute"; stage.style.width = Math.ceil(width * zoom) + "px"; stage.style.height = Math.ceil(height * zoom) + "px";
    }
    function point(port) {
        var rect = port.getBoundingClientRect(), base = world.getBoundingClientRect();
        return { x: (rect.left + rect.width / 2 - base.left) / zoom, y: (rect.top + rect.height / 2 - base.top) / zoom };
    }
    function drawWires() {
        var svg = $("wires"); svg.replaceChildren();
        var ns = "http://www.w3.org/2000/svg", base = world.getBoundingClientRect();
        function element(tag, attributes, parent) {
            var item = document.createElementNS(ns, tag);
            Object.keys(attributes).forEach(function (key) { item.setAttribute(key, attributes[key]); });
            parent.appendChild(item); return item;
        }
        var defs = element("defs", {}, svg), mask = element("mask", { id: "wire-card-mask", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: world.offsetWidth, height: world.offsetHeight }, defs);
        element("rect", { x: 0, y: 0, width: world.offsetWidth, height: world.offsetHeight, fill: "white" }, mask);
        var back = element("g", { mask: "url(#wire-card-mask)" }, svg);
        function socket(port, side) {
            var center = point(port), radius = port.getBoundingClientRect().width / zoom / 2;
            return { x: center.x + side * radius, y: center.y };
        }
        function line(a, b, temporary, bubble) {
            // A single stroke keeps the socket and the rest of the wire the same color
            var d = window.BvnComposerWires.path(a, b, bubble), cls = "wire" + (temporary ? " pending" : "");
            element("path", { d: d, class: cls }, back);
        }
        graph.edges.forEach(function (edge) {
            var a = world.querySelector('button[data-port="out"][data-node="' + edge.from + '"]'), b = world.querySelector('button[data-port="in"][data-node="' + edge.to + '"]');
            if (a && b) {
                var bubble = b.closest(".bubble"), bounds = bubble && bubble.getBoundingClientRect();
                line(socket(a, 1), socket(b, -1), false, bounds && { left: (bounds.left - base.left) / zoom, top: (bounds.top - base.top) / zoom });
            }
        });
        if (pending && drag && drag.kind === "wire") {
            var port = world.querySelector('button[data-port="out"][data-node="' + pending + '"]');
            if (port) line(socket(port, 1), drag.point, true);
        }
        function hideContent(selector, target) {
            world.querySelectorAll(selector).forEach(function (node) {
                var r = node.getBoundingClientRect();
                element("rect", { x: (r.left - base.left) / zoom - 1, y: (r.top - base.top) / zoom - 1, width: r.width / zoom + 2, height: r.height / zoom + 2, rx: node.classList.contains("node") ? 7 : 0, fill: "black" }, target);
            });
        }
        // Bubble backgrounds admit wires; cards and important text still cover them
        hideContent(".node, .bubble-header, .bubble-comparison, .condition-join, .condition-order, .drop-region > h3", mask);
    }
    function select(id) { selected = id; renderCanvas(); renderInspector(); var card=world.querySelector('[data-node="'+id+'"], [data-bubble="'+id+'"]'); if (card) card.focus({preventScroll:true}); }
    function clearSelection() { selected = null; pending = null; renderCanvas(); renderInspector(); }
    function constrainInspector() {
        var panel = $("inspector"), frame = $("canvas-frame");
        if (panel.hidden) return;
        if (panel.style.left) panel.style.left = Math.max(12, Math.min(frame.clientWidth - panel.offsetWidth - 12, panel.offsetLeft)) + "px";
        panel.style.top = Math.max(12, Math.min(frame.clientHeight - panel.offsetHeight - 12, panel.offsetTop)) + "px";
    }
    function renderLibrary() {
        var list=$("library-list"); list.replaceChildren();
        var grouping=$("library-grouping").value, query=$("library-search").value.trim().toLowerCase(), terms=window.BvnSearchAliases ? window.BvnSearchAliases.expand([query]) : [query];
        terms=terms.concat(api.aliasTerms ? api.aliasTerms(query) : []).map(function (term) {return term.toLowerCase();});
        var items=api.searchSpecs(terms,graph.actor,graph.version);
        var groups=new Map();
        items.forEach(function (spec) {var group=grouping === "function" ? ({root:"可用对象",object:"取得对象",value:"读取值 / 判断条件",action:"执行操作"}[spec.kind]) : spec.kind === "root" ? "可用对象" : spec.owner; if (!groups.has(group)) groups.set(group,[]); groups.get(group).push(spec);});
        groups.forEach(function (entries,name) {
            var group=el("details","library-group"), title=el("summary","",name); title.appendChild(el("span","",entries.length));group.appendChild(title);
            group.open=!!query || libraryOpen.get(grouping+":"+name) === true;
            group.addEventListener("toggle",function () {if (!query && group.isConnected) libraryOpen.set(grouping+":"+name,group.open);});
            entries.forEach(function (spec) {
                var item=button("",function () {if (suppressLibraryClick !== spec.key) addInterface(spec.key);},"library-item");item.dataset.kind=spec.kind; item.dataset.key=spec.key;
                var member=spec.member || spec.key, duplicate=api.specs.some(function (other) {return other.key !== spec.key && other.owner !== spec.owner && (other.label === spec.label || (other.member || other.key) === member) && api.usable(other,graph.actor,graph.version);});
                item.appendChild(el("strong","",spec.label)); item.appendChild(el("code","",member+(spec.since ? " · "+spec.since+"起" : "")));
                if (grouping === "function" && duplicate && spec.owner) item.appendChild(el("span","library-source",spec.owner));
                item.disabled=!api.available(spec,graph.version); group.appendChild(item);
            }); list.appendChild(group);
        });
        $("library-count").textContent=items.length+" 项";
    }
    function addInterface(key, drop) {
        update(function () {
            var spec=api.catalog[key], index=graph.nodes.filter(function (n) {return !n.container && !["object","root"].includes(api.catalog[n.key].kind);}).length;
            var node=api.addNode(graph,key,{x:drop ? drop.point.x : 35+index%3*230,y:drop ? drop.point.y : 300+Math.floor(index/3)*140});
            if (spec.kind === "root" && !drop) {node.x=35;node.y=45+graph.nodes.filter(function (n) {return api.catalog[n.key].kind === "root";}).length*135;}
            else if (spec.kind !== "root" && $("auto-path").checked) {try {api.attachPath(graph,node);} catch (error) {notify(error.message);}}
            if (drop && drop.region) api.place(graph,node.id,drop.region.dataset.bubble,drop.region.dataset.region,drop.index);
            else if (spec.repeatRequired) {var block=api.addBubble(graph,{kind:"frame",x:drop ? drop.point.x : 300,y:drop ? drop.point.y : 300});api.place(graph,node.id,block.id,"actions");}
            selected=node.id;
        });
    }
    $("library-list").addEventListener("pointerdown",function (event) {
        var item=event.target.closest(".library-item");
        if (event.button !== 0 || !item || item.disabled) return;
        event.preventDefault();
        drag={kind:"library",key:item.dataset.key,card:item,startX:event.clientX,startY:event.clientY,moved:false};
    });
    function addBlock(kind, drop) {
        update(function () {
            var block=api.addBubble(graph,{kind:kind,x:drop ? drop.point.x : 265+graph.bubbles.length*60,y:drop ? drop.point.y : 230+graph.bubbles.length*60});
            if (drop && drop.region) api.place(graph,block.id,drop.region.dataset.bubble,drop.region.dataset.region,drop.index);
            selected=block.id;
        });
    }
    document.querySelectorAll("button[data-block-kind]").forEach(function (item) {
        item.addEventListener("pointerdown",function (event) {
            if (event.button !== 0) return;
            event.preventDefault();
            drag={kind:"block-template",key:"block:"+item.dataset.blockKind,blockKind:item.dataset.blockKind,card:item,startX:event.clientX,startY:event.clientY,moved:false};
        });
    });
    function preview() {
        var result = api.generate(graph);
        $("code").textContent = result.code || (result.errors.length ? "补齐参数和连接后显示代码" : "从卡片中生成的代码会显示在这里");
        $("copy").disabled = !result.code; $("errors").replaceChildren();
        result.errors.forEach(function (error) { $("errors").appendChild(el("p", "", error)); });
        $("undo").disabled = !history.length;
    }
    function renderDisableRelease(host,node) {
        var current = node.release ? "condition" : node.params.condition === "true" ? "forever" : /^\d+$/.test(String(node.params.condition)) ? "frames" : "function";
        var label=el("label","","解除方式"), mode=choice([["forever","保持禁用"],["frames","经过指定动画帧"],["function","由已有函数判断"],["condition","满足指定条件"]],current);
        mode.addEventListener("change",function () {update(function () {
            delete node.release;
            node.params.condition = mode.value === "frames" ? "30" : mode.value === "function" ? "" : "true";
            if (mode.value === "condition") {
                var block=api.blockById(graph,node.container);
                node.release={conditions:block ? api.conditionsOf(block).map(function (r) {return Object.assign({},r);}) : [],negate:!!block && block.kind === "condition"};
            }
        });}); label.appendChild(mode);host.appendChild(label);
        if (current === "frames" || current === "function") {
            var valueLabel=el("label","",current === "frames" ? "动画帧数" : "禁用条件函数"), value=el("input");
            value.type=current === "frames" ? "number" : "text"; if (current === "frames") value.min="1";
            value.value=node.params.condition;value.addEventListener("focus",remember);
            value.addEventListener("input",function () {node.params.condition=value.value;var card=world.querySelector('.node[data-node="'+node.id+'"] .node-body code');if (card) card.textContent=summary(node);preview();save();});
            valueLabel.appendChild(value);host.appendChild(valueLabel);
            if (current === "function") host.appendChild(el("p","muted","函数返回 true 时保持禁用，返回 false 时解除。"));
        }
        if (current !== "condition") return;
        var values=graph.nodes.filter(function (n) {return api.catalog[n.key].kind === "value";});
        node.release.conditions.forEach(function (row,index) {
            var box=el("div","release-condition");
            if (index) box.appendChild(joinButton(row.join,function (join) {update(function () {row.join=join;});}));
            var field=el("label","","返回值"), picker=choice(values.map(function (n) {return [n.id,api.catalog[n.key].label+" · "+summary(n)];}),row.id);
            picker.addEventListener("change",function () {update(function () {row.id=picker.value;var spec=api.catalog[api.nodeById(graph,row.id).key];row.operator=spec.output === "Boolean" ? "truthy" : "==";row.value=spec.output === "String" ? "" : "20";});});field.appendChild(picker);box.appendChild(field);
            var source=api.nodeById(graph,row.id);
            if (source && api.catalog[source.key].output === "Boolean") box.appendChild(checkbox("条件为真",row.operator === "truthy",function (checked) {update(function () {row.operator=checked ? "truthy" : "falsy";});}));
            else if (source) {
                var comparison=el("div","bubble-comparison"), operator=choice(operators(source),row.operator), input=el("input");operator.setAttribute("aria-label","解除条件比较方式");input.setAttribute("aria-label","解除条件比较值");input.value=row.value;
                operator.addEventListener("change",function () {update(function () {row.operator=operator.value;});});input.addEventListener("focus",remember);input.addEventListener("input",function () {row.value=input.value;preview();save();});comparison.append(operator,input);box.appendChild(comparison);
            }
            box.appendChild(button("移除此条件",function () {update(function () {node.release.conditions.splice(index,1);});},"danger"));host.appendChild(box);
        });
        var add=button("＋ 解除条件",function () {update(function () {
            var source=values[0],spec=api.catalog[source.key];node.release.conditions.push({id:source.id,operator:spec.output === "Boolean" ? "truthy" : "==",value:spec.output === "String" ? "" : "20",join:"and"});
        });}); add.disabled=!values.length;host.appendChild(add);
        if (!values.length) host.appendChild(el("p","muted","先从接口库添加返回值卡片，再在这里选择解除条件。"));
        if (node.release.conditions.length) host.appendChild(checkbox("整体取反：以上条件不成立时解除",node.release.negate,function (checked) {update(function () {node.release.negate=checked;});}));
    }
    function renderInspector() {
        var host = $("inspector-fields"); host.replaceChildren(); $("doc-panel").hidden = true; $("selection-type").textContent = ""; docRequest++;
        var node = api.nodeById(graph, selected), bubble = graph.bubbles.find(function (b) { return b.id === selected; });
        $("inspector").hidden = !node && !bubble;
        if (bubble) {
            host.appendChild(el("h3", "", "执行块"));
            var kindLabel=el("label", "", "执行方式"), kind=choice([["condition","满足条件时执行"],["frame","逐帧执行"]], bubble.kind || "condition");
            kind.addEventListener("change", function () { update(function () {if (kind.value === "frame") api.promoteFrame(graph,bubble); else bubble.kind=kind.value; api.validateGraph(graph);}); }); kindLabel.appendChild(kind); host.appendChild(kindLabel);
            if (bubble.kind === "frame") {
                var scheduleLabel=el("label", "", "调用方式"), schedule=choice([["auto","按版本自动选择"],["delay","delayCall · 逻辑帧"],["animate","setAnimateFrameOut · 动画帧"],["render","addRenderFunc · 3.8开发"]],bubble.scheduler || "auto");
                schedule.addEventListener("change", function () { update(function () {bubble.scheduler=schedule.value;}); }); scheduleLabel.appendChild(schedule); host.appendChild(scheduleLabel);
                if (bubble.scheduler === "render" || (bubble.scheduler || "auto") === "auto" && graph.version === "3.8开发") {
                    var modeLabel=el("label","","回调分支"), mode=choice([["animation","跟随对象动画帧"],["logic","跟随对象逻辑帧"],["global","全局常驻逻辑帧"]],bubble.renderMode || "animation");
                    mode.addEventListener("change",function () {update(function () {bubble.renderMode=mode.value;});}); modeLabel.appendChild(mode);host.appendChild(modeLabel);
                }
                var framesLabel=el("label", "", "执行帧数（-1 为持续执行）"), frames=el("input"); frames.type="number"; frames.min="-1"; frames.value=bubble.frames === undefined ? -1 : bubble.frames;
                frames.addEventListener("change",function () {update(function () {bubble.frames=Number(frames.value);});}); framesLabel.appendChild(frames); host.appendChild(framesLabel);

            }
            if (bubble.container) host.appendChild(button("移回工作台",function () {update(function () {api.detach(graph,bubble.id);bubble.x=35;bubble.y=420;});}));
            host.appendChild(el("p", "muted", bubble.kind === "frame" ? "停止条件在每次执行前检查；需要按条件执行的操作，可放进内层条件块。" : "条件区可放多个返回值；执行区可放操作或执行块。拖动可调整顺序。"));
            host.appendChild(button("删除执行块，保留卡片", function () { update(function () { api.remove(graph, bubble.id); selected = null; }); }, "danger"));
            return;
        }
        if (!node) { host.appendChild(el("p", "muted", "选中一张卡片，查看参数与说明。")); return; }
        var spec = api.catalog[node.key]; $("selection-type").textContent = spec.output;
        host.appendChild(el("h3", "", spec.label)); host.appendChild(el("div", "signature", (spec.owner ? spec.owner + "." : "") + (spec.member || spec.key) + (spec.property || spec.assignment || spec.kind === "root" ? "" : "(…)") + " → " + spec.output));
        if (spec.hint) host.appendChild(el("p", "muted", spec.hint));
        if (!spec.fields.length) host.appendChild(el("p", "muted", spec.kind === "root" ? "作为其他卡片的调用起点。" : "此接口无需参数。"));
        spec.fields.forEach(function (field) {
            if (node.key === "setDisabled" && field.key === "condition") {renderDisableRelease(host,node);return;}
            if (field.type === "Boolean") {
                host.appendChild(checkbox(field.label,node.params[field.key] === true,function (checked) {update(function () {node.params[field.key]=checked;});})); return;
            }
            var label = el("label", "", field.label); label.appendChild(el("span", "field-type", field.type));
            var input = el("input"); input.value = node.params[field.key]; input.type = "text"; input.autocomplete = "off";
            input.setAttribute("aria-label", field.label); input.addEventListener("focus", remember);
            input.addEventListener("input", function () {
                node.params[field.key] = input.value;
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
        var exampleRow=document.querySelector(".example-row");exampleRow.replaceChildren(el("span","","试一试"));
        api.demoExamples(graph.actor,graph.version).forEach(function (example) {
            var item=button(example[0],function () {$("prompt").value=example[1];extract();});item.dataset.example=example[1];exampleRow.appendChild(item);
        });
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
        graph.bubbles.filter(function (b) {return !b.container;}).forEach(function (b, i) { b.x = 265 + i * 420; b.y = objectBottom + 50; });
        graph.nodes.filter(function (n) { return !n.container && ["value", "action"].includes(api.catalog[n.key].kind); }).forEach(function (n, i) { n.x = 35; n.y = bottom + 50 + i * 140; });
    }
    function fit() {
        var right = 400, bottom = 400;
        graph.nodes.filter(function (n) { return !n.container; }).forEach(function (n) { right = Math.max(right, n.x + 230); bottom = Math.max(bottom, n.y + 150); });
        graph.bubbles.filter(function (b) {return !b.container;}).forEach(function (b) { var element = world.querySelector('.bubble[data-bubble="' + b.id + '"]'); right = Math.max(right, b.x + 400); bottom = Math.max(bottom, b.y + (element ? element.offsetHeight : 420) + 30); });
        zoom = Math.max(.45, Math.min(1, (board.clientWidth - 15) / right, (board.clientHeight - 15) / bottom));
        board.scrollLeft = 0; board.scrollTop = 0; resizeWorld(); requestAnimationFrame(drawWires);
    }
    function extract() {
        if (!$("prompt").value.trim()) { notify("先写一句想实现的效果"); return; }
        var layoutReady=setIntroMode(true);
        var result = api.fromText($("prompt").value, graph.version, graph.actor);
        update(function () { graph = result.graph; arrange(); selected = null; });
        $("matches").replaceChildren();
        if (result.matches.length) {
            var phrases = el("div", "match-phrases");
            result.matches.forEach(function (match) { phrases.appendChild(el("span", "", match)); });
            $("matches").appendChild(phrases);
        }
        if (result.notes.length) {
            var notes = el("ul", "match-notes");
            result.notes.forEach(function (note) { notes.appendChild(el("li", "", note)); });
            $("matches").appendChild(notes);
        }
        if (result.suggestions.length) {
            var related = el("div", "match-related"); related.appendChild(el("span", "", "相关接口"));
            result.suggestions.forEach(function (key) {
                var spec = api.catalog[key], item = button(spec.label + " · " + (spec.member || spec.key), function () { addInterface(key); }, "related-interface");
                item.disabled = !api.available(spec, graph.version); related.appendChild(item);
            });
            $("matches").appendChild(related);
        }
        function revealWorkspace() {
            fit();
            var top=document.querySelector(".basket").getBoundingClientRect().top+window.scrollY-12;
            window.scrollTo({top:Math.max(1,top),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
        }
        layoutReady.then(function () {requestAnimationFrame(revealWorkspace);});
    }
    function position(event) { var rect = world.getBoundingClientRect(); return { x: (event.clientX - rect.left) / zoom, y: (event.clientY - rect.top) / zoom }; }
    function startWire(id) { pending = id; renderCanvas(); notify("连接到另一张卡片左侧的圆点；返回值卡片可直接拖入条件区", "info"); }
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
        if (drag.kind === "library" || drag.kind === "block-template") {
            if (!drag.ghost) {drag.ghost=drag.card.cloneNode(true);drag.ghost.className="library-drag-ghost";drag.ghost.removeAttribute("id");drag.ghost.setAttribute("aria-hidden","true");drag.ghost.tabIndex=-1;drag.ghost.style.width="200px";document.body.appendChild(drag.ghost);}
            drag.ghost.style.left=event.clientX+12+"px";drag.ghost.style.top=event.clientY+12+"px";
            return;
        }
        if (!drag.ghost) {
            drag.ghost = drag.card.cloneNode(true); drag.ghost.classList.add("drag-ghost"); drag.ghost.setAttribute("aria-hidden","true"); drag.ghost.tabIndex=-1;
            drag.ghost.style.width = drag.card.offsetWidth + "px"; drag.ghost.style.transform = "scale(" + zoom + ") rotate(1deg)";
            document.body.appendChild(drag.ghost); drag.card.classList.add("is-dragging");
        }
        drag.ghost.style.left = event.clientX - drag.offsetX * zoom + "px"; drag.ghost.style.top = event.clientY - drag.offsetY * zoom + "px";
        var bounds = board.getBoundingClientRect();
        drag.ghost.classList.toggle("discarding",event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
        world.querySelectorAll(".drop-hover").forEach(function (n) { n.classList.remove("drop-hover"); });
        var target = document.elementFromPoint(event.clientX, event.clientY), region = target && target.closest(".drop-region");
        if (region && (api.nodeById(graph, drag.id) || api.blockById(graph,drag.id))) region.classList.add("drop-hover");
    });
    function dropIndex(region,y,id) {
        if (!region) return undefined;
        var selector=region.dataset.region === "condition" ? ".condition-row" : ".node, .bubble";
        return Array.from(region.children).filter(function (item) {return item.matches(selector) && (item.dataset.node || item.dataset.bubble || item.dataset.condition) !== id && y > item.getBoundingClientRect().top+item.getBoundingClientRect().height/2;}).length;
    }
    window.addEventListener("pointerup", function (event) {
        if (!drag) return;
        var action = drag; drag = null;
        if (action.kind === "inspector") return;
        if (action.kind === "library" || action.kind === "block-template") {
            if (action.ghost) action.ghost.remove();
            if (!action.moved) return;
            suppressLibraryClick=action.key;setTimeout(function () {suppressLibraryClick=null;},0);
            var target=document.elementFromPoint(event.clientX,event.clientY);
            if (target && board.contains(target)) {
                var region=target.closest(".drop-region");
                var placement={point:position(event),region:region,index:dropIndex(region,event.clientY)};
                if (action.kind === "block-template") addBlock(action.blockKind,placement); else addInterface(action.key,placement);
            }
            return;
        }
        if (action.kind === "pan") { world.style.cursor = ""; return; }
        if (action.kind === "wire") {
            var target = document.elementFromPoint(event.clientX, event.clientY), port = target && target.closest('button[data-port="in"]');
            if (action.moved && port) finishWire(port.dataset.node); else drawWires(); return;
        }
        if (action.ghost) action.ghost.remove(); action.card.classList.remove("is-dragging");
        world.querySelectorAll(".drop-hover").forEach(function (n) { n.classList.remove("drop-hover"); });
        if (!action.moved) { select(action.id); return; }
        var drop = document.elementFromPoint(event.clientX, event.clientY), region = drop && drop.closest(".drop-region"), point = position(event);
        var bounds = board.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {deleteItem(action.id);return;}
        if (!drop || !board.contains(drop)) { renderCanvas(); return; }
        update(function () {
            var node = api.nodeById(graph, action.id), bubble = graph.bubbles.find(function (b) { return b.id === action.id; });
            if ((node || bubble) && region) {
                api.place(graph,action.id,region.dataset.bubble,region.dataset.region,dropIndex(region,event.clientY,action.id));
            } else {
                if (node || bubble) api.detach(graph, action.id);
                var item = node || bubble;
                item.x = Math.max(10, Math.min(4000, point.x - action.offsetX)); item.y = Math.max(10, Math.min(4000, point.y - action.offsetY));
            }
        });
    });
    window.addEventListener("pointercancel", function () { if (drag && drag.ghost) drag.ghost.remove(); drag = null; world.style.cursor = ""; renderCanvas(); });
    window.addEventListener("keydown", function (event) {
        if (event.key === "Escape") clearSelection();
        if (event.key === "Delete" && !event.repeat && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])") && selected) {event.preventDefault();deleteItem(selected);}
        if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.target.closest("input, textarea, select")) { event.preventDefault(); undo(); }
    });
    function deleteItem(id) {
        if (!api.nodeById(graph,id) && !api.blockById(graph,id)) return;
        update(function () {api.remove(graph,id);selected=null;});
        notify("已删除，可按 Ctrl+Z 撤销", "info");
    }
    function undo() { if (!history.length) return; graph = JSON.parse(history.pop()); selected = null; pending = null; render(); }
    $("undo").addEventListener("click", undo);
    $("close-inspector").addEventListener("click", clearSelection);
    $("toggle-library").addEventListener("click", function () {
        var collapsed = document.querySelector(".composer-layout").classList.toggle("library-collapsed");
        this.setAttribute("aria-expanded", String(!collapsed)); this.textContent = collapsed ? "接口库" : "收起接口库";
        requestAnimationFrame(fit);
    });
    $("extract").addEventListener("click", extract);
    $("prompt").addEventListener("keydown", function (event) {
        if (event.key !== "Enter" || event.isComposing || event.keyCode === 229) return;
        event.preventDefault(); extract();
    });
    $("library-search").addEventListener("input", renderLibrary);
    try {if (localStorage.getItem("bvn-api-composer-grouping") === "type") $("library-grouping").value="type";} catch (error) {}
    $("library-grouping").addEventListener("change",function () {renderLibrary();try {localStorage.setItem("bvn-api-composer-grouping",this.value);} catch (error) {}});
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
    $("add-frame").addEventListener("click",function () {if (suppressLibraryClick !== "block:frame") addBlock("frame");});
    $("add-bubble").addEventListener("click",function () {if (suppressLibraryClick !== "block:condition") addBlock("condition");});
    $("arrange").addEventListener("click", function () { update(arrange); requestAnimationFrame(fit); });
    var fitButton = button("适应", fit); $("toolbar-view").appendChild(fitButton);
    fitButton.after(button("1:1", function () { zoom = 1; resizeWorld(); requestAnimationFrame(drawWires); }));
    $("clear").addEventListener("click", function () { update(function () { var next = api.createGraph(); next.version = graph.version; next.actor = graph.actor; graph = next; selected = null; }); $("matches").replaceChildren(); zoom = 1; resizeWorld(); });
    $("copy").addEventListener("click", async function () {
        var result = api.generate(graph); if (!result.code) return;
        try { await navigator.clipboard.writeText(result.code); notify("代码已复制", "info"); }
        catch (error) {
            var range = document.createRange(); range.selectNodeContents($("code")); var selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); notify("自动复制不可用，已选中代码，可按 Ctrl+C 复制");
        }
    });
    var resizeFrame;
    new ResizeObserver(function () {cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(function () {resizeWorld();drawWires();});}).observe(board);
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
    var introLocked=false, introAnchor=0, introReady=Promise.resolve(), topArmed=false, topTimer, touchY=null;
    function armTop() {clearTimeout(topTimer);topTimer=setTimeout(function () {topArmed=window.scrollY <= 0 && document.body.classList.contains("workspace-mode");},180);}
    function setIntroMode(compact) {
        if (introLocked) return introReady.then(function () {return setIntroMode(compact);});
        if (document.body.classList.contains("workspace-mode") === compact) return Promise.resolve();
        introLocked=true;topArmed=false;clearTimeout(topTimer);introAnchor=compact ? 1 : 0;
        document.body.classList.toggle("workspace-mode",compact);window.scrollTo({top:introAnchor,behavior:"instant"});
        introReady=new Promise(function (resolve) {
            requestAnimationFrame(function () {
                var stage=document.querySelector(".prompt-stage"), animations=stage.getAnimations ? stage.getAnimations({subtree:true}) : [];
                Promise.all(animations.map(function (animation) {return animation.finished.catch(function () {});})).then(function () {
                    window.scrollTo({top:introAnchor,behavior:"instant"});introLocked=false;resolve();
                });
            });
        });
        return introReady;
    }
    function scrollIntent(event,delta) {
        if (!delta) return;
        if (introLocked) {event.preventDefault();return;}
        if (event.target.closest && event.target.closest("#board, #library-list, #inspector")) return;
        var compact=document.body.classList.contains("workspace-mode");
        if (!compact && delta > 0) {event.preventDefault();setIntroMode(true);}
        else if (compact && delta < 0 && window.scrollY <= 0) {
            event.preventDefault();
            if (topArmed) setIntroMode(false); else armTop();
        } else {topArmed=false;clearTimeout(topTimer);}
    }
    window.addEventListener("wheel",function (event) {if (!event.ctrlKey) scrollIntent(event,event.deltaY);},{passive:false});
    window.addEventListener("touchstart",function (event) {touchY=event.touches.length === 1 ? event.touches[0].clientY : null;},{passive:true});
    window.addEventListener("touchmove",function (event) {if (touchY === null || event.touches.length !== 1) return;var y=event.touches[0].clientY;scrollIntent(event,touchY-y);touchY=y;},{passive:false});
    window.addEventListener("keydown",function (event) {
        if (event.target.closest("input, textarea, select, [contenteditable='true']") || event.ctrlKey || event.metaKey || event.altKey) return;
        var delta=["ArrowDown","PageDown"," ","End"].includes(event.key) ? 1 : ["ArrowUp","PageUp"].includes(event.key) ? -1 : 0;
        scrollIntent(event,delta);
    });
    window.addEventListener("scroll",function () {
        if (introLocked) {if (window.scrollY !== introAnchor) window.scrollTo({top:introAnchor,behavior:"instant"});return;}
        if (!document.body.classList.contains("workspace-mode") && window.scrollY > 0) {setIntroMode(true);return;}
        if (window.scrollY <= 0) armTop(); else {topArmed=false;clearTimeout(topTimer);}
    },{passive:true});
    document.body.classList.toggle("workspace-mode",window.scrollY > 0);
    render(); requestAnimationFrame(fit);
}());
