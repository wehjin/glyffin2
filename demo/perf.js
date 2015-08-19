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
    var word = "1234567890 ";
    for (var i = 0; i < 5; i++) {
        word = word.concat(word);
    }
    var presentation;
    function measure() {
        if (presentation) {
            presentation.end();
        }
        var start = Date.now();
        for (var i = 0; i < 1; i++) {
            presentation = Glyffin.asciiMultiLine(10, word).present(perimeter, audience);
            audience.clearAndRedraw();
            presentation.end();
        }
        var elapsed = Date.now() - start;
        presentation = Glyffin.asciiMultiLine(10, "Elapsed: " + elapsed.toString()).clicken("restart").present(perimeter, audience, function (result) {
            if (result == "restart") {
                measure();
            }
        });
    }
    measure();
}
//# sourceMappingURL=perf.js.map