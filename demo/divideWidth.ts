/**
 * Created by wehjin on 5/24/15.
 */

import Glyffin = require("../src/glyffin-all");

var room = new Glyffin.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new Glyffin.GlAudience(room);
var perimeter = room.perimeter;

var glyffs = [Glyffin.RedGlyff, Glyffin.GreenGlyff, Glyffin.BlueGlyff];
var inset = new Glyffin.Core.Inset1(.25, 0);
var divideWidth = Glyffin.Glyff.divideWidth(glyffs, inset, Glyffin.Core.ClearGlyff);
divideWidth.present(perimeter, audience);
