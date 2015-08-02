/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="../webglbook.d.ts" />
/// <reference path="../glyffin.ts" />
/// <reference path="../glyffin-ascii.ts" />
/// <reference path="../glyffin-gl.ts" />
/// <reference path="../glyffin-touch.ts" />
/// <reference path="../rx.ts" />
var Void = Glyffin.Void;
var Glyff = Glyffin.Glyff;
var Color = Glyffin.Color;
function main() {
    var room = new Glyffin.GlRoom(document.getElementById('webgl'));
    var glAudience = new Glyffin.GlAudience(room);
    var backColors = [Color.RED, Color.GREEN, Color.BLUE];
    var pageGlyffs = [];
    backColors.forEach(function (color) {
        pageGlyffs.push(Glyff.color(color));
    });
    function getPageGlyff(index) {
        var page = (index >= 0 && index < pageGlyffs.length) ? pageGlyffs[index] : null;
        if (!page) {
            return null;
        }
        return page.clicken("drill").revealDown(new Glyffin.Inset1(.3, 0), Glyffin.BlackGlyff);
    }
    var palette = new Glyffin.Palette();
    var screenWidth = room.width;
    var perimeter = new Glyffin.Perimeter(0, 0, screenWidth, room.height, 1, 0);
    var metrics = new Glyffin.Metrics(perimeter, 48, 13, palette);
    var index = 0;
    function incrIndex() {
        if ((index + 1) < pageGlyffs.length) {
            index = index + 1;
        }
    }
    function decrIndex() {
        if ((index - 1) >= 0) {
            index = index - 1;
        }
    }
    var presentation;
    function refresh() {
        if (presentation) {
            presentation.end();
        }
        var pageGlyff = getPageGlyff(index);
        var pagesGlyff = pageGlyff.pagen(index, getPageGlyff(index + 1), getPageGlyff(index - 1));
        var app = Glyffin.BlackGlyff.addNearMajor(1, pagesGlyff);
        presentation = app.present(metrics, glAudience, function (symbol) {
            console.log("%s", symbol);
            if (symbol === "next") {
                incrIndex();
                refresh();
            }
            else if (symbol === "back") {
                decrIndex();
                refresh();
            }
        });
    }
    refresh();
}
//# sourceMappingURL=pagen.js.map