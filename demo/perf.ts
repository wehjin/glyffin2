/**
 * Created by wehjin on 5/24/15.
 */

import {Presentation} from "../glyffin-type";
import {Color} from "../glyffin";
import GlyffinGl = require("../glyffin-gl");
import Glyffin = require("../glyffin");
import GlyffinText = require("../glyffin-ascii");


var room = new GlyffinGl.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlyffinGl.GlAudience(room);
var perimeter = room.perimeter;
var word = "1234567890 ";
for (var i = 0; i < 5; i++) {
    word = word.concat(word);
}

var presentation : Presentation;

function measure() {
    if (presentation) {
        presentation.end();
    }
    var start = Date.now();
    for (var i = 0; i < 1; i++) {
        presentation =
            GlyffinText.asciiMultiLine(10, word, Color.BEIGE).present(perimeter, audience);
        audience.clearAndRedraw();
        presentation.end();
    }
    var elapsed = Date.now() - start;
    presentation = GlyffinText.asciiMultiLine(10, "Elapsed: " + elapsed.toString(), Color.BEIGE)
        .clicken("restart")
        .present(perimeter, audience, (result : string)=> {
            if (result == "restart") {
                measure();
            }
        });
}

measure();


