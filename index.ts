/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />

import Insertion = Glyffin.Insertion;

function main() {
    var glAudience : Glyffin.Audience = new Glyffin.GlAudience();
    Glyffin.RedGlyff
        .insertTop(35, Glyffin.asciiEntireWord("ABCDEFGHIJKLMNOPQRSTUVWXYZ").inset(5))
        .insertTop(35, Glyffin.asciiEntireWord("abcdefghijklmnopqrstuvwxyz").inset(5))
        .present(glAudience);
}

