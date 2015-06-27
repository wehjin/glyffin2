/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
/// <reference path="glyffin-touch.ts" />

import Insertion = Glyffin.Insertion;
import Glyff = Glyffin.Glyff;
import Audience = Glyffin.Audience;
import Presenter = Glyffin.Presenter;
import Void = Glyffin.Void;
import Reaction = Glyffin.Reaction;
import Presentation = Glyffin.Presentation;
import Metrics = Glyffin.Metrics;

function main() {
    var glAudience = new Glyffin.GlAudience();
    var perimeter = new Glyffin.Perimeter(0, 0, glAudience.canvas.width, glAudience.canvas.height,
        1);
    var metrics = new Glyffin.Metrics(perimeter, 48, 10, new Glyffin.Palette());
    var headline = "Bidding for the 2026 World Cup is suspended by FIFA as Valcke denies wrongdoing";
    var headline2 = "Google didn’t lead the self-driving vehicle revolution. John Deere did";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 \"'(),.;:[]";
    var fingerPixels = metrics.tapHeight;
    var readPixels = metrics.readHeight;
    var demo = Glyffin.RedGlyff
        .splitHeightYield(100, Glyffin.BlueGlyff
            .splitHeightYield(readPixels * 8, Glyffin.asciiMultiLine(3, alphabet))
            .pad(10, 10))
        .splitHeightYield(readPixels * 5, Glyffin.BlueGlyff
            .splitHeightYield(readPixels * 3, Glyffin.asciiMultiLine(2, headline))
            .pad(readPixels, readPixels))
        .splitHeightYield(readPixels * 7, Glyffin.BlueGlyff
            .splitHeightYield(readPixels * 5, Glyffin.asciiMultiLine(3, headline2))
            .pad(readPixels, readPixels))
        .splitHeightRetain(fingerPixels, Glyffin.button());

    var app = Glyff.create((metrics : Metrics, audience : Audience, presenter : Presenter<Void>)=> {
        var page = Glyffin.BeigeGlyff.splitHeightRetain(fingerPixels, Glyffin.button());

        var presented;

        function setPresented(glyff : Glyff<number>, next : Glyff<number>) {
            if (presented) {
                presented.remove();
            }
            presented = presenter.addPresentation(glyff.present(metrics, audience, ()=> {
                setPresented(next, glyff);
            }));
        }

        setPresented(page, demo);
    });
    app.present(metrics, glAudience);
}

