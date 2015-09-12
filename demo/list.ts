///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */

import {
    Glyff, Void, Presenter, Inset2, Inset1,
    GlRoom, GlAudience, asciiMultiLine,
    RedGlyff, BlueGlyff, ClearGlyff,
} from "../src/glyffin-all";

var room = new GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlAudience(room);
var perimeter = room.perimeter;
var cells = [RedGlyff];
var cellHeight = new Inset1(.6, 0);

function list(cellGlyffs : Glyff<Void>[], cellHeight : Inset1) : Glyff<Void> {
    if (cellGlyffs.length === 0) {
        return ClearGlyff;
    }
    if (cellGlyffs.length === 1) {
        var cellGlyff = cellGlyffs[0];
        return Glyff.create((lower : Presenter<Void>)=> {
            var listPerimeter = lower.perimeter;
            var cellPixelsHigh = cellHeight.getPixels(listPerimeter.getHeight());
            var cellPerimeter = listPerimeter.withHeight(cellPixelsHigh, .5);
            cellGlyff.present(cellPerimeter, lower.audience, lower);
        }, cellGlyff.depth);
    }
    var depth = 0;
    for (var i = 0; i < cellGlyffs.length; i++) {
        depth = Math.max(depth, cellGlyffs[i].depth);
    }
    return Glyff.create((lower : Presenter<Void>)=> {
        var listPerimeter = lower.perimeter;
        var cellPixelsHigh = cellHeight.getPixels(listPerimeter.getHeight());
        var cellPerimeter = listPerimeter.withHeight(cellPixelsHigh, .5);
        cellGlyffs[0].present(cellPerimeter, lower.audience, lower);
    }, depth);
}


list(cells, cellHeight).present(perimeter, audience);
