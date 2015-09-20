///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../src/glyffin-all"], function (require, exports, glyffin_all_1) {
    var canvas = document.getElementById("webgl");
    var atlas = new glyffin_all_1.Atlas();
    document.body.removeChild(canvas);
    document.body.appendChild(atlas.image);
});
//# sourceMappingURL=atlas.js.map