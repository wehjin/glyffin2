///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */

import {Inset2, GlRoom, GlAudience, Glyff, Color, BeigeGlyff} from "../src/glyffin-all";

var room = new GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlAudience(room);
var perimeter = room.perimeter;
var letter = "U";
var pixelsHigh = 8;
var pixelsWide = 6;
var smallLetter = new Inset2(.5, -pixelsWide / 2, .5, -pixelsHigh / 2);
var largeLetter = Inset2.EIGHTH;
Glyff.codePoint(letter.charCodeAt(0), Color.BLACK)
    .pad2(largeLetter)
    .over(BeigeGlyff, -1)
    .present(perimeter, audience);
