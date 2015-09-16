///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, glyffin_all_1) {
    var room = new glyffin_all_1.GlRoom(document.getElementById('webgl'));
    var audience = new glyffin_all_1.GlAudience(room);
    var perimeter = room.perimeter;
    var backs = [glyffin_all_1.RedGlyff, glyffin_all_1.BlueGlyff, glyffin_all_1.GreenGlyff, glyffin_all_1.MagentaGlyff, glyffin_all_1.YellowGlyff, glyffin_all_1.CyanGlyff];
    function getCell(backGlyff) {
        return backGlyff.clicken("click", glyffin_all_1.GrayGlyff);
    }
    var cells = [];
    for (var i = 0; i < backs.length; i++) {
        cells.push(getCell(backs[i]));
    }
    var cellHeight = new glyffin_all_1.Inset1(.27, 0);
    glyffin_all_1.Glyff.verticalList(cells, cellHeight).present(perimeter, audience);
});
//# sourceMappingURL=list.js.map