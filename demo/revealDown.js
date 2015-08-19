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
function main() {
    var room = new Glyffin.GlRoom(document.getElementById('webgl'));
    var audience = new Glyffin.GlAudience(room);
    var perimeter = room.perimeter;
    var covers = [Glyffin.RedGlyff, Glyffin.GreenGlyff];
    var coverIndex = 0;
    var presentation;
    function represent() {
        coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
        var cover = covers[coverIndex];
        if (presentation) {
            presentation.end();
        }
        var revelation = Glyffin.BlueGlyff.clicken("change", Glyff.color(Glyffin.Color.CYAN));
        var glyff = cover.revealDown(new Glyffin.Inset1(.33, 0), revelation);
        presentation = glyff.present(perimeter, audience, function (symbol) {
            console.log(symbol);
            if ("change" == symbol) {
                represent();
            }
        });
    }
    represent();
}
//# sourceMappingURL=revealDown.js.map