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
        .insertTop(50, Glyffin.BlueGlyff
            .insertTop(30, Glyffin.asciiMultiLine(2, alphabet))
            .inset(10, 10))
        .insertTop(50, Glyffin.BlueGlyff
            .insertTop(30, Glyffin.asciiMultiLine(2, headline))
            .inset(10, 10))
        .insertTop(70, Glyffin.BlueGlyff
            .insertTop(50, Glyffin.asciiMultiLine(3, headline))
            .inset(10, 10))
        .insertTop(44, Glyffin.button())
        .present(glAudience);
}

