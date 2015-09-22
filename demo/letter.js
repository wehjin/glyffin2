///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, glyffin_all_1) {
    var room = new glyffin_all_1.GlRoom(document.getElementById('webgl'));
    var audience = new glyffin_all_1.GlAudience(room);
    var perimeter = room.perimeter;
    var letter = "J";
    glyffin_all_1.Glyff.codePoint(letter.charCodeAt(0), glyffin_all_1.Color.GRAY)
        .pad2(glyffin_all_1.Inset2.EIGHTH)
        .over(glyffin_all_1.GrayGlyff, -1)
        .present(perimeter, audience);
});
//# sourceMappingURL=letter.js.map