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
    var glMetrics = glAudience.getMetrics();
    var headline = "Bidding for the 2026 World Cup is suspended by FIFA as Valcke denies wrongdoing";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789";
    var fingerPixels = glMetrics.tapHeight;
    var readPixels = glMetrics.readHeight;
    var demo = Glyffin.RedGlyff.addTop(100, Glyffin.BlueGlyff.addTop(readPixels * 8, Glyffin.asciiMultiLine(3, alphabet)).pad(10, 10)).addTop(readPixels * 5, Glyffin.BlueGlyff.addTop(readPixels * 3, Glyffin.asciiMultiLine(2, headline)).pad(readPixels, readPixels)).addTop(readPixels * 7, Glyffin.BlueGlyff.addTop(readPixels * 5, Glyffin.asciiMultiLine(3, headline)).pad(readPixels, readPixels)).addTopReact(fingerPixels, Glyffin.button());
    var app = Glyff.create(function (metrics, audience, presenter) {
        var page = Glyffin.BeigeGlyff.addTopReact(fingerPixels, Glyffin.button());
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
    app.present(glMetrics, glAudience);
}
//# sourceMappingURL=index.js.map