/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
/// <reference path="glyffin-touch.ts" />
var Insertion = Glyffin.Insertion;
var Glyff = Glyffin.Glyff;
var Void = Glyffin.Void;
var Metrics = Glyffin.Metrics;
function main() {
    var glAudience = new Glyffin.GlAudience();
    var perimeter = new Glyffin.Perimeter(0, 0, glAudience.canvas.width, glAudience.canvas.height, 1);
    var metrics = new Glyffin.Metrics(perimeter, 48, 10, new Glyffin.Palette());
    var headline = "Bidding for the 2026 World Cup is suspended by FIFA as Valcke denies wrongdoing";
    var headline2 = "Google didn’t lead the self-driving vehicle revolution. John Deere did";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 \"'(),.;:[]";
    var fingerPixels = metrics.tapHeight;
    var readPixels = metrics.readHeight;
    var demo = Glyffin.RedGlyff.shareHeightYield(100, Glyffin.BlueGlyff.shareHeightYield(readPixels * 8, Glyffin.asciiMultiLine(3, alphabet)).pad(10, 10)).shareHeightYield(readPixels * 5, Glyffin.BlueGlyff.shareHeightYield(readPixels * 3, Glyffin.asciiMultiLine(2, headline)).pad(readPixels, readPixels)).shareHeightYield(readPixels * 7, Glyffin.BlueGlyff.shareHeightYield(readPixels * 5, Glyffin.asciiMultiLine(3, headline2)).pad(readPixels, readPixels)).shareHeightRetain(fingerPixels, Glyffin.button());
    var app = Glyff.create(function (metrics, audience, presenter) {
        var page = Glyffin.BeigeGlyff.shareHeightRetain(fingerPixels, Glyffin.button());
        var presented;
        function setPresented(glyff, next) {
            if (presented) {
                presented.remove();
            }
            presented = presenter.addPresentation(glyff.present(metrics, audience, function () {
                setPresented(next, glyff);
            }));
        }
        setPresented(page, demo);
    });
    app.present(metrics, glAudience);
}
//# sourceMappingURL=index.js.map