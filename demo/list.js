///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, glyffin_all_1) {
    var room = new glyffin_all_1.GlRoom(document.getElementById('webgl'));
    var audience = new glyffin_all_1.GlAudience(room);
    var perimeter = room.perimeter;
    var cells = [glyffin_all_1.RedGlyff, glyffin_all_1.BlueGlyff, glyffin_all_1.GreenGlyff];
    var cellHeight = new glyffin_all_1.Inset1(.27, 0);
    glyffin_all_1.Glyff.verticalList(cells, cellHeight).present(perimeter, audience);
});
//# sourceMappingURL=list.js.map