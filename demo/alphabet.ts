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
    var audience = new Glyffin.GlAudience(<HTMLCanvasElement>document.getElementById('webgl'));
    var perimeter = new Glyffin.Perimeter(0, 0, audience.canvas.width, audience.canvas.height,
        1, 0);
    var metrics = new Metrics(perimeter, 48, 10, new Glyffin.Palette());
    var alphabet = "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_" +
        " `abcdefghijklmnopqrstuvwxyz{|}~" +
        " !\"#$%&\'()*+,-.0123456789:;<=>?";
    Glyffin.asciiMultiLine(3, alphabet).present(metrics, audience);
}

