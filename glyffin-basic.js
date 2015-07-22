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
    var Perimeter = (function () {
        function Perimeter(left, top, right, bottom, age, level) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.age = age;
            this.level = level;
        }
        Perimeter.prototype.getHeight = function () {
            return this.bottom - this.top;
        };
        Perimeter.prototype.getWidth = function () {
            return this.right - this.left;
        };
        Perimeter.prototype.withAge = function (age) {
            return new Perimeter(this.left, this.top, this.right, this.bottom, age, this.level);
        };
        Perimeter.prototype.withLevel = function (level) {
            return new Perimeter(this.left, this.top, this.right, this.bottom, this.age, level);
        };
        Perimeter.prototype.translate = function (x) {
            return new Perimeter(this.left + x, this.top, this.right + x, this.bottom, this.age, this.level);
        };
        Perimeter.prototype.inset = function (pixelsX, pixelsY) {
            return new Perimeter(this.left + pixelsX, this.top + pixelsY, this.right - pixelsX, this.bottom - pixelsY, this.age, this.level);
        };
        Perimeter.prototype.downFromTop = function (pixelsY, pixelsHigh) {
            var insetTop = this.top + pixelsY;
            return new Perimeter(this.left, insetTop, this.right, insetTop + pixelsHigh, this.age, this.level);
        };
        Perimeter.prototype.rightFromLeft = function (pixelsX, pixelsWide) {
            var insetLeft = this.left + pixelsX;
            return new Perimeter(insetLeft, this.top, insetLeft + pixelsWide, this.bottom, this.age, this.level);
        };
        Perimeter.prototype.splitHeight = function (pixels) {
            if (pixels >= 0) {
                var split = this.top + pixels;
                return [new Perimeter(this.left, this.top, this.right, split, this.age, this.level), new Perimeter(this.left, split, this.right, this.bottom, this.age, this.level)];
            }
            else {
                var split = this.bottom + pixels;
                return [new Perimeter(this.left, split, this.right, this.bottom, this.age, this.level), new Perimeter(this.left, this.top, this.right, split, this.age, this.level)];
            }
        };
        Perimeter.prototype.splitWidth = function (pixels) {
            if (pixels >= 0) {
                var split = this.left + pixels;
                return [new Perimeter(this.left, this.top, split, this.bottom, this.age, this.level), new Perimeter(split, this.top, this.right, this.bottom, this.age, this.level)];
            }
            else {
                var split = this.right + pixels;
                return [new Perimeter(split, this.top, this.right, this.bottom, this.age, this.level), new Perimeter(this.left, this.top, split, this.bottom, this.age, this.level)];
            }
        };
        Perimeter.prototype.limitHeight = function (maxHeight, align) {
            var height = this.getHeight();
            return (height <= maxHeight) ? this : this.downFromTop((height - maxHeight) * align, maxHeight);
        };
        Perimeter.prototype.limitWidth = function (maxWidth, align) {
            var width = this.getWidth();
            return (width <= maxWidth) ? this : this.rightFromLeft((width - maxWidth) * align, maxWidth);
        };
        return Perimeter;
    })();
    Glyffin.Perimeter = Perimeter;
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
        Color.mixComponent = function (mix, start, end) {
            return Math.min(1.0, Math.max(0.0, start + (end - start) * mix));
        };
        Color.prototype.mix = function (mix, endColor) {
            return new Color(Color.mixComponent(mix, this.red, endColor.red), Color.mixComponent(mix, this.green, endColor.green), Color.mixComponent(mix, this.blue, endColor.blue), Color.mixComponent(mix, this.alpha, endColor.alpha));
        };
        Color.WHITE = new Color(1, 1, 1, 1);
        Color.BLACK = new Color(0, 0, 0, 1);
        Color.RED = new Color(1, 0, 0, 1);
        Color.YELLOW = new Color(.5, .5, 0, 1);
        Color.GREEN = new Color(0, 1, 0, 1);
        Color.CYAN = new Color(0, .5, .5, 1);
        Color.BLUE = new Color(0, 0, 1, 1);
        Color.MAGENTA = new Color(.5, 0, .5, 1);
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
        Spot.prototype.gridDistance = function (other) {
            return Math.max(Math.abs(other.x - this.x), Math.abs(other.y - this.y));
        };
        Spot.prototype.xDistance = function (origin) {
            return this.x - origin.x;
        };
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
    var maxDuration = 50;
    var approximateDuration = maxDuration / 2;
    var SpeedometerX = (function () {
        function SpeedometerX(spot) {
            this.spots = [null, null, null];
            this.times = [0, 0, 0];
            this.count = 0;
            this.addSpot(spot);
        }
        SpeedometerX.prototype.addSpot = function (spot) {
            var count = this.count;
            var spots = this.spots;
            var times = this.times;
            var time = Date.now();
            if (count > 0 && time <= times[count - 1]) {
                count = count - 1;
            }
            if (count >= 3) {
                spots[0] = spots[1];
                times[0] = times[1];
                spots[1] = spots[2];
                times[1] = times[2];
                count = 2;
            }
            spots[count] = spot;
            times[count] = time;
            this.count = count + 1;
        };
        SpeedometerX.prototype.getVelocity = function () {
            switch (this.count) {
                case 3:
                    return this.getVelocity2();
                case 2:
                    return this.getVelocity1();
                default:
                    return 0;
            }
        };
        SpeedometerX.prototype.getCount = function () {
            return this.count;
        };
        SpeedometerX.prototype.getVelocity1 = function () {
            var duration = this.times[1] - this.times[0];
            var distance = this.spots[1].xDistance(this.spots[0]);
            if (duration > maxDuration) {
                // Last mark was fresh move.  We don't have a hard duration so approximate;
                return distance / approximateDuration;
            }
            return distance / duration;
        };
        SpeedometerX.prototype.getVelocity2 = function () {
            var duration2 = this.times[2] - this.times[1];
            var distance2 = this.spots[2].xDistance(this.spots[1]);
            if (duration2 > maxDuration) {
                // Last mark was fresh move.  We don't have a hard duration so approximate;
                return distance2 / approximateDuration;
            }
            return (this.getVelocity1() + distance2 / duration2) / 2;
        };
        return SpeedometerX;
    })();
    Glyffin.SpeedometerX = SpeedometerX;
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-basic.js.map