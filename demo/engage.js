/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="../webglbook.d.ts" />
/// <reference path="../glyffin.ts" />
/// <reference path="../glyffin-ascii.ts" />
/// <reference path="../glyffin-gl.ts" />
/// <reference path="../glyffin-touch.ts" />
/// <reference path="../rx.ts" />
var Void = Glyffin.Void;
var Glyff = Glyffin.Glyff;
var Color = Glyffin.Color;
function main() {
    var canvas = document.getElementById('webgl');
    var glHall = new Glyffin.GlHall(canvas);
    glHall.present(Glyffin.RedGlyff, function () {
    }, function (err) {
        console.error(err);
    });
}
//# sourceMappingURL=engage.js.map