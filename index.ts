/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
/// <reference path="glyffin-touch.ts" />

import Insertion = Glyffin.Insertion;

function main() {
    var glAudience : Glyffin.Audience = new Glyffin.GlAudience();
    var headline = "Bidding for the 2026 World Cup is suspended by FIFA as Valcke denies wrongdoing";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz";
    Glyffin.RedGlyff
        .addTop(100, Glyffin.BlueGlyff
            .addTop(80, Glyffin.asciiMultiLine(2, alphabet))
            .pad(10, 10))
        .addTop(50, Glyffin.BlueGlyff
            .addTop(30, Glyffin.asciiMultiLine(2, headline))
            .pad(10, 10))
        .addTop(70, Glyffin.BlueGlyff
            .addTop(50, Glyffin.asciiMultiLine(3, headline))
            .pad(10, 10))
        .addTop(44, Glyffin.button())
        .present(glAudience);
}

