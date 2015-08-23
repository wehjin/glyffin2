/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../glyffin-gl", "../glyffin"], function (require, exports, GlyffinGl, Glyffin) {
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var audience = new GlyffinGl.GlAudience(room);
    var perimeter = room.perimeter;
    var step = Glyffin.GreenGlyff.pad2(Glyffin.Inset2.EIGHTH).over(Glyffin.RedGlyff, 4);
    Glyffin.BlueGlyff.pad2(Glyffin.Inset2.QUARTER).over(step).present(perimeter, audience);
});
//# sourceMappingURL=over.js.map