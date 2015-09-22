///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, glyffin_all_1) {
    var room = new glyffin_all_1.GlRoom(document.getElementById('webgl'));
    var audience = new glyffin_all_1.GlAudience(room);
    var perimeter = room.perimeter;
    var letter = "U";
    var pixelsHigh = 8;
    var pixelsWide = 6;
    var smallLetter = new glyffin_all_1.Inset2(.5, -pixelsWide / 2, .5, -pixelsHigh / 2);
    var largeLetter = glyffin_all_1.Inset2.EIGHTH;
    glyffin_all_1.Glyff.codePoint(letter.charCodeAt(0), glyffin_all_1.Color.BLACK)
        .pad2(largeLetter)
        .over(glyffin_all_1.BeigeGlyff, -1)
        .present(perimeter, audience);
});
//# sourceMappingURL=letter.js.map