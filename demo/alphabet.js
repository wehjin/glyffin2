/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../glyffin", "../glyffin-gl", "../glyffin-ascii"], function (require, exports, Glyffin, GlyffinGl, GlyffinText) {
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var audience = new GlyffinGl.GlAudience(room);
    var perimeter = room.perimeter;
    var alphabet = "" + "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\n" + "`abcdefghijklmnopqrstuvwxyz{|}~" + " !\"#$%&\'()*+,-.0123456789:;<=>?";
    GlyffinText.asciiMultiLine(3, alphabet).pad2(Glyffin.Inset2.EIGHTH).present(perimeter, audience);
});
//# sourceMappingURL=alphabet.js.map