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

function main() {
    var room = new Glyffin.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
    var audience = new Glyffin.GlAudience(room);
    var perimeter = new Glyffin.Perimeter(0, 0, room.width, room.height, 1, 0);
    var metrics = new Metrics(perimeter, 48, 10, new Glyffin.Palette());

    var covers : Glyff<Void>[] = [Glyffin.RedGlyff, Glyffin.GreenGlyff];
    var coverIndex = 0;

    var presentation : Glyffin.Presentation;

    function represent() {
        coverIndex = (coverIndex + 1) == covers.length ? 0 : (coverIndex + 1);
        var cover = covers[coverIndex];

        if (presentation) {
            presentation.end();
        }
        var revelation = Glyffin.BlueGlyff.clicken("change", Glyff.color(Glyffin.Color.CYAN));
        var glyff = cover.revealDown(new Glyffin.Inset1(.33, 0), revelation);
        presentation = glyff.present(metrics, audience, (symbol : string)=> {
            console.log(symbol);
            if ("change" == symbol) {
                represent();
            }
        });
    }

    represent();
}

