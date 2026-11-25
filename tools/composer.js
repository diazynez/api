(function () {
    "use strict";
    var api = window.BvnComposer;
    var $ = function (id) { return document.getElementById(id); };
    var graph = api.createGraph(), selected = null, pending = null, drag = null, zoom = 1;
    var toastUndoState=null;
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
        var node = el("button", cls, text); node.type = "button"; node.addEventListener("click", cls === "danger" ? function () {withUndo(handler);} : handler); return node;
    }
    function notify(message, kind, action) {
        toastUndoState=null;
        var notice = $("notice"); notice.replaceChildren(); notice.dataset.kind = kind || "warning";
        if (kind !== "info") {var icon=el("span","notice-icon","⚠");icon.setAttribute("aria-hidden","true");notice.appendChild(icon);}
        notice.appendChild(document.createTextNode(message));
        if (action) notice.appendChild(button("撤销",function () {action();notice.replaceChildren();toastUndoState=null;clearTimeout(noticeTimer);},"toast-undo"));
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(function () { $("notice").textContent = ""; }, 6000);
    }
    function withUndo(handler, message) {
        var before=JSON.stringify(graph), previousHistory=history.slice(), view={zoom:zoom,left:board.scrollLeft,top:board.scrollTop};
        handler();
        var after=JSON.stringify(graph);
        if (after === before) return;
        notify(message || "已删除", "info",function () {graph=JSON.parse(before);history=previousHistory;zoom=view.zoom;selected=null;pending=null;render();board.scrollLeft=view.left;board.scrollTop=view.top;});
        toastUndoState=after;
    }
    function remember() { history.push(JSON.stringify(graph)); if (history.length > 40) history.shift(); }
    function save() {
        if (toastUndoState && JSON.stringify(graph) !== toastUndoState) {$("notice").replaceChildren();toastUndoState=null;}
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function () {
            try { localStorage.setItem(storageKey, JSON.stringify(graph)); $("save-state").textContent = "已保存在此浏览器"; }
            catch (error) { $("save-state").textContent = "未能保存到此浏览器"; }
        }, 180);
    }
    function update(fn) {
        if (window.BvnComposerAISettings) window.BvnComposerAISettings.cancel();
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
        return [[">=", "不少于 ≥"], [">", "大于 >"], ["<=", "不超过 ≤"], ["<", "小于 <"], ["==", "等于 ="], ["!=", "不等于 ≠"], ["between", "介于"]];
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
    function comparisonControls(node,row,change) {
        var host=el("div","bubble-comparison");
        if (api.catalog[node.key].output === "Boolean") {
            host.appendChild(checkbox("条件为真",row.operator === "truthy",function (checked) {change({operator:checked ? "truthy" : "falsy"},true);}));return host;
        }
        var operator=choice(operators(node),row.operator);operator.setAttribute("aria-label","比较方式");
        operator.addEventListener("change",function () {
            var changes={operator:operator.value};
            if (operator.value === "between") changes.value=JSON.stringify({lower:row.value,upper:"",includeLower:true,includeUpper:true});
            else if (row.operator === "between") changes.value=api.readRange(row.value).lower;
            change(changes,true);
        });host.appendChild(operator);
        if (row.operator === "between") {
            host.classList.add("range-comparison");var range=api.readRange(row.value), fields=el("div","range-bounds");
            [["lower","下限"],["upper","上限"]].forEach(function (item) {
                var label=el("label","",item[1]), input=el("input");input.type="number";input.value=range[item[0]];input.setAttribute("aria-label",item[1]);input.addEventListener("focus",remember);
                input.addEventListener("input",function () {range[item[0]]=input.value;change({value:JSON.stringify(range)},false);});label.appendChild(input);fields.appendChild(label);
            });host.appendChild(fields);
            var ends=el("div","range-ends");
            [["includeLower","包含下限"],["includeUpper","包含上限"]].forEach(function (item) {ends.appendChild(checkbox(item[1],range[item[0]],function (checked) {range[item[0]]=checked;change({value:JSON.stringify(range)},true);}));});host.appendChild(ends);
        } else {
            var input=el("input");input.value=row.value;input.setAttribute("aria-label","比较值");input.addEventListener("focus",remember);input.addEventListener("input",function () {change({value:input.value},false);});host.appendChild(input);
        }
        return host;
    }
    function bubbleElement(bubble) {
        var branch=api.branchParent(graph,bubble.id);
        var card = el("section", "bubble"); card.dataset.bubble = bubble.id;
        if (!bubble.container) {card.style.left = bubble.x + "px"; card.style.top = bubble.y + "px";}
        if (selected === bubble.id) card.classList.add("selected");
        var header = el("div", "bubble-header"); header.appendChild(el("strong", "", bubble.kind === "frame" ? "逐帧执行" : bubble.isElse ? "否则" : branch ? "否则如果" : "如果"));
        var frequency = bubble.scheduler === "render" || bubble.scheduler === "auto" && graph.version === "3.8开发" ? {animation:"动画帧",logic:"逻辑帧",global:"全局常驻"}[bubble.renderMode || "animation"] : {auto:"自动",delay:"逻辑帧",animate:"动画帧"}[bubble.scheduler || "auto"];
        header.appendChild(el("span", "", bubble.kind === "frame" ? "每帧 · " + frequency : bubble.isElse ? "else { … }" : branch ? "else if (…) { … }" : "if (…) { … }")); card.appendChild(header);
        card.tabIndex=0; card.setAttribute("aria-label",bubble.kind === "frame" ? "逐帧执行块" : bubble.isElse ? "否则分支" : branch ? "否则如果分支" : "条件块");
        card.addEventListener("click",function (event) {
            if (event.target.closest(".node, input, select, button, a, label") || event.target.closest(".bubble") !== card) return;
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
            var comparison=comparisonControls(node,row,function (changes,redraw) {
                if (redraw) update(function () {api.updateCondition(graph,bubble.id,row.id,changes);});
                else {api.updateCondition(graph,bubble.id,row.id,changes);preview();save();}
            });
            wrapper.appendChild(comparison); condition.appendChild(wrapper);
        });
        if (rows.length > 1) condition.appendChild(el("p","condition-order","按从上到下的顺序组合条件"));
        if (!bubble.isElse) card.appendChild(condition);
        var actions=el("div","drop-region"); actions.dataset.region="actions"; actions.dataset.bubble=bubble.id;
        actions.appendChild(el("h3","",bubble.kind === "frame" ? "每帧执行 · 可嵌套条件块" : bubble.isElse ? "前面条件均不成立时执行" : "成立时执行 · 可放卡片或执行块"));
        if (!bubble.actions.length) actions.appendChild(el("p","","将操作卡片或条件块拖到这里"));
        bubble.actions.forEach(function (id) {var node=api.nodeById(graph,id), child=api.blockById(graph,id); if (node) actions.appendChild(nodeElement(node)); else if (child) actions.appendChild(bubbleElement(child));});
        card.appendChild(actions);
        if (bubble.elseBlock) {var chain=el("div","branch-chain"),alternate=api.blockById(graph,bubble.elseBlock);if (alternate) chain.appendChild(bubbleElement(alternate));card.appendChild(chain);}
        if (bubble.kind === "condition" && !branch) {
            var controls=el("div","branch-controls");
            controls.appendChild(button("＋ 否则如果",function () {update(function () {api.addBranch(graph,bubble.id,false);});}));
            var addElse=button("＋ 否则",function () {update(function () {api.addBranch(graph,bubble.id,true);});});
            var tail=bubble,seen=new Set();while (tail.elseBlock && !seen.has(tail.id)) {seen.add(tail.id);tail=api.blockById(graph,tail.elseBlock);}
            addElse.disabled=!!tail.isElse;controls.appendChild(addElse);card.appendChild(controls);
        }
        return card;
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
        var pathGroups=el("details","library-paths"), pathTitle=el("summary","","对象路径"), pathCount=0;
        pathGroups.appendChild(pathTitle);
        pathGroups.open=!$("auto-path").checked || !!query && items.every(function (spec) {return ["root","object"].includes(spec.kind);}) || libraryOpen.get("paths") === true;
        pathGroups.addEventListener("toggle",function () {if (!query && pathGroups.isConnected) libraryOpen.set("paths",pathGroups.open);});
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
            });
            if (grouping === "function" && ["root","object"].includes(entries[0].kind)) {pathGroups.appendChild(group);pathCount+=entries.length;}
            else list.appendChild(group);
        });
        if (grouping === "function" && pathCount) {pathTitle.appendChild(el("span","",pathCount));list.appendChild(pathGroups);}
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
            if (source) box.appendChild(comparisonControls(source,row,function (changes,redraw) {
                if (redraw) update(function () {Object.assign(row,changes);});else {Object.assign(row,changes);preview();save();}
            }));
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
            if (api.branchParent(graph,bubble.id)) kind.disabled=true;
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
            if (bubble.container && !api.branchParent(graph,bubble.id)) host.appendChild(button("移回工作台",function () {update(function () {api.detach(graph,bubble.id);bubble.x=35;bubble.y=420;});}));
            host.appendChild(el("p", "muted", bubble.kind === "frame" ? "停止条件在每次执行前检查；需要按条件执行的操作，可放进内层条件块。" : bubble.isElse ? "前面所有条件均不成立时执行；“否则”不需要条件。" : "条件区可放多个返回值；执行区可放操作或执行块。“否则如果”和“否则”按顺序判断，只执行命中的一个分支。"));
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
    var extractionId=0;
    function appendUsage(host,usage,request) {
        if (request) {
            var mode={auto:"服务商默认",none:"请求关闭推理",on:"请求开启推理",low:"请求低强度推理"}[request.effort];
            host.appendChild(el("span","ai-request","本次请求："+request.model+" · "+mode+" · "+(request.parameters.length ? request.parameters.join("，") : "未发送推理参数")+" · 耗时 "+(request.elapsedMs/1000).toFixed(1)+" 秒"));
            if (request.diagnostic) {
                var d=request.diagnostic, seconds=function (ms) {return (ms/1000).toFixed(1)+" 秒";};
                var heading=d.headersMs === null ? "尚未收到响应头" : d.stage === "status" ? "HTTP "+d.httpStatus : d.bodyMs === null ? "正文尚未读取完成" : "响应头 "+seconds(d.headersMs)+" · 正文 "+seconds(d.bodyMs);
                var details=el("details","ai-diagnostics");details.appendChild(el("summary","","请求诊断 · "+heading));
                var rows=el("ul","");
                rows.appendChild(el("li","",d.headersMs === null ? "等待响应头："+seconds(d.elapsedMs) : "收到响应头："+seconds(d.headersMs)+"，HTTP "+d.httpStatus));
                rows.appendChild(el("li","",d.headersMs === null || d.stage === "status" ? "读取正文：未开始" : d.bodyMs === null ? "读取正文：已等待 "+seconds(Math.max(0,d.elapsedMs-d.headersMs))+"，尚未完成" : "读取正文："+seconds(d.bodyMs)));
                rows.appendChild(el("li","",d.requestId ? "服务商请求编号："+d.requestId+"（"+d.requestIdHeader+"）" : d.headersMs === null ? "尚未收到服务商请求编号" : "服务商请求编号未返回，或浏览器未开放读取"));
                details.appendChild(rows);host.appendChild(details);
            }
        }
        if (!usage || !(usage.input || usage.output)) return;
        host.appendChild(el("span","ai-usage","本次用量：输入 "+usage.input.toLocaleString()+" / 输出 "+usage.output.toLocaleString()+" tokens"+(usage.thinking ? "（含思考 "+usage.thinking.toLocaleString()+"）" : "")));
    }
    function showMatches(result) {
        $("matches").replaceChildren();
        if (result.matches.length) {
            var phrases=el("div","match-phrases");
            result.matches.forEach(function (match) {phrases.appendChild(el("span","",match));});
            $("matches").appendChild(phrases);
        }
        if (result.notes.length) {
            var notes=el("ul","match-notes");
            result.notes.forEach(function (note) {notes.appendChild(el("li","",note));});
            $("matches").appendChild(notes);
        }
        if (result.suggestions.length) {
            var related=el("div","match-related");related.appendChild(el("span","","相关接口"));
            result.suggestions.forEach(function (key) {
                var spec=api.catalog[key],item=button(spec.label+" · "+(spec.member || spec.key),function () {addInterface(key);},"related-interface");
                item.disabled=!api.available(spec,graph.version);related.appendChild(item);
            });
            $("matches").appendChild(related);
        }
    }
    async function extract() {
        if (!$("prompt").value.trim()) { notify("先写一句想实现的效果"); return; }
        var ai=window.BvnComposerAI, settings=window.BvnComposerAISettings, requestId=++extractionId;
        settings.cancel();
        var text=$("prompt").value, version=graph.version, actor=graph.actor;
        var result = api.fromText(text, version, actor);
        showMatches(result);
        if (!ai.needsAI(api,text,result)) {
            update(function () {graph=result.graph;arrange();selected=null;});
            setIntroMode(true);moveToWorkspace();return;
        }
        if (!settings.enabled()) return;
        var state=el("div","ai-progress");$("matches").appendChild(state);
        if (!settings.ready()) {state.appendChild(el("span","","静态解析未完成；填充 Key 后可使用 AI 补全"));state.appendChild(button("配置 AI",settings.open));return;}
        var progress=el("span","","AI 补全中…");state.appendChild(progress);
        state.appendChild(button("取消",function () {settings.cancel();}));
        var snapshot=JSON.stringify(graph);
        try {
            var supplemented=await settings.run(text,version,actor,result,function (info) {if (requestId === extractionId && info.result === "pending") progress.textContent=info.stage === "headers" ? "等待 API 响应头…" : "已收到响应头，正在读取正文…";});
            if (requestId !== extractionId) return;
            if (JSON.stringify(graph) !== snapshot || $("prompt").value !== text) {state.replaceChildren(el("span","","需求或工作台已修改，本次 AI 结果未应用"));return;}
            if (!supplemented.graph) {
                state.replaceChildren(el("strong","","待配置"));
                var list=el("ul","match-notes");supplemented.notes.forEach(function (note) {list.appendChild(el("li","",note));});state.appendChild(list);appendUsage(state,supplemented.usage,supplemented.request);return;
            }
            update(function () {graph=supplemented.graph;arrange();selected=null;});
            showMatches(supplemented);appendUsage($("matches"),supplemented.usage,supplemented.request);
            setIntroMode(true);moveToWorkspace();
        } catch (error) {
            if (requestId !== extractionId) return;
            state.replaceChildren(el("span","",error.name === "AbortError" ? "已取消 AI 补全" : "AI 补全未完成："+error.message));
            appendUsage(state,error.usage,error.request);
            if (error.modelPlan) {
                var debug=el("details","ai-debug");debug.appendChild(el("summary","","查看模型返回的卡片方案"));
                debug.appendChild(el("pre","",JSON.stringify(error.modelPlan,null,2).slice(0,18000)));state.appendChild(debug);
            }
        }
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
        if (api.branchParent(graph,id)) {select(id);return;}
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
    function highlightDrop(action,event) {
        world.querySelectorAll(".drop-hover").forEach(function (node) {node.classList.remove("drop-hover");});
        var target=document.elementFromPoint(event.clientX,event.clientY), region=target && target.closest(".drop-region");
        if (!region || !board.contains(region)) return;
        var key=region.dataset.bubble+":"+region.dataset.region;
        if (!action.dropChecks) action.dropChecks=new Map();
        if (!action.dropChecks.has(key)) {
            var draft=JSON.parse(JSON.stringify(action.previewGraph || graph)), valid=true;
            try {api.place(draft,action.previewId || action.id,region.dataset.bubble,region.dataset.region);} catch (error) {valid=false;}
            action.dropChecks.set(key,valid);
        }
        if (action.dropChecks.get(key)) region.classList.add("drop-hover");
    }
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
            if (!drag.ghost) {
                drag.previewGraph=JSON.parse(JSON.stringify(graph));
                var preview;
                try {preview=drag.kind === "library" ? api.addNode(drag.previewGraph,drag.key) : api.addBubble(drag.previewGraph,{kind:drag.blockKind});}
                catch (error) {drag=null;notify(error.message);return;}
                drag.previewId=preview.id;
                drag.ghost=drag.kind === "library" ? nodeElement(preview) : bubbleElement(preview);
                drag.ghost.classList.add("drag-ghost","palette-preview");drag.ghost.setAttribute("aria-hidden","true");drag.ghost.setAttribute("inert","");drag.ghost.tabIndex=-1;
                drag.ghost.style.width=drag.kind === "library" ? "200px" : "370px";drag.ghost.style.transform="scale("+zoom+")";document.body.appendChild(drag.ghost);
            }
            drag.ghost.style.left=event.clientX+12+"px";drag.ghost.style.top=event.clientY+12+"px";
            highlightDrop(drag,event);
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
        highlightDrop(drag,event);
    });
    function dropIndex(region,y,id) {
        if (!region) return undefined;
        var selector=region.dataset.region === "condition" ? ".condition-row" : ".node, .bubble";
        return Array.from(region.children).filter(function (item) {return item.matches(selector) && (item.dataset.node || item.dataset.bubble || item.dataset.condition) !== id && y > item.getBoundingClientRect().top+item.getBoundingClientRect().height/2;}).length;
    }
    window.addEventListener("pointerup", function (event) {
        if (!drag) return;
        var action = drag; drag = null;
        world.querySelectorAll(".drop-hover").forEach(function (node) {node.classList.remove("drop-hover");});
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
        if ($("ai-dialog").open) return;
        if (event.key === "Escape") clearSelection();
        if (event.key === "Delete" && !event.repeat && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])") && selected) {event.preventDefault();deleteItem(selected);}
        if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.target.closest("input, textarea, select")) { event.preventDefault(); undo(); }
    });
    function deleteItem(id) {
        if (!api.nodeById(graph,id) && !api.blockById(graph,id)) return;
        withUndo(function () {update(function () {api.remove(graph,id);selected=null;});});
    }
    function undo() { $("notice").replaceChildren();toastUndoState=null; if (!history.length) return; graph = JSON.parse(history.pop()); selected = null; pending = null; render(); }
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
    $("prompt").addEventListener("input",function () {window.BvnComposerAISettings.cancel();});
    $("library-search").addEventListener("input", renderLibrary);
    $("auto-path").addEventListener("change", function () {libraryOpen.delete("paths");renderLibrary();});
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
    $("clear").addEventListener("click", function () { withUndo(function () {update(function () { var next = api.createGraph(); next.version = graph.version; next.actor = graph.actor; graph = next; selected = null; }); $("matches").replaceChildren(); zoom = 1; resizeWorld(); },"已清空工作台"); });
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
    var introInitializing=true;
    var introLocked=false, introLayoutPending=false, introScrollActive=false, introTransitionId=0, introScrollFrame, introAnchor=0, introReady=Promise.resolve(), topArmed=false, topTimer, touchY=null;
    function armTop() {clearTimeout(topTimer);topTimer=setTimeout(function () {topArmed=window.scrollY <= 0 && document.body.classList.contains("workspace-mode");},180);}
    function releaseIntroLock() {
        if (introLayoutPending || introScrollActive) return;
        document.documentElement.classList.remove("intro-scroll-locked");
        document.documentElement.classList.toggle("intro-expanded",!document.body.classList.contains("workspace-mode"));
        window.scrollTo({top:introAnchor,behavior:"instant"});introLocked=false;
    }
    function setIntroMode(compact) {
        if (introInitializing) {document.body.classList.toggle("workspace-mode",compact);return Promise.resolve();}
        if (document.body.classList.contains("workspace-mode") === compact) return introLayoutPending ? introReady : Promise.resolve();
        var transitionId=++introTransitionId;
        introLocked=true;introLayoutPending=true;topArmed=false;clearTimeout(topTimer);
        if (!introScrollActive) introAnchor=0;
        document.documentElement.classList.add("intro-scroll-locked");
        window.scrollTo({top:introAnchor,behavior:"instant"});
        document.body.classList.toggle("workspace-mode",compact);
        document.documentElement.classList.toggle("intro-expanded",!compact);
        introReady=new Promise(function (resolve) {
            requestAnimationFrame(function () {
                var stage=document.querySelector(".prompt-stage"), animations=stage.getAnimations ? stage.getAnimations({subtree:true}) : [];
                Promise.all(animations.map(function (animation) {return animation.finished.catch(function () {});})).then(function () {
                    if (transitionId === introTransitionId) {introLayoutPending=false;releaseIntroLock();}
                    resolve();
                });
            });
        });
        return introReady;
    }
    var introWorkspaceTarget=0;
    function workspaceTarget() {
        var stage=document.querySelector(".prompt-stage"), measure=stage.cloneNode(true);
        measure.classList.add("intro-measure");measure.setAttribute("aria-hidden","true");measure.setAttribute("inert","");
        measure.querySelectorAll("[id]").forEach(function (node) {node.removeAttribute("id");});
        measure.style.width=stage.getBoundingClientRect().width+"px";
        stage.parentElement.appendChild(measure);
        // Measure the compact layout without finishing or restarting the visible transitions
        var finalHeight=measure.getBoundingClientRect().height;
        measure.remove();
        return Math.max(1,document.querySelector(".basket").getBoundingClientRect().top+window.scrollY-stage.getBoundingClientRect().height+finalHeight-12);
    }
    function moveToWorkspace() {
        introTopCollapsed=false;
        cancelAnimationFrame(introScrollFrame);
        introScrollActive=true;introLocked=true;topArmed=false;clearTimeout(topTimer);
        document.documentElement.classList.add("intro-scroll-locked");
        fit();
        var startY=window.scrollY, startTime=null;
        introWorkspaceTarget=workspaceTarget();
        var duration=window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : parseFloat(getComputedStyle(document.body).getPropertyValue("--composer-intro-duration")) || 260;
        function advance(time) {
            if (startTime === null) startTime=time;
            var progress=duration ? Math.min(1,(time-startTime)/duration) : 1, eased=1-Math.pow(1-progress,3);
            window.scrollTo({top:startY+(introWorkspaceTarget-startY)*eased,behavior:"instant"});introAnchor=window.scrollY;
            if (progress < 1) introScrollFrame=requestAnimationFrame(advance);
            else {introScrollActive=false;releaseIntroLock();}
        }
        introScrollFrame=requestAnimationFrame(advance);
    }
    var pageScroll=$("page-scroll"), pageSeeking=false;
    function syncPageScroll() {
        if (pageSeeking) return;
        var maximum=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
        pageScroll.value=maximum ? Math.round(window.scrollY/maximum*1000) : 0;
        pageScroll.setAttribute("aria-valuetext",Math.round(Number(pageScroll.value)/10)+"%");
    }
    pageScroll.addEventListener("input",function () {
        pageSeeking=true;
        setIntroMode(true).then(function () {
            var maximum=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
            window.scrollTo({top:maximum*Number(pageScroll.value)/1000,behavior:"instant"});
            pageScroll.setAttribute("aria-valuetext",Math.round(Number(pageScroll.value)/10)+"%");
            pageSeeking=false;
        });
    });
    window.addEventListener("scroll",syncPageScroll,{passive:true});
    window.addEventListener("resize",syncPageScroll);
    new ResizeObserver(syncPageScroll).observe(document.body);
    var introGestureUntil=0, introTopCollapsed=false;
    function scrollIntent(event,delta) {
        if (!delta) return;
        if ($("ai-dialog").open) return;
        // Collapsing the intro alone does not count as leaving the page top
        if (delta < 0 && introTopCollapsed && window.scrollY <= 0 && !introScrollActive) {
            event.preventDefault();introTopCollapsed=false;introGestureUntil=0;setIntroMode(false);return;
        }
        if (introLocked) {event.preventDefault();introGestureUntil=performance.now()+160;return;}
        var compact=document.body.classList.contains("workspace-mode");
        if (!compact) {event.preventDefault();introGestureUntil=performance.now()+160;if (delta > 0) {introTopCollapsed=window.scrollY <= 0;setIntroMode(true);}return;}
        if (performance.now() < introGestureUntil) {event.preventDefault();introGestureUntil=performance.now()+160;return;}
        if (event.target.closest && event.target.closest("#board, #library-list, #inspector")) return;
        if (compact && delta < 0 && window.scrollY <= 0) {
            event.preventDefault();
            if (topArmed) setIntroMode(false); else armTop();
        } else {topArmed=false;clearTimeout(topTimer);}
    }
    window.addEventListener("wheel",function (event) {if (!event.ctrlKey) scrollIntent(event,event.deltaY);},{passive:false,capture:true});
    window.addEventListener("touchstart",function (event) {touchY=event.touches.length === 1 ? event.touches[0].clientY : null;},{passive:true});
    window.addEventListener("touchmove",function (event) {if (touchY === null || event.touches.length !== 1) return;var y=event.touches[0].clientY;scrollIntent(event,touchY-y);touchY=y;},{passive:false,capture:true});
    window.addEventListener("keydown",function (event) {
        if (event.target.closest("input, textarea, select, [contenteditable='true']") || event.ctrlKey || event.metaKey || event.altKey) return;
        var delta=["ArrowDown","PageDown"," ","End"].includes(event.key) ? 1 : ["ArrowUp","PageUp"].includes(event.key) ? -1 : 0;
        scrollIntent(event,delta);
    });
    window.addEventListener("scroll",function () {
        if (window.scrollY > 0) introTopCollapsed=false;
        if (introInitializing) {document.body.classList.toggle("workspace-mode",window.scrollY > 0);return;}
        if (introLocked) return;
        if (!document.body.classList.contains("workspace-mode") && window.scrollY > 0) {setIntroMode(true);return;}
        if (window.scrollY <= 0) armTop(); else {topArmed=false;clearTimeout(topTimer);}
    },{passive:true});
    function finishInitialLayout() {
        requestAnimationFrame(function () {requestAnimationFrame(function () {
            document.body.classList.toggle("workspace-mode",window.scrollY > 0);
            document.documentElement.classList.toggle("intro-expanded",window.scrollY <= 0);
            void document.querySelector(".prompt-stage").offsetHeight;
            document.body.classList.remove("intro-initializing");introInitializing=false;
        });});
    }
    window.addEventListener("pageshow",finishInitialLayout);
    if (document.readyState === "complete") finishInitialLayout();
    document.body.classList.toggle("workspace-mode",window.scrollY > 0);
    render(); requestAnimationFrame(fit);
}());
