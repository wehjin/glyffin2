/**
 * Created by wehjin on 5/24/15.
 */

import Glyffin = require("../src/glyffin-all");

var room = new Glyffin.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new Glyffin.GlAudience(room);
var perimeter = room.perimeter;

var step = Glyffin.GreenGlyff.pad2(Glyffin.Inset2.EIGHTH).over(Glyffin.RedGlyff, 4);
Glyffin.BlueGlyff
    .pad2(Glyffin.Inset2.QUARTER)
    .over(step)
    .present(perimeter, audience);
