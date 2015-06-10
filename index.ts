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
    Glyffin.RedGlyff
        .insertTop(50, Glyffin.BlueGlyff
            .insertTop(10, Glyffin.ClearGlyff)
            .insertTop(10, Glyffin.asciiEntireWord("ABCDEFGHIJKLMNOPQRSTUVWXYZ"))
            .insertTop(10, Glyffin.ClearGlyff)
            .insertTop(10, Glyffin.asciiEntireWord("abcdefghijklmnopqrstuvwxyz"))
            .insertTop(10, Glyffin.ClearGlyff).inset(10, 0))
        .insertTop(44, Glyffin.button())
        .present(glAudience);
}

