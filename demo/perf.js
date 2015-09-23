/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../glyffin", "../glyffin-gl", "../glyffin-ascii"], function (require, exports, glyffin_1, GlyffinGl, GlyffinText) {
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var audience = new GlyffinGl.GlAudience(room);
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
            presentation =
                GlyffinText.asciiMultiLine(10, word, glyffin_1.Color.BEIGE).present(perimeter, audience);
            audience.clearAndRedraw();
            presentation.end();
        }
        var elapsed = Date.now() - start;
        presentation = GlyffinText.asciiMultiLine(10, "Elapsed: " + elapsed.toString(), glyffin_1.Color.BEIGE)
            .clicken("restart")
            .present(perimeter, audience, function (result) {
            if (result == "restart") {
                measure();
            }
        });
    }
    measure();
});
//# sourceMappingURL=perf.js.map