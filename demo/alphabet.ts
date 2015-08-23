/**
 * Created by wehjin on 5/24/15.
 */

import Glyffin=require("../glyffin");
import GlyffinGl=require("../glyffin-gl");
import GlyffinText=require("../glyffin-ascii");

var room = new GlyffinGl.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlyffinGl.GlAudience(room);
var perimeter = room.perimeter;
var alphabet = "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_" +
    " `abcdefghijklmnopqrstuvwxyz{|}~" +
    " !\"#$%&\'()*+,-.0123456789:;<=>?";
GlyffinText.asciiMultiLine(3, alphabet).present(perimeter, audience);
