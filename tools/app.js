(function () {
    "use strict";

    var api = window.BvnTools;
    var tool = document.body.dataset.tool;
    var spec = api.specs[tool];
    var host = document.getElementById("tool-app");
    // Embedded tools follow the API page without storing their own theme preference
    if (window.parent !== window) {
        try {
            var parentRoot = window.parent.document.documentElement;
            var parentTheme = window.parent.document.getElementById("theme_css");
            function followTheme() {
                var theme = parentRoot.dataset.theme || (parentTheme && parentTheme.href.indexOf("-dark.css") !== -1 ? "dark" : "light");
                var link = document.getElementById("theme_css");
                if (parentTheme && link.href !== parentTheme.href) link.href = parentTheme.href;
                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = theme;
            }
            followTheme();
            new MutationObserver(followTheme).observe(parentRoot, { attributes: true, attributeFilter: ["data-theme"] });
            if (parentTheme) new MutationObserver(followTheme).observe(parentTheme, { attributes: true, attributeFilter: ["href"] });
        } catch (error) { /* Cross-origin embeds retain the supplied stylesheet */ }
    }
    var fields = [];
    var output = "";
    var storedVersion = "3.0";
    try { storedVersion = localStorage.getItem("bvn-tool-version") || "3.0"; } catch (error) { /* Use the baseline version without storage */ }
    if (api.versions.indexOf(storedVersion) === -1) storedVersion = "3.0";

    function element(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }
    function option(value, label) {
        var node = element("option", "", label); node.value = value; return node;
    }
    function select(choices, id) {
        var node = element("select"); node.id = id;
        choices.forEach(function (choice) { node.appendChild(option(choice[0], choice[1])); });
        return node;
    }
    function label(text, node) {
        var wrapper = element("label", "tool-field");
        wrapper.appendChild(element("span", "", text)); wrapper.appendChild(node); return wrapper;
    }
    function card(title) {
        var node = element("section", "tool-card");
        node.appendChild(element("h2", "", title)); return node;
    }
    function button(text, className, handler) {
        var node = element("button", className, text); node.type = "button"; node.addEventListener("click", handler); return node;
    }

    var header = element("header", "tool-header");
    header.appendChild(element("h1", "", spec.title));
    host.appendChild(header);

    var form = element("form"); form.noValidate = true;
    var setup = card("调用设置"); var setupGrid = element("div", "tool-grid");
    var version = select(api.versions.map(function (v) { return [v, v === "FVO" ? "FVO（专用参数）" : "BVN " + v]; }), "target-version");
    version.value = storedVersion;
    var controller = select([], "controller"); setupGrid.appendChild(label("控制器", controller));
    var name = element("input"); name.type = "text"; name.id = "call-name"; name.placeholder = spec.namePlaceholder; name.autocomplete = "off";
    setupGrid.appendChild(label(spec.nameLabel, name)); setup.appendChild(setupGrid); form.appendChild(setup);

    var optional;
    spec.groups.forEach(function (group) {
        var section = group.collapsible ? element("details", "tool-card") : card(group.title);
        if (group.collapsible) section.appendChild(element("summary", "", group.title));
        var grid = element("div", group.columns === 1 ? "tool-grid tool-grid-single" : "tool-grid");
        if (group.collapsible) {
            optional = section;
            var versionSetting = label("目标版本", version);
            versionSetting.classList.add("tool-version-setting");
            section.appendChild(versionSetting);
        }
        group.fields.forEach(function (field) {
            var input;
            if (field.type === "boolean") input = select([["false", "false · 关闭"], ["true", "true · 开启"]], field.key);
            else if (field.type === "select") input = select(field.choices, field.key);
            else {
                input = element("input"); input.type = field.type; input.id = field.key;
                if (field.type === "number") { input.step = field.integer ? "1" : field.step || "any"; if (field.min !== undefined) input.min = field.min; }
                input.autocomplete = "off";
            }
            input.value = String(field.defaultValue);
            if (field.placeholder) input.placeholder = field.placeholder;
            var wrapper = label(field.label, input);
            if (field.since || field.versions) wrapper.appendChild(element("small", "tool-version", field.since ? field.since + "增加" : field.versions.join(" / ") + "可用"));
            if (field.help) wrapper.appendChild(element("small", "", field.help));
            grid.appendChild(wrapper); fields.push({ field: field, input: input, wrapper: wrapper, section: section });
        }); section.appendChild(grid); form.appendChild(section);
    });

    var actions = element("div", "tool-actions");
    actions.appendChild(button("重置参数", "", function () {
        name.value = ""; fields.forEach(function (item) { item.input.value = String(item.field.defaultValue); });
        refresh(); preview(false);
    }));
    var doc = element("a", "", "查看参数说明 ↗"); doc.href = spec.doc; doc.target = "_top"; actions.appendChild(doc);
    form.appendChild(actions); host.appendChild(form);

    var result = card("生成结果"); var resultHeader = element("div", "tool-output-header");
    resultHeader.appendChild(element("h2", "", "生成结果"));
    var outputActions = element("div", "tool-output-actions");
    var format = select([["single", "单行"], ["formatted", "格式化"]], "code-format");
    outputActions.appendChild(label("代码格式", format));
    var copy = button("复制代码", "", async function () {
        if (!output) return;
        try {
            if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(output);
            else {
                var area = element("textarea"); area.value = output; area.style.position = "fixed"; area.style.opacity = "0";
                document.body.appendChild(area);
                try {
                    area.select();
                    if (!document.execCommand("copy")) throw new Error("copy failed");
                } finally { area.remove(); }
            }
            message.textContent = "已复制代码"; message.dataset.state = "success";
        } catch (error) { message.textContent = "自动复制未完成，请手动选择上方代码复制"; message.dataset.state = "error"; }
    }); copy.disabled = true; outputActions.appendChild(copy); resultHeader.appendChild(outputActions); result.replaceChild(resultHeader, result.firstChild);
    var pre = element("pre", "tool-output"), code = element("code"); pre.appendChild(code); result.appendChild(pre);
    var message = element("p", "tool-message"); message.setAttribute("role", "status"); message.setAttribute("aria-live", "polite"); result.appendChild(message); host.appendChild(result);

    function values() {
        var state = {}; fields.forEach(function (item) { state[item.field.key] = item.field.type === "boolean" ? item.input.value === "true" : item.input.value; }); return state;
    }
    function refreshControllers() {
        var current = controller.value; controller.replaceChildren();
        spec.controllers.forEach(function (key) { var item = api.controllers[key]; if (api.available(item, version.value)) controller.appendChild(option(item.value, item.label)); });
        if (Array.from(controller.options).some(function (item) { return item.value === current; })) controller.value = current;
    }
    function refresh() {
        var state = values();
        fields.forEach(function (item) {
            var visible = api.available(item.field, version.value) && (!item.field.when || Object.keys(item.field.when).every(function (key) { return state[key] === item.field.when[key]; }));
            item.wrapper.hidden = !visible; item.input.disabled = !visible;
        });
        form.querySelectorAll(".tool-card").forEach(function (section) {
            if (section === setup || section === optional) return;
            section.hidden = !fields.some(function (item) { return item.section === section && !item.wrapper.hidden; });
        });
    }
    function preview(showError) {
        try {
            var result = api.build(tool, { version: version.value, controller: controller.value, name: name.value, values: values(), formatted: format.value === "formatted" });
            output = result.code; code.textContent = output; copy.disabled = false;
            message.textContent = result.warnings.join(" "); message.dataset.state = "hint";
        } catch (error) {
            output = ""; copy.disabled = true;
            code.textContent = name.value.trim() ? "完善参数后生成代码" : "填写" + spec.nameLabel + "后生成代码";
            message.textContent = showError || name.value.trim() ? error.message : ""; message.dataset.state = "error";
        }
    }
    version.addEventListener("change", function () {
        try { localStorage.setItem("bvn-tool-version", version.value); } catch (error) { /* Version selection still works without storage */ }
        refreshControllers(); refresh(); preview(false);
    });
    form.addEventListener("input", function () { refresh(); preview(false); });
    form.addEventListener("change", function () { refresh(); preview(false); });
    form.addEventListener("submit", function (event) { event.preventDefault(); refresh(); preview(true); });
    format.addEventListener("change", function () { preview(false); });
    refreshControllers(); refresh(); preview(false);

    function resize() {
        if (window.parent !== window) window.parent.postMessage({ type: "bvn-tool-resize", height: Math.ceil(host.getBoundingClientRect().height) }, location.origin);
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host);
    window.addEventListener("load", resize);
}());
