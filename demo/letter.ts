///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */

import {Inset2, GlRoom, GlAudience, Glyff, Color, BeigeGlyff} from "../src/glyffin-all";

var room = new GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlAudience(room);
var perimeter = room.perimeter;
var letter = "J";
Glyff.codePoint(letter.charCodeAt(0), Color.GRAY)
    .pad2(Inset2.EIGHTH)
    .over(BeigeGlyff, -1)
    .present(perimeter, audience);
