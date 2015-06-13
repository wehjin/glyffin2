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

function main() {
    var glAudience : Glyffin.Audience = new Glyffin.GlAudience();
    var headline = "Bidding for the 2026 World Cup is suspended by FIFA as Valcke denies wrongdoing";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789";
    var demo = Glyffin.RedGlyff
        .addTop(100, Glyffin.BlueGlyff
            .addTop(80, Glyffin.asciiMultiLine(3, alphabet))
            .pad(10, 10))
        .addTop(50, Glyffin.BlueGlyff
            .addTop(30, Glyffin.asciiMultiLine(2, headline))
            .pad(10, 10))
        .addTop(70, Glyffin.BlueGlyff
            .addTop(50, Glyffin.asciiMultiLine(3, headline))
            .pad(10, 10))
        .addTopReact(44, Glyffin.button());

    var app = Glyff.create((audience : Audience, presenter : Presenter<Void>)=> {
        var page = Glyffin.BeigeGlyff.addTopReact(44, Glyffin.button());

        var presented;

        function setPresented(glyff : Glyff<number>, next : Glyff<number>) {
            if (presented) {
                presented.remove();
            }
            presented = presenter.addPresentation(glyff.present(audience, ()=> {
                setPresented(next, glyff);
            }));
        }

        setPresented(page, demo);
    });
    app.present(glAudience);
}

