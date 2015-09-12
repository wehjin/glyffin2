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
    function list(cellGlyffs, cellHeight) {
        if (cellGlyffs.length === 0) {
            return glyffin_all_1.ClearGlyff;
        }
        if (cellGlyffs.length === 1) {
            var cellGlyff = cellGlyffs[0];
            return glyffin_all_1.Glyff.create(function (lower) {
                var listPerimeter = lower.perimeter;
                var cellPixelsHigh = cellHeight.getPixels(listPerimeter.getHeight());
                var cellPerimeter = listPerimeter.withHeight(cellPixelsHigh, .5);
                lower.addPresentation(cellGlyff.present(cellPerimeter, lower.audience, lower));
            }, cellGlyff.depth);
        }
        var depth = 0;
        for (var i = 0; i < cellGlyffs.length; i++) {
            depth = Math.max(depth, cellGlyffs[i].depth);
        }
        var cellCount = cellGlyffs.length;
        var dividerPixelsHigh = 10;
        return glyffin_all_1.Glyff.create(function (lower) {
            var listPerimeter = lower.perimeter;
            var listPixelsHigh = listPerimeter.getHeight();
            var cellPixelsHigh = cellHeight.getPixels(listPixelsHigh);
            var centerPerimeter = listPerimeter.withHeight(cellPixelsHigh, .5);
            var cellAndDividerPixelsHigh = cellPixelsHigh + dividerPixelsHigh;
            for (var i = 0; i < cellCount; i++) {
                var cellGlyff = cellGlyffs[i];
                var cellShift = i * cellAndDividerPixelsHigh;
                var cellPerimeter = centerPerimeter.translateY(cellShift);
                lower.addPresentation(cellGlyff.present(cellPerimeter, lower.audience, lower));
            }
            var maxVisible = (cellPixelsHigh == 0 ? 20 : Math.floor(listPixelsHigh / cellPixelsHigh)) +
                2;
        }, depth);
    }
    list(cells, cellHeight).present(perimeter, audience);
});
//# sourceMappingURL=list.js.map