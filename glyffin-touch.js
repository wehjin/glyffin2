/**
 * Created by wehjin on 6/6/15.
 */
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    var Interactive = (function () {
        function Interactive(bounds, touchProvider) {
            this.bounds = bounds;
            this.touchProvider = touchProvider;
        }
        Interactive.prototype.isHit = function (touchX, touchY) {
            return this.bounds.left <= touchX && this.bounds.right >= touchX && this.bounds.top <= touchY && this.bounds.bottom >= touchY;
        };
        Interactive.findHits = function (all, x, y) {
            var hitInteractives = [];
            all.forEach(function (interactive) {
                if (interactive.isHit(x, y)) {
                    hitInteractives.push(interactive);
                }
            });
            return hitInteractives;
        };
        return Interactive;
    })();
    Glyffin.Interactive = Interactive;
    function button(symbol) {
        symbol = symbol || "button";
        return Glyffin.GreenGlyff.clicken(symbol, Glyffin.BlueGlyff);
    }
    Glyffin.button = button;
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-touch.js.map