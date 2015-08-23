/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, Glyffin) {
    var room = new Glyffin.GlRoom(document.getElementById('webgl'));
    var audience = new Glyffin.GlAudience(room);
    var perimeter = room.perimeter;
    var step = Glyffin.GreenGlyff.pad2(Glyffin.Inset2.EIGHTH).over(Glyffin.RedGlyff, 4);
    Glyffin.BlueGlyff.pad2(Glyffin.Inset2.QUARTER).over(step).present(perimeter, audience);
});
//# sourceMappingURL=over.js.map