/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../glyffin-type", "../glyffin", "../glyffin-gl"], function (require, exports, glyffin_type_1, Glyffin, GlyffinGl) {
    var Glyff = Glyffin.Glyff;
    var Color = Glyffin.Color;
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var glAudience = new GlyffinGl.GlAudience(room);
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
        return page.clicken("drill").revealDown(new glyffin_type_1.Inset1(.3, 0), Glyffin.BlackGlyff);
    }
    room.perimeter.readHeight = 13;
    var perimeter = room.perimeter;
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
        var page = getPageGlyff(index);
        var pages = page.stackNearLeft(getPageGlyff(index + 1), getPageGlyff(index - 1));
        var app = Glyffin.BlackGlyff.addNearMajor(1, pages);
        presentation = app.present(perimeter, glAudience, function (symbol) {
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
});
//# sourceMappingURL=pagen.js.map