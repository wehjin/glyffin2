/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, glyffin_all_1) {
    var room = new glyffin_all_1.GlRoom(document.getElementById('webgl'));
    var audience = new glyffin_all_1.GlAudience(room);
    var perimeter = room.perimeter;
    var covers = [glyffin_all_1.RedGlyff, glyffin_all_1.GreenGlyff];
    var coverIndex = 0;
    var presentation = glyffin_all_1.EMPTY_PRESENTATION;
    function represent() {
        coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
        var cover = covers[coverIndex];
        var revelation = glyffin_all_1.BlueGlyff.clicken("change", glyffin_all_1.Glyff.color(glyffin_all_1.Color.CYAN));
        var glyff = cover.revealDown(new glyffin_all_1.Inset1(.33, 0), revelation);
        presentation.end();
        presentation = glyff.present(perimeter, audience, function (symbol) {
            console.log(symbol);
            if ("change" == symbol) {
                represent();
            }
        });
    }
    represent();
});
//# sourceMappingURL=revealDown.js.map