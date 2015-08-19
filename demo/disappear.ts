/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="../webglbook.d.ts" />
/// <reference path="../glyffin.ts" />
/// <reference path="../glyffin-ascii.ts" />
/// <reference path="../glyffin-gl.ts" />
/// <reference path="../glyffin-touch.ts" />

import Insertion = Glyffin.Insertion;
import Glyff = Glyffin.Glyff;
import Audience = Glyffin.Audience;
import Presenter = Glyffin.Presenter;
import Void = Glyffin.Void;
import Reaction = Glyffin.Reaction;
import Presentation = Glyffin.Presentation;
import Color = Glyffin.Color;

function main() {
    var room = new Glyffin.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
    var audience = new Glyffin.GlAudience(room);
    var perimeter = room.perimeter;
    var covers : Glyff<Void>[] = [Glyffin.RedGlyff, Glyffin.GreenGlyff];
    var coverIndex = 0;

    var margin = perimeter.readHeight;
    var makeButton = function (label : string, ink : Glyff<Void>, back : Glyff<Void>) {
        var text = Glyffin.asciiEntireWord(label, ink).pad(margin, margin);
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
}

