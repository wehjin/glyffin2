/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />

function main() {
    var glAudience = new Glyffin.GlAudience();
    Glyffin.asciiByCode('F'.charCodeAt(0)).inset(55).present(glAudience);
}

