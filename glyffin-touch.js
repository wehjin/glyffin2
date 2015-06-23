/**
 * Created by wehjin on 6/6/15.
 */
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    function button(symbol) {
        symbol = symbol || "button";
        return Glyffin.GreenGlyff.clicken(symbol, Glyffin.BlueGlyff);
    }
    Glyffin.button = button;
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-touch.js.map