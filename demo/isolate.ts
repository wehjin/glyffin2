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
import Metrics = Glyffin.Metrics;
import Color = Glyffin.Color;

function main() {
    var room = new Glyffin.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
    var audience = new Glyffin.GlAudience(room);
    var perimeter = new Glyffin.Perimeter(0, 0, room.width, room.height, 1, 0);
    var metrics = new Metrics(perimeter, 48, 10, new Glyffin.Palette());

    var covers : Glyff<Void>[] = [Glyffin.RedGlyff, Glyffin.GreenGlyff];
    var coverIndex = 0;

    var margin = metrics.readHeight;
    var makeButton = function (label : string, ink : Glyff<Void>, back : Glyff<Void>) {
        var text = Glyffin.asciiEntireWord(label, ink)
            .pad2(new Glyffin.Inset2(0, margin, .25, 0))
        var unpressed = back.addNearMajor(1, text);
        var pressed = Glyffin.BlackGlyff.addNearMajor(1, text);
        return unpressed.clicken("click", pressed);
    };
    var regular = makeButton("Clickable", Glyffin.BeigeGlyff, Glyff.color(Color.BLUE.lighten(.2)))
        .isolate(false);
    var isolated = makeButton("Isolated", Glyffin.BeigeGlyff, Glyff.color(Color.BLUE.darken(.2)))
        .isolate(true);

    var buttons = regular.splitWidthCombine(100, isolated);

    var presentation : Glyffin.Presentation;

    function represent() {
        coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
        var cover = covers[coverIndex];

        var glyff = cover.splitHeight(100, buttons);

        if (presentation) {
            presentation.end();
        }
        presentation = glyff.present(metrics, audience, (symbol : string)=> {
            console.log(symbol);
            if ("click" == symbol) {
                represent();
            }
        });
    }

    represent();
}

