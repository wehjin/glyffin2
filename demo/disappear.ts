/**
 * Created by wehjin on 5/24/15.
 */

import Glyffin=require("../glyffin");
import GlyffinGl=require("../glyffin-gl");
import GlyffinText=require("../glyffin-ascii");
import Glyff = Glyffin.Glyff;
import Void = Glyffin.Void;
import Color = Glyffin.Color;

var room = new GlyffinGl.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlyffinGl.GlAudience(room);
var perimeter = room.perimeter;
var covers : Glyff<Void>[] = [Glyffin.RedGlyff, Glyffin.GreenGlyff];
var coverIndex = 0;

var margin = perimeter.readHeight;
var makeButton = function (label : string, ink : Glyff<Void>, back : Glyff<Void>) {
    var text = GlyffinText.asciiEntireWord(label, ink).pad(margin, margin);
    var unpressed = back.addNearMajor(1, text);
    var pressed = Glyff.color(Color.GRAY).addNearMajor(1, text);
    return unpressed.clicken("click", pressed);
};
var regular = makeButton("Clickable", Glyffin.BeigeGlyff, Glyff.color(Color.BLUE.lighten(.2)))
    .disappear(false);
var disappeared = makeButton("Disappeared", Glyffin.BeigeGlyff,
    Glyff.color(Color.BLUE.darken(.2))).disappear(true);

var buttons = regular.splitWidthCombine(100, disappeared);

var presentation : Glyffin.Presentation;

function represent() {
    coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
    var cover = covers[coverIndex];

    var glyff = cover.splitHeight(100, buttons);

    if (presentation) {
        presentation.end();
    }
    presentation = glyff.present(perimeter, audience, (symbol : string)=> {
        console.log(symbol);
        if ("click" == symbol) {
            represent();
        }
    });
}

represent();


