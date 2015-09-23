/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../glyffin-type", "../glyffin", "../glyffin-gl", "../glyffin-ascii"], function (require, exports, glyffin_type_1, Glyffin, GlyffinGl, GlyffinText) {
    var Glyff = Glyffin.Glyff;
    var Color = Glyffin.Color;
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var audience = new GlyffinGl.GlAudience(room);
    var perimeter = room.perimeter;
    var covers = [Glyffin.RedGlyff, Glyffin.GreenGlyff];
    var coverIndex = 0;
    var margin = perimeter.readHeight;
    var makeButton = function (label, ink, back) {
        var text = GlyffinText.asciiEntireWord(label, ink)
            .pad2(new glyffin_type_1.Inset2(0, margin, .25, 0));
        var unpressed = back.addNearMajor(1, text);
        var pressed = Glyffin.BlackGlyff.addNearMajor(1, text);
        return unpressed.clicken("click", pressed);
    };
    var regular = makeButton("Clickable", Glyffin.BeigeGlyff, Glyff.color(Color.BLUE.lighten(.2)))
        .isolate(false);
    var isolated = makeButton("Isolated", Glyffin.BeigeGlyff, Glyff.color(Color.BLUE.darken(.2)))
        .isolate(true);
    var buttons = regular.splitWidthCombine(100, isolated);
    var presentation;
    function represent() {
        coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
        var cover = covers[coverIndex];
        var glyff = cover.splitHeight(100, buttons);
        if (presentation) {
            presentation.end();
        }
        presentation = glyff.present(perimeter, audience, function (symbol) {
            console.log(symbol);
            if ("click" == symbol) {
                represent();
            }
        });
    }
    represent();
});
//# sourceMappingURL=isolate.js.map