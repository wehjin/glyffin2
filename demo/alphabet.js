/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../glyffin-gl", "../glyffin-ascii"], function (require, exports, GlyffinGl, GlyffinText) {
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var audience = new GlyffinGl.GlAudience(room);
    var perimeter = room.perimeter;
    var alphabet = "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_" + " `abcdefghijklmnopqrstuvwxyz{|}~" + " !\"#$%&\'()*+,-.0123456789:;<=>?";
    GlyffinText.asciiMultiLine(3, alphabet).present(perimeter, audience);
});
//# sourceMappingURL=alphabet.js.map