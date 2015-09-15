///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */

import {
    Glyff, Void, Presenter, Inset2, Inset1, Perimeter, EMPTY_REMOVABLE, Spot, Gesturing,
    GlRoom, GlAudience, asciiMultiLine, VerticalGesturing,
    RedGlyff, BlueGlyff, GreenGlyff, MagentaGlyff, ClearGlyff, GrayGlyff
} from "../src/glyffin-all";

var room = new GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlAudience(room);
var perimeter = room.perimeter;

function getCell(backGlyff : Glyff<Void>) : Glyff<string> {
    return backGlyff.clicken("click", GrayGlyff);
}

var backs = [RedGlyff, BlueGlyff, GreenGlyff, MagentaGlyff];
var cells : Glyff<Void>[] = [];
for (var i = 0; i < backs.length; i++) {
    cells.push(getCell(backs[i]));
}
var cellHeight = new Inset1(.27, 0);


Glyff.verticalList(cells, cellHeight).present(perimeter, audience);
