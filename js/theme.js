(function () {
    "use strict";

    var script = document.currentScript;
    var root = script && script.dataset.themeRoot || ".";
    var key = "bvn-api-theme";
    var mode = "auto";
    try { mode = localStorage.getItem(key) || "auto"; } catch (error) { /* Storage may be unavailable for local files */ }

    function currentTheme() {
        if (mode === "light" || mode === "dark") return mode;
        var hour = new Date().getHours();
        return hour >= 5 && hour < 18 ? "light" : "dark";
    }

    function apply() {
        var theme = currentTheme();
        var link = document.getElementById("theme_css");
        if (link) {
            var href = root + "/css/theme-simple" + (theme === "dark" ? "-dark" : "") + ".css";
            function stylesReady() { document.documentElement.dataset.uiReady = "true"; }
            link.onload = stylesReady;
            if (link.href !== new URL(href, document.baseURI).href) {
                delete document.documentElement.dataset.uiReady;
                link.setAttribute("href", href);
            } else if (link.sheet) {
                stylesReady();
            }
        }
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        window.dispatchEvent(new CustomEvent("bvn-theme-change", { detail: { mode: mode, theme: theme } }));
    }

    function setMode(value) {
        mode = ["auto", "light", "dark"].indexOf(value) === -1 ? "auto" : value;
        try { localStorage.setItem(key, mode); } catch (error) { /* Keep the current page usable without storage */ }
        apply();
    }

    window.BvnTheme = {
        setMode: setMode,
        getMode: function () { return mode; },
        toggle: function () { setMode(currentTheme() === "dark" ? "light" : "dark"); }
    };
    window.addEventListener("storage", function (event) {
        if (event.key === key || event.key === null) { mode = event.newValue || "auto"; apply(); }
    });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) apply(); });
    window.setInterval(function () { if (mode === "auto") apply(); }, 60000);
    window.addEventListener("message", function (event) {
        if (event.origin !== location.origin || !event.data || event.data.type !== "bvn-tool-resize") return;
        var height = Number(event.data.height);
        if (!Number.isFinite(height)) return;
        document.querySelectorAll("iframe").forEach(function (frame) {
            if (frame.contentWindow === event.source && /\/tools\/(?:fire|defineAction|addAttacker)\.html(?:[?#]|$)/.test(frame.src)) {
                // iframe height includes its border; allow a few pixels for fractional layout rounding
                var style = getComputedStyle(frame);
                var borders = (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0);
                frame.height = String(Math.max(320, Math.ceil(height + borders + 4)));
            }
        });
    });
    apply();
}());
