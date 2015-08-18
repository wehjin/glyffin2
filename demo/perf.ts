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
            presentation = Glyffin.asciiMultiLine(10, word).present(metrics, audience);
            audience.clearAndRedraw();
            presentation.end();
        }
        var elapsed = Date.now() - start;
        presentation = Glyffin.asciiMultiLine(10, "Elapsed: " + elapsed.toString())
            .clicken("restart")
            .present(metrics, audience, (result : string)=> {
                if (result == "restart") {
                    measure();
                }
            });
    }

    measure();
}

