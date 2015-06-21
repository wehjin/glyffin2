/**
 * Created by wehjin on 5/24/15.
 */
var Glyffin;
(function (Glyffin) {
    var Void = (function () {
        function Void() {
        }
        return Void;
    })();
    Glyffin.Void = Void;
    var RectangleBounds = (function () {
        function RectangleBounds(left, top, right, bottom) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
        RectangleBounds.prototype.getHeight = function () {
            return this.bottom - this.top;
        };
        RectangleBounds.prototype.getWidth = function () {
            return this.right - this.left;
        };
        RectangleBounds.prototype.inset = function (pixelsX, pixelsY) {
            return new RectangleBounds(this.left + pixelsX, this.top + pixelsY, this.right - pixelsX, this.bottom - pixelsY);
        };
        RectangleBounds.prototype.downFromTop = function (pixelsY, pixelsHigh) {
            var inTop = this.top + pixelsY;
            return new RectangleBounds(this.left, inTop, this.right, inTop + pixelsHigh);
        };
        RectangleBounds.prototype.splitHorizontal = function (pixelsDown) {
            var split = this.top + pixelsDown;
            return [new RectangleBounds(this.left, this.top, this.right, split), new RectangleBounds(this.left, split, this.right, this.bottom)];
        };
        RectangleBounds.prototype.limitHeight = function (maxHeight, align) {
            var height = this.getHeight();
            return (height <= maxHeight) ? this : this.downFromTop((maxHeight - height) * align, maxHeight);
        };
        return RectangleBounds;
    })();
    Glyffin.RectangleBounds = RectangleBounds;
    var Color = (function () {
        function Color(red, green, blue, alpha) {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.alpha = alpha;
        }
        Color.get = function (red, green, blue, alpha) {
            return new Color(red, green, blue, alpha);
        };
        Color.getMany = function (hexRgbas) {
            var array = [];
            hexRgbas.forEach(function (hexRgba) {
                array.push(Color.get(hexRgba[0] / 255, hexRgba[1] / 255, hexRgba[2] / 255, hexRgba[3] / 255));
            });
            return array;
        };
        Color.RED = new Color(1, 0, 0, 1);
        Color.GREEN = new Color(0, 1, 0, 1);
        Color.BLUE = new Color(0, 0, 1, 1);
        Color.BEIGE = new Color(245 / 255, 245 / 255, 220 / 255, 1);
        return Color;
    })();
    Glyffin.Color = Color;
    var Palette = (function () {
        function Palette(colors) {
            this.colors = colors || [];
        }
        Palette.prototype.withLevel = function (level, hexRgbas) {
            var nextColors = this.colors.slice();
            nextColors[level] = Color.getMany(hexRgbas);
            return new Palette(nextColors);
        };
        Palette.prototype.get = function (colorPath) {
            return this.colors[colorPath[0]][colorPath[1]];
        };
        return Palette;
    })();
    Glyffin.Palette = Palette;
    var Spot = (function () {
        function Spot(x, y) {
            this.x = x;
            this.y = y;
        }
        return Spot;
    })();
    Glyffin.Spot = Spot;
    var Metrics = (function () {
        function Metrics(perimeter, tapHeight, readHeight, palette) {
            this.perimeter = perimeter;
            this.tapHeight = tapHeight;
            this.readHeight = readHeight;
            this.palette = palette;
        }
        Metrics.prototype.withPerimeter = function (perimeter) {
            return new Metrics(perimeter, this.tapHeight, this.readHeight, this.palette);
        };
        return Metrics;
    })();
    Glyffin.Metrics = Metrics;
    var Stage = (function () {
        function Stage(metrics, palette) {
            this.metrics = metrics;
            this.palette = palette;
        }
        return Stage;
    })();
    Glyffin.Stage = Stage;
    Glyffin.EMPTY_REMOVABLE = {
        remove: function () {
        }
    };
    Glyffin.EMPTY_PATCH = Glyffin.EMPTY_REMOVABLE;
    Glyffin.EMPTY_ACTIVE = Glyffin.EMPTY_REMOVABLE;
    var Insertion = (function () {
        function Insertion(amount, glyff) {
            this.amount = amount;
            this.glyff = glyff;
        }
        return Insertion;
    })();
    Glyffin.Insertion = Insertion;
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-basic.js.map