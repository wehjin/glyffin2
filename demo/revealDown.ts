/**
 * Created by wehjin on 5/24/15.
 */

import {
    GlRoom, GlAudience, Glyff, Void, RedGlyff,GreenGlyff, BlueGlyff,
    EMPTY_PRESENTATION, Color, Inset1
} from "../src/glyffin-all";

var room = new GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlAudience(room);
var perimeter = room.perimeter;
var covers : Glyff<Void>[] = [RedGlyff, GreenGlyff];
var coverIndex = 0;

var presentation = EMPTY_PRESENTATION;

function represent() {
    coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
    var cover = covers[coverIndex];
    var revelation = BlueGlyff.clicken("change", Glyff.color(Color.CYAN));
    var glyff = cover.revealDown(new Inset1(.33, 0), revelation);
    presentation.end();
    presentation = glyff.present(perimeter, audience, (symbol : string)=> {
        console.log(symbol);
        if ("change" == symbol) {
            represent();
        }
    });
}

represent();


