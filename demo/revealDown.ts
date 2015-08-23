/**
 * Created by wehjin on 5/24/15.
 */

import Glyffin = require("../glyffin");
import GlyffinGl = require("../glyffin-gl");

var room = new GlyffinGl.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlyffinGl.GlAudience(room);
var perimeter = room.perimeter;
var covers : Glyffin.Glyff<Glyffin.Void>[] = [Glyffin.RedGlyff, Glyffin.GreenGlyff];
var coverIndex = 0;

var presentation : Glyffin.Presentation;

function represent() {
    coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
    var cover = covers[coverIndex];

    if (presentation) {
        presentation.end();
    }
    var revelation = Glyffin.BlueGlyff.clicken("change",
        Glyffin.Glyff.color(Glyffin.Color.CYAN));
    var glyff = cover.revealDown(new Glyffin.Inset1(.33, 0), revelation);
    presentation = glyff.present(perimeter, audience, (symbol : string)=> {
        console.log(symbol);
        if ("change" == symbol) {
            represent();
        }
    });
}

represent();


