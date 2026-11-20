(function (root, factory) {
    var api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.BvnComposerWires = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    function curve(a, b) {
        var distance = b.x - a.x;
        // Forward connections keep their handles inside the available gap
        var bend = distance >= 0 ? Math.min(120, distance * .45) : Math.min(150, Math.max(45, -distance * .3));
        return [a, { x: a.x + bend, y: a.y }, { x: b.x - bend, y: b.y }, b];
    }
    function path(a, b, bubble) {
        if (bubble && a.x > bubble.left - 22) {
            // Enter a nested card through the bubble's left margin, away from its contents
            var gutter = Math.max(8, bubble.left - 22), top = Math.max(8, bubble.top - 22), turn = Math.min(50, Math.max(24, Math.abs(a.x - b.x) * .15));
            var corner = Math.min(12, Math.max(0, b.y - top) / 2);
            return "M" + a.x + "," + a.y + " C" + (a.x + turn) + "," + a.y + " " + (a.x + turn) + "," + top + " " + a.x + "," + top +
                " L" + (gutter + corner) + "," + top + " Q" + gutter + "," + top + " " + gutter + "," + (top + corner) +
                " L" + gutter + "," + (b.y - corner) + " Q" + gutter + "," + b.y + " " + (gutter + corner) + "," + b.y + " L" + b.x + "," + b.y;
        }
        var points = curve(a, b);
        return "M" + a.x + "," + a.y + " C" + points.slice(1).map(function (p) { return p.x + "," + p.y; }).join(" ");
    }
    return { curve: curve, path: path };
}));
