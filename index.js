/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
function main() {
    var glAudience = new Glyffin.GlAudience();
    var topGlyff = Glyffin.ascii('D').inset(10);
    Glyffin.RedGlyff.insertTop(44, topGlyff).present(glAudience);
}
//# sourceMappingURL=index.js.map