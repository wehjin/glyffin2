///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */

import {Inset2, GlRoom, GlAudience, asciiMultiLine} from "../src/glyffin-all";

var room = new GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlAudience(room);
var perimeter = room.perimeter;
var alphabet = "" +
    "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\n" +
    "`abcdefghijklmnopqrstuvwxyz{|}~" +
    " !\"#$%&\'()*+,-.0123456789:;<=>?";
asciiMultiLine(3, alphabet)
    .pad2(Inset2.EIGHTH)
    .present(perimeter, audience);
