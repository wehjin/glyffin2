/**
 * Created by wehjin on 6/6/15.
 */
define(["require", "exports", "./glyffin"], function (require, exports, Glyffin) {
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
                var isHit = interactive.isHit(x, y);
                if (isHit) {
                    hitInteractives.push(interactive);
                }
            });
            hitInteractives.sort(function (a, b) {
                return -(a.bounds.level - b.bounds.level);
            });
            return hitInteractives;
        };
        return Interactive;
    })();
    exports.Interactive = Interactive;
    function button(symbol) {
        symbol = symbol || "button";
        return Glyffin.GreenGlyff.clicken(symbol, Glyffin.BlueGlyff);
    }
    exports.button = button;
});
//# sourceMappingURL=glyffin-touch.js.map