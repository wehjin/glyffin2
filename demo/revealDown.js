/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../glyffin", "../glyffin-gl"], function (require, exports, Glyffin, GlyffinGl) {
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var audience = new GlyffinGl.GlAudience(room);
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
        var revelation = Glyffin.BlueGlyff.clicken("change", Glyffin.Glyff.color(Glyffin.Color.CYAN));
        var glyff = cover.revealDown(new Glyffin.Inset1(.33, 0), revelation);
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