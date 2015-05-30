/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
function main() {
    var glAudience = new Glyffin.GlAudience();
    var redGlyff = Glyffin.RedGlyff;
    var topGlyff = redGlyff.insertLeft(35, Glyffin.ascii('F')).insertLeft(7, Glyffin.ClearGlyff).insertLeft(35, Glyffin.ascii('E')).insertLeft(7, Glyffin.ClearGlyff).insertLeft(35, Glyffin.ascii('D')).insertLeft(7, Glyffin.ClearGlyff).insertLeft(35, Glyffin.ascii('C')).insertLeft(7, Glyffin.ClearGlyff).insertLeft(35, Glyffin.ascii('B')).insertLeft(7, Glyffin.ClearGlyff).insertLeft(35, Glyffin.ascii('A')).inset(7);
    redGlyff.insertTop(44, topGlyff).present(glAudience);
}
//# sourceMappingURL=index.js.map