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
    var perimeter = new Glyffin.RectangleBounds(0, 0, glAudience.canvas.width,
        glAudience.canvas.height);
    var metrics = new Glyffin.Metrics(perimeter, 48, 10, palette);

    var app = Glyffin.fromColorPath([0, 0]);
    app.present(metrics, glAudience);
}

