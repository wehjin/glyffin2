///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, glyffin_all_1) {
    var room = new glyffin_all_1.GlRoom(document.getElementById('webgl'));
    var audience = new glyffin_all_1.GlAudience(room);
    var perimeter = room.perimeter;
    var alphabet = "" +
        "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\n" +
        "`abcdefghijklmnopqrstuvwxyz{|}~" +
        " !\"#$%&\'()*+,-.0123456789:;<=>?";
    glyffin_all_1.asciiMultiLine(3, alphabet, glyffin_all_1.Color.BEIGE)
        .pad2(glyffin_all_1.Inset2.EIGHTH)
        .present(perimeter, audience);
});
//# sourceMappingURL=alphabet.js.map