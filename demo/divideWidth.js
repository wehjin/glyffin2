/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, Glyffin) {
    var room = new Glyffin.GlRoom(document.getElementById('webgl'));
    var audience = new Glyffin.GlAudience(room);
    var perimeter = room.perimeter;
    var inset = new Glyffin.Core.Inset1(.25, 0);
    var heightGlyffs = [Glyffin.Core.YellowGlyff, Glyffin.Core.CyanGlyff, Glyffin.BlueGlyff];
    var divideHeight = Glyffin.Glyff.divideHeight(heightGlyffs, inset);
    var widthGlyffs = [Glyffin.RedGlyff, Glyffin.GreenGlyff, divideHeight];
    var divideWidth = Glyffin.Glyff.divideWidth(widthGlyffs, inset, Glyffin.Core.ClearGlyff);
    divideWidth.present(perimeter, audience);
});
//# sourceMappingURL=divideWidth.js.map