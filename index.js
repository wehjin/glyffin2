/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
function main() {
    var glAudience = new Glyffin.GlAudience();
    var redGlyff = Glyffin.RedGlyff;
    var capWidth = 25;
    var spaceWidth = 5;
    var lineHeight = 35;
    var topGlyff = redGlyff.insertLeft(capWidth, Glyffin.ascii('F')).insertLeft(spaceWidth, Glyffin.ClearGlyff).insertLeft(capWidth, Glyffin.ascii('E')).insertLeft(spaceWidth, Glyffin.ClearGlyff).insertLeft(capWidth, Glyffin.ascii('D')).insertLeft(spaceWidth, Glyffin.ClearGlyff).insertLeft(capWidth, Glyffin.ascii('C')).insertLeft(spaceWidth, Glyffin.ClearGlyff).insertLeft(capWidth, Glyffin.ascii('B')).insertLeft(spaceWidth, Glyffin.ClearGlyff).insertLeft(capWidth, Glyffin.ascii('A')).inset(spaceWidth);
    redGlyff.insertTop(lineHeight, topGlyff).present(glAudience);
}
//# sourceMappingURL=index.js.map