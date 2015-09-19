///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */

import {
    Glyff, Void, Presenter, Inset2, Inset1, Perimeter, EMPTY_REMOVABLE, Spot, Gesturing,
    GlRoom, GlAudience, asciiMultiLine,
    RedGlyff, BlueGlyff, GreenGlyff, MagentaGlyff, ClearGlyff, GrayGlyff, YellowGlyff, CyanGlyff
} from "../src/glyffin-all";

var room = new GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlAudience(room);
var perimeter = room.perimeter;

var backs = [RedGlyff, BlueGlyff, GreenGlyff, MagentaGlyff, YellowGlyff, CyanGlyff];

function getCell(backGlyff : Glyff<Void>) : Glyff<string> {
    return backGlyff.clicken("click", GrayGlyff);
}

var cells : Glyff<Void>[] = [];
for (var i = 0; i < backs.length; i++) {
    cells.push(getCell(backs[i]));
}
var cellHeight = new Inset1(.27, 0);


Glyff.verticalList(cells, cellHeight)
    .present(perimeter, audience, (x)=> {
        console.log(x);
    });
