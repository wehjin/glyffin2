/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
/// <reference path="glyffin-touch.ts" />
function main() {
    var glAudience = new Glyffin.GlAudience();
    var background = [0x55, 0x055, 0x55, 0xff];
    var foreground = [0xbb, 0xbb, 0xbb, 0xff];
    var palette = new Glyffin.Palette().withLevel(0, [background, foreground]);
    var perimeter = new Glyffin.RectangleBounds(0, 0, glAudience.canvas.width, glAudience.canvas.height);
    var metrics = new Glyffin.Metrics(perimeter, 48, 10, palette);
    var cell = Glyffin.colorPath([0, 1]).addNearMajor(1, Glyffin.asciiMultiLine(3, "Hello").pad(metrics.readHeight * 2, metrics.readHeight)).limitHeight(metrics.tapHeight * 2, 0);
    var app = Glyffin.colorPath([0, 0]).addNearMajor(1, cell);
    app.present(metrics, glAudience);
}
//# sourceMappingURL=feed.js.map