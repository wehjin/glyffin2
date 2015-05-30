/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
var Insertion = Glyffin.Insertion;
function main() {
    var glAudience = new Glyffin.GlAudience();
    var redGlyff = Glyffin.RedGlyff;
    var capWidth = 25;
    var spaceWidth = 5;
    var lineHeight = 35;
    var topGlyff = redGlyff.insertLefts([
        new Insertion(capWidth, Glyffin.ascii('A')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('B')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('C')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('D')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('E')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('F')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('G')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('H')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('I')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
        new Insertion(capWidth, Glyffin.ascii('J')),
        new Insertion(spaceWidth, Glyffin.ClearGlyff),
    ]).inset(spaceWidth);
    redGlyff.insertTop(lineHeight, topGlyff).present(glAudience);
}
//# sourceMappingURL=index.js.map