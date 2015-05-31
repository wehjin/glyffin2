/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />

import Insertion = Glyffin.Insertion;

function main() {
    var glAudience = new Glyffin.GlAudience();
    var spaceWidth = 5;
    var lineHeight = 35;
    var topGlyff = Glyffin.asciiEntireWord("ABCDEFGHIJKLR").inset(spaceWidth);
    Glyffin.RedGlyff.insertTop(lineHeight, topGlyff)
        .present(glAudience);
}

