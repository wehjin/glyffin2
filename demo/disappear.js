/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="../webglbook.d.ts" />
/// <reference path="../glyffin.ts" />
/// <reference path="../glyffin-ascii.ts" />
/// <reference path="../glyffin-gl.ts" />
/// <reference path="../glyffin-touch.ts" />
var Insertion = Glyffin.Insertion;
var Glyff = Glyffin.Glyff;
var Void = Glyffin.Void;
var Metrics = Glyffin.Metrics;
var Color = Glyffin.Color;
function main() {
    var room = new Glyffin.GlRoom(document.getElementById('webgl'));
    var audience = new Glyffin.GlAudience(room);
    var perimeter = new Glyffin.Perimeter(0, 0, room.width, room.height, 1, 0);
    var metrics = new Metrics(perimeter, 48, 10, new Glyffin.Palette());
    var covers = [Glyffin.RedGlyff, Glyffin.GreenGlyff];
    var coverIndex = 0;
    var margin = metrics.readHeight;
    var makeButton = function (label, ink, back) {
        var text = Glyffin.asciiEntireWord(label, ink).pad(margin, margin);
        var unpressed = back.addNearMajor(1, text);
        var pressed = Glyff.color(Color.GRAY).addNearMajor(1, text);
        return unpressed.clicken("click", pressed);
    };
    var regular = makeButton("Clickable", Glyffin.BeigeGlyff, Glyff.color(Color.BLUE.lighten(.2))).disappear(false);
    var disappeared = makeButton("Disappeared", Glyffin.BeigeGlyff, Glyff.color(Color.BLUE.darken(.2))).disappear(true);
    var buttons = regular.splitWidthCombine(100, disappeared);
    var presentation;
    function represent() {
        coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
        var cover = covers[coverIndex];
        var glyff = cover.splitHeight(100, buttons);
        if (presentation) {
            presentation.end();
        }
        presentation = glyff.present(metrics, audience, function (symbol) {
            console.log(symbol);
            if ("click" == symbol) {
                represent();
            }
        });
    }
    represent();
}
//# sourceMappingURL=disappear.js.map