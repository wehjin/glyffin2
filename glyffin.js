/**
 * Created by wehjin on 5/24/15.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    /// <reference path="webglbook.d.ts" />
    var Void = (function () {
        function Void() {
        }
        return Void;
    })();
    exports.Void = Void;
    var Inset1 = (function () {
        function Inset1(fraction, fixed) {
            this.fraction = fraction;
            this.fixed = fixed;
        }
        Inset1.prototype.getPixels = function (whole) {
            return this.fraction * whole + this.fixed;
        };
        return Inset1;
    })();
    exports.Inset1 = Inset1;
    var Inset2 = (function () {
        function Inset2(fractionX, fixedX, fractionY, fixedY) {
            this.x = new Inset1(fractionX, fixedX);
            this.y = new Inset1(fractionY, fixedY);
        }
        Inset2.QUARTER = new Inset2(.25, 0, .25, 0);
        Inset2.EIGHTH = new Inset2(.125, 0, .125, 0);
        return Inset2;
    })();
    exports.Inset2 = Inset2;
    var Spot = (function () {
        function Spot(x, y) {
            this.x = x;
            this.y = y;
        }
        Spot.prototype.gridDistance = function (other) {
            return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
        };
        Spot.prototype.xDistance = function (origin) {
            return this.x - origin.x;
        };
        Spot.prototype.yDistance = function (origin) {
            return this.y - origin.y;
        };
        Spot.prototype.addX = function (addition) {
            return new Spot(this.x + addition, this.y);
        };
        Spot.prototype.addY = function (addition) {
            return new Spot(this.x, this.y + addition);
        };
        return Spot;
    })();
    exports.Spot = Spot;
    var Speedometer = (function () {
        function Speedometer(position) {
            this.positions = [null, null, null];
            this.times = [0, 0, 0];
            this.count = 0;
            this.addPosition(position);
        }
        Speedometer.prototype.addPosition = function (position) {
            var count = this.count;
            var positions = this.positions;
            var times = this.times;
            var time = Date.now();
            if (count > 0 && time <= times[count - 1]) {
                count = count - 1;
            }
            if (count >= 3) {
                positions[0] = positions[1];
                times[0] = times[1];
                positions[1] = positions[2];
                times[1] = times[2];
                count = 2;
            }
            positions[count] = position;
            times[count] = time;
            this.count = count + 1;
        };
        Speedometer.prototype.getVelocity = function () {
            switch (this.count) {
                case 3:
                    return this.getVelocity2();
                case 2:
                    return this.getVelocity1();
                default:
                    return 0;
            }
        };
        Speedometer.prototype.getCount = function () {
            return this.count;
        };
        Speedometer.prototype.getVelocity1 = function () {
            var times = this.times;
            var positions = this.positions;
            var duration = times[1] - times[0];
            var distance = positions[1] - positions[0];
            if (duration > maxDuration) {
                // Last mark was fresh move.  We don't have a hard duration so approximate;
                return distance / approximateDuration;
            }
            return distance / duration;
        };
        Speedometer.prototype.getVelocity2 = function () {
            var times = this.times;
            var positions = this.positions;
            var duration2 = times[2] - times[1];
            var distance2 = positions[2] - positions[1];
            if (duration2 > maxDuration) {
                // Last mark was fresh move.  We don't have a hard duration so approximate;
                return distance2 / approximateDuration;
            }
            return (this.getVelocity1() + distance2 / duration2) / 2;
        };
        return Speedometer;
    })();
    exports.Speedometer = Speedometer;
    var Perimeter = (function () {
        function Perimeter(left, top, right, bottom, age, level, tapHeight, readHeight, palette) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
            this.age = age;
            this.level = level;
            this.tapHeight = tapHeight;
            this.readHeight = readHeight;
            this.palette = palette;
        }
        Perimeter.prototype.getHeight = function () {
            return this.bottom - this.top;
        };
        Perimeter.prototype.getWidth = function () {
            return this.right - this.left;
        };
        Perimeter.prototype.getCenterY = function () {
            return this.top + this.getHeight() / 2;
        };
        Perimeter.prototype.at = function (left, top, right, bottom) {
            return new Perimeter(left, top, right, bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.withAge = function (age) {
            return new Perimeter(this.left, this.top, this.right, this.bottom, age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.withLevel = function (level) {
            return new Perimeter(this.left, this.top, this.right, this.bottom, this.age, level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.withHeight = function (pixelsHigh, alignment) {
            var shiftDown = (this.getHeight() - pixelsHigh) * alignment;
            var top = this.top + shiftDown;
            var bottom = top + pixelsHigh;
            return new Perimeter(this.left, top, this.right, bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.addLevel = function (add) {
            return new Perimeter(this.left, this.top, this.right, this.bottom, this.age, this.level + add, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.translateX = function (x) {
            return new Perimeter(this.left + x, this.top, this.right + x, this.bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.translateY = function (y) {
            return new Perimeter(this.left, this.top + y, this.right, this.bottom + y, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.inset = function (pixelsX, pixelsY) {
            return new Perimeter(this.left + pixelsX, this.top + pixelsY, this.right - pixelsX, this.bottom - pixelsY, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.inset2 = function (inset) {
            var pixelsX = inset.x.getPixels(this.getWidth());
            var pixelsY = inset.y.getPixels(this.getHeight());
            return this.inset(pixelsX, pixelsY);
        };
        Perimeter.prototype.downFromTop = function (pixelsY, pixelsHigh) {
            var insetTop = this.top + pixelsY;
            return new Perimeter(this.left, insetTop, this.right, insetTop + pixelsHigh, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.rightFromLeft = function (pixelsX, pixelsWide) {
            var insetLeft = this.left + pixelsX;
            return new Perimeter(insetLeft, this.top, insetLeft + pixelsWide, this.bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.resizeFromTop = function (pixelsHigh) {
            return new Perimeter(this.left, this.top, this.right, this.top + pixelsHigh, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
        };
        Perimeter.prototype.splitHeight = function (pixels) {
            if (pixels >= 0) {
                var split = this.top + pixels;
                return [new Perimeter(this.left, this.top, this.right, split, this.age, this.level, this.tapHeight, this.readHeight, this.palette),
                    new Perimeter(this.left, split, this.right, this.bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette)];
            }
            else {
                var split = this.bottom + pixels;
                return [new Perimeter(this.left, split, this.right, this.bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette),
                    new Perimeter(this.left, this.top, this.right, split, this.age, this.level, this.tapHeight, this.readHeight, this.palette)];
            }
        };
        Perimeter.prototype.splitWidth = function (pixels) {
            if (pixels >= 0) {
                var split = this.left + pixels;
                return [new Perimeter(this.left, this.top, split, this.bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette),
                    new Perimeter(split, this.top, this.right, this.bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette)];
            }
            else {
                var split = this.right + pixels;
                return [new Perimeter(split, this.top, this.right, this.bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette),
                    new Perimeter(this.left, this.top, split, this.bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette)];
            }
        };
        Perimeter.prototype.limitHeight = function (maxHeight, align) {
            var height = this.getHeight();
            return (height <= maxHeight) ? this :
                this.downFromTop((height - maxHeight) * align, maxHeight);
        };
        Perimeter.prototype.limitWidth = function (maxWidth, align) {
            var width = this.getWidth();
            return (width <= maxWidth) ? this :
                this.rightFromLeft((width - maxWidth) * align, maxWidth);
        };
        return Perimeter;
    })();
    exports.Perimeter = Perimeter;
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
        Color.prototype.darken = function (mix) {
            return this.mix(mix, Color.BLACK);
        };
        Color.prototype.lighten = function (mix) {
            return this.mix(mix, Color.WHITE);
        };
        Color.prototype.neutralize = function (mix) {
            return this.mix(mix, Color.GRAY);
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
        Color.GRAY = new Color(.5, .5, .5, 1);
        return Color;
    })();
    exports.Color = Color;
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
    exports.Palette = Palette;
    var Stage = (function () {
        function Stage(perimeter) {
            this.perimeter = perimeter;
        }
        return Stage;
    })();
    exports.Stage = Stage;
    exports.EMPTY_REMOVABLE = {
        remove: function () {
        }
    };
    exports.EMPTY_PATCH = exports.EMPTY_REMOVABLE;
    exports.EMPTY_ACTIVE = exports.EMPTY_REMOVABLE;
    (function (GestureStatus) {
        GestureStatus[GestureStatus["CHARGING"] = 0] = "CHARGING";
        GestureStatus[GestureStatus["CHARGED"] = 1] = "CHARGED";
        GestureStatus[GestureStatus["SUPERCHARGED"] = 2] = "SUPERCHARGED";
        GestureStatus[GestureStatus["DRAINED"] = 3] = "DRAINED";
    })(exports.GestureStatus || (exports.GestureStatus = {}));
    var GestureStatus = exports.GestureStatus;
    exports.EMPTY_PRESENTATION = {
        end: function () {
        }
    };
    var NoResultReaction = (function () {
        function NoResultReaction(reaction) {
            this.reaction = reaction;
        }
        NoResultReaction.prototype.onResult = function (result) {
            // Do nothing.  Send to null.
        };
        NoResultReaction.prototype.onError = function (error) {
            this.reaction.onError(error);
        };
        return NoResultReaction;
    })();
    exports.NoResultReaction = NoResultReaction;
    var maxDuration = 50;
    var approximateDuration = maxDuration / 2;
    var SpeedometerX = (function (_super) {
        __extends(SpeedometerX, _super);
        function SpeedometerX(spot) {
            _super.call(this, spot.x);
        }
        SpeedometerX.prototype.addSpot = function (spot) {
            this.addPosition(spot.x);
        };
        return SpeedometerX;
    })(Speedometer);
    exports.SpeedometerX = SpeedometerX;
    var PagenGesturing = (function () {
        function PagenGesturing(downSpot, minCharging, onStarted, onCanceled, onFinished) {
            this.downSpot = downSpot;
            this.minCharging = minCharging;
            this.onStarted = onStarted;
            this.onCanceled = onCanceled;
            this.onFinished = onFinished;
            this.drained = false;
            this.sliding = 0;
            this.speedometer = new SpeedometerX(downSpot);
        }
        PagenGesturing.prototype.isDrained = function () {
            return this.drained;
        };
        PagenGesturing.prototype.isPowered = function () {
            return !this.drained && (this.sliding != 0);
        };
        PagenGesturing.prototype.move = function (spot) {
            if (this.drained) {
                return GestureStatus.DRAINED;
            }
            this.speedometer.addSpot(spot);
            if (this.sliding == 0) {
                var crossOffset = spot.yDistance(this.downSpot);
                if (Math.abs(crossOffset) > this.minCharging) {
                    this.drained = true;
                    return GestureStatus.DRAINED;
                }
                var grainOffset = spot.xDistance(this.downSpot);
                if (Math.abs(grainOffset) < this.minCharging) {
                    return GestureStatus.CHARGING;
                }
                this.sliding = grainOffset > 0 ? 1 : -1;
            }
            var grainOffset = spot.xDistance(this.downSpot);
            var pixelsMoved;
            if (this.sliding > 0) {
                pixelsMoved = Math.max(0, grainOffset);
            }
            else if (this.sliding < 0) {
                pixelsMoved = Math.min(0, grainOffset);
            }
            else {
                pixelsMoved = grainOffset;
            }
            this.onStarted(pixelsMoved);
            return GestureStatus.SUPERCHARGED;
        };
        PagenGesturing.prototype.release = function () {
            if (this.drained || this.sliding == 0) {
                return;
            }
            this.drained = true;
            this.onFinished(this.speedometer.getVelocity());
        };
        PagenGesturing.prototype.cancel = function () {
            if (this.drained) {
                return;
            }
            this.drained = true;
            if (this.sliding != 0) {
                this.onCanceled();
            }
        };
        return PagenGesturing;
    })();
    exports.PagenGesturing = PagenGesturing;
    var HorizontalGesturing = (function () {
        function HorizontalGesturing(downSpot, chargingSize, chargingDirection, onStarted, onCanceled, onFinished) {
            this.downSpot = downSpot;
            this.chargingSize = chargingSize;
            this.chargingDirection = chargingDirection;
            this.onStarted = onStarted;
            this.onCanceled = onCanceled;
            this.onFinished = onFinished;
            this.drained = false;
        }
        HorizontalGesturing.prototype.isDrained = function () {
            return this.drained;
        };
        HorizontalGesturing.prototype.isPowered = function () {
            return this.startSpot ? true : false;
        };
        HorizontalGesturing.prototype.move = function (spot) {
            if (this.drained) {
                return;
            }
            if (!this.startSpot) {
                var crossOffset = Math.abs(spot.yDistance(this.downSpot));
                if (crossOffset > this.chargingSize) {
                    this.drained = true;
                    return GestureStatus.DRAINED;
                }
                var grainOffset = spot.xDistance(this.downSpot);
                if (Math.abs(grainOffset) < this.chargingSize) {
                    return GestureStatus.CHARGING;
                }
                if ((this.chargingDirection > 0 && grainOffset < 0) ||
                    (this.chargingDirection < 0 && grainOffset > 0)) {
                    return GestureStatus.CHARGING;
                }
                this.direction = grainOffset >= 0 ? 1 : -1;
                this.startSpot = this.downSpot.addX(this.chargingSize * this.direction);
            }
            var grainOffset = spot.xDistance(this.startSpot);
            var pixelsMoved;
            if (this.direction > 0) {
                pixelsMoved = Math.max(0, grainOffset);
            }
            else if (this.direction < 0) {
                pixelsMoved = Math.min(0, grainOffset);
            }
            else {
                pixelsMoved = grainOffset;
            }
            this.onStarted(pixelsMoved);
            return GestureStatus.SUPERCHARGED;
        };
        HorizontalGesturing.prototype.release = function () {
            if (this.drained || !this.startSpot) {
                return;
            }
            this.drained = true;
            this.onFinished();
        };
        HorizontalGesturing.prototype.cancel = function () {
            if (this.drained) {
                return;
            }
            this.drained = true;
            if (this.startSpot) {
                this.onCanceled();
            }
        };
        return HorizontalGesturing;
    })();
    exports.HorizontalGesturing = HorizontalGesturing;
    var VerticalGesturing = (function () {
        function VerticalGesturing(downSpot, threshold, direction, onStarted, onCanceled, onFinished) {
            this.downSpot = downSpot;
            this.threshold = threshold;
            this.direction = direction;
            this.onStarted = onStarted;
            this.onCanceled = onCanceled;
            this.onFinished = onFinished;
            this.drained = false;
        }
        VerticalGesturing.prototype.isDrained = function () {
            return this.drained;
        };
        VerticalGesturing.prototype.isPowered = function () {
            return this.startSpot ? true : false;
        };
        VerticalGesturing.prototype.move = function (spot) {
            if (this.drained) {
                return;
            }
            if (!this.startSpot) {
                var crossOffset = Math.abs(spot.xDistance(this.downSpot));
                if (crossOffset > Math.abs(this.threshold)) {
                    this.drained = true;
                    return GestureStatus.DRAINED;
                }
                var grainOffset = spot.yDistance(this.downSpot);
                if (Math.abs(grainOffset) < Math.abs(this.threshold)) {
                    return GestureStatus.CHARGING;
                }
                if (this.direction > 0 && grainOffset < 0
                    || this.direction < 0 && grainOffset > 0) {
                    return GestureStatus.CHARGING;
                }
                this.startSpot = this.downSpot.addY(this.threshold *
                    (grainOffset == 0 ? 0 : grainOffset / Math.abs(grainOffset)));
            }
            var grainOffset = spot.yDistance(this.startSpot);
            var pixelsMoved;
            if (this.direction > 0) {
                pixelsMoved = Math.max(0, grainOffset);
            }
            else if (this.direction < 0) {
                pixelsMoved = Math.min(0, grainOffset);
            }
            else {
                pixelsMoved = grainOffset;
            }
            if (this.speedometer) {
                this.speedometer.addPosition(spot.y);
            }
            else {
                this.speedometer = new Speedometer(spot.y);
            }
            this.onStarted(pixelsMoved);
            return GestureStatus.SUPERCHARGED;
        };
        VerticalGesturing.prototype.release = function () {
            if (this.drained || !this.startSpot) {
                return;
            }
            this.drained = true;
            this.onFinished(this.speedometer ? this.speedometer.getVelocity() : 0);
        };
        VerticalGesturing.prototype.cancel = function () {
            if (this.drained) {
                return;
            }
            this.drained = true;
            if (this.startSpot) {
                this.onCanceled();
            }
        };
        return VerticalGesturing;
    })();
    exports.VerticalGesturing = VerticalGesturing;
    var Insertion = (function () {
        function Insertion(amount, glyff) {
            this.amount = amount;
            this.glyff = glyff;
        }
        return Insertion;
    })();
    exports.Insertion = Insertion;
    var ClickGesturing = (function () {
        function ClickGesturing(startSpot, threshold, onPress, onUnpress, onClick) {
            var _this = this;
            this.startSpot = startSpot;
            this.threshold = threshold;
            this.onPress = onPress;
            this.onUnpress = onUnpress;
            this.onClick = onClick;
            this.isEnded = false;
            this.pressTime = 0;
            this.willPress = 0;
            this.willPress = setTimeout(function () {
                _this.doPress();
            }, 200);
        }
        ClickGesturing.prototype.clearWillPress = function () {
            if (this.willPress) {
                clearTimeout(this.willPress);
                this.willPress = 0;
            }
        };
        ClickGesturing.prototype.doPress = function () {
            if (this.isEnded) {
                return;
            }
            this.clearWillPress();
            this.pressTime = Date.now();
            this.onPress();
        };
        ClickGesturing.prototype.doEnd = function () {
            this.isEnded = true;
            this.clearWillPress();
            if (this.pressTime) {
                this.onUnpress();
            }
        };
        ClickGesturing.prototype.isDrained = function () {
            return this.isEnded;
        };
        ClickGesturing.prototype.isPowered = function () {
            return !this.isEnded;
        };
        ClickGesturing.prototype.release = function () {
            var _this = this;
            if (this.isEnded) {
                return;
            }
            if (this.pressTime == 0) {
                this.doPress();
                // Let the press appear on screen before unpressing and clicking.
                window.requestAnimationFrame(function () {
                    _this.doEnd();
                    _this.onClick();
                });
                return;
            }
            this.doEnd();
            this.onClick();
        };
        ClickGesturing.prototype.move = function (spot) {
            if (this.isEnded) {
                return GestureStatus.DRAINED;
            }
            if (spot.gridDistance(this.startSpot) > this.threshold) {
                this.doEnd();
                return GestureStatus.DRAINED;
            }
            return GestureStatus.CHARGED;
        };
        ClickGesturing.prototype.cancel = function () {
            if (this.isEnded) {
                return;
            }
            this.doEnd();
        };
        return ClickGesturing;
    })();
    var ClickGesturable = (function () {
        function ClickGesturable(threshold, press, unpress, click) {
            this.threshold = threshold;
            this.press = press;
            this.unpress = unpress;
            this.click = click;
        }
        ClickGesturable.prototype.init = function (spot) {
            return new ClickGesturing(spot, this.threshold, this.press, this.unpress, this.click);
        };
        return ClickGesturable;
    })();
    var LinearAnimationPath = (function () {
        function LinearAnimationPath(duration, reverse) {
            this.duration = duration;
            this.reverse = reverse;
        }
        LinearAnimationPath.prototype.start = function (now) {
            this.startTime = now;
            this.endTime = this.startTime + this.duration;
        };
        LinearAnimationPath.prototype.getAge = function (now) {
            if (now >= this.endTime) {
                return this.reverse ? 0 : 1;
            }
            if (now <= this.startTime) {
                return this.reverse ? 1 : 0;
            }
            var age = (now - this.startTime) / this.duration;
            return this.reverse ? (1 - age) : age;
        };
        LinearAnimationPath.prototype.hasMore = function (now) {
            return now < this.endTime;
        };
        return LinearAnimationPath;
    })();
    var CycleAnimationPath = (function () {
        function CycleAnimationPath(duration, count) {
            this.duration = duration;
            this.reversed = false;
            this.innerPath = new LinearAnimationPath(duration, this.reversed);
            this.lives = count * 2 - 1;
        }
        CycleAnimationPath.prototype.start = function (now) {
            this.started = true;
            this.innerPath.start(now);
        };
        CycleAnimationPath.prototype.getAge = function (now) {
            return this.innerPath.getAge(now);
        };
        CycleAnimationPath.prototype.hasMore = function (now) {
            var hasMore = this.innerPath.hasMore(now);
            if (!hasMore) {
                if (this.started && this.lives > 0) {
                    this.lives--;
                    this.reversed = !this.reversed;
                    this.innerPath = new LinearAnimationPath(this.duration, this.reversed);
                    this.innerPath.start(now);
                    hasMore = this.innerPath.hasMore(now);
                }
            }
            return hasMore;
        };
        return CycleAnimationPath;
    })();
    var BasePresenter = (function () {
        function BasePresenter(perimeter, audience, reactionOrOnResult, onError) {
            this.presentations = [];
            this.ended = false;
            this.perimeter = perimeter;
            this.audience = audience;
            this.reactionOrOnResult = reactionOrOnResult;
            this._onError = onError;
        }
        BasePresenter.prototype.addPresentation = function (presentation) {
            var _this = this;
            if (this.ended) {
                throw "addPresentation called after end";
            }
            var index = this.presentations.length;
            this.presentations.push(presentation);
            return {
                remove: function () {
                    var presentation = _this.presentations[index];
                    if (presentation) {
                        _this.presentations[index] = null;
                        presentation.end();
                    }
                }
            };
        };
        BasePresenter.prototype.onResult = function (result) {
            if (typeof this.reactionOrOnResult === 'object') {
                this.reactionOrOnResult.onResult(result);
            }
            else if (typeof this.reactionOrOnResult === 'function') {
                this.reactionOrOnResult(result);
            }
        };
        BasePresenter.prototype.onError = function (error) {
            if (typeof this.reactionOrOnResult === 'object') {
                this.reactionOrOnResult.onError(error);
            }
            else if (this.onError) {
                this.onError(error);
            }
        };
        BasePresenter.prototype.isEnded = function () {
            return this.ended;
        };
        BasePresenter.prototype.end = function () {
            if (this.ended) {
                return;
            }
            this.ended = true;
            for (var i = 0; i < this.presentations.length; i++) {
                var presentation = this.presentations[i];
                if (presentation) {
                    this.presentations[i] = null;
                    presentation.end();
                }
            }
        };
        return BasePresenter;
    })();
    function getMaxDepth(glyffs) {
        var depth = 0;
        for (var i = 0; i < glyffs.length; i++) {
            depth = Math.max(depth, glyffs[i].depth);
        }
        return depth;
    }
    function listStatic(cellGlyffs, centerPerimeter, dividerPixelsHigh, scrollPixels, visibleShiftRange) {
        if (cellGlyffs.length === 0) {
            return exports.ClearGlyff;
        }
        if (cellGlyffs.length === 1) {
            var cellGlyff = cellGlyffs[0];
            return Glyff.create(function (lower) {
                lower.addPresentation(cellGlyff.present(centerPerimeter, lower.audience, lower));
            }, cellGlyff.depth);
        }
        return Glyff.create(function (lower) {
            var cellCount = cellGlyffs.length;
            var cellPixelsHigh = centerPerimeter.getHeight();
            var cellAndDividerPixelsHigh = cellPixelsHigh + dividerPixelsHigh;
            var minVisibleShift = visibleShiftRange[0];
            var maxVisibleShift = visibleShiftRange[1];
            for (var i = 0; i < cellCount; i++) {
                var cellGlyff = cellGlyffs[i];
                var cellShift = i * cellAndDividerPixelsHigh - scrollPixels;
                if (cellShift < minVisibleShift) {
                    continue;
                }
                if (cellShift >= maxVisibleShift) {
                    break;
                }
                var cellPerimeter = centerPerimeter.translateY(cellShift);
                lower.addPresentation(cellGlyff.present(cellPerimeter, lower.audience, lower));
            }
        }, getMaxDepth(cellGlyffs));
    }
    function makeVerticalList(cellGlyffs, cellHeight) {
        var dividerPixelsHigh = 10;
        return Glyff.create(function (lower) {
            var listPerimeter = lower.perimeter;
            var listPixelsHigh = listPerimeter.getHeight();
            var cellPixelsHigh = cellHeight.getPixels(listPixelsHigh);
            var centerPerimeter = listPerimeter.withHeight(cellPixelsHigh, .5);
            var maxVisibleShift = (listPixelsHigh + cellPixelsHigh) / 2;
            var minVisibleShift = -maxVisibleShift;
            var visibleShiftRange = [minVisibleShift, maxVisibleShift];
            var staticRemovable = exports.EMPTY_REMOVABLE;
            var maxScrollUpAt0 = (cellPixelsHigh + dividerPixelsHigh) * (cellGlyffs.length - 1);
            var maxScrollDownAt0 = 0;
            var currentScrollUp = 0;
            var extraScrollUp = 0;
            var maxScrollUp = maxScrollUpAt0;
            var maxScrollDown = maxScrollDownAt0;
            var currentScrollUpVelocity = 0;
            function presentView() {
                var scrollPixels = currentScrollUp + extraScrollUp;
                var view = listStatic(cellGlyffs, centerPerimeter, dividerPixelsHigh, scrollPixels, visibleShiftRange);
                staticRemovable.remove();
                staticRemovable =
                    lower.addPresentation(view.present(listPerimeter, lower.audience, lower));
                console.log("Velocity:" + currentScrollUpVelocity);
            }
            presentView();
            var zone = lower.audience.addZone(listPerimeter, {
                init: function (spot) {
                    currentScrollUpVelocity = 0;
                    presentView();
                    return new VerticalGesturing(spot, listPerimeter.readHeight, 0, function (pixelsMoved) {
                        // Started
                        var rawExtraUp = -pixelsMoved;
                        extraScrollUp = Math.min(maxScrollUp, Math.max(-maxScrollDown, rawExtraUp));
                        presentView();
                    }, function () {
                        // Cancelled
                        extraScrollUp = 0;
                        presentView();
                    }, function (velocity) {
                        // Completed
                        currentScrollUp = currentScrollUp + extraScrollUp;
                        extraScrollUp = 0;
                        maxScrollUp = maxScrollUpAt0 - currentScrollUp;
                        maxScrollDown = maxScrollDownAt0 + currentScrollUp;
                        currentScrollUpVelocity = -velocity;
                        presentView();
                    });
                }
            });
            lower.addPresentation({
                end: function () {
                    zone.remove();
                }
            });
        }, getMaxDepth(cellGlyffs));
    }
    exports.makeVerticalList = makeVerticalList;
    var Glyff = (function () {
        function Glyff(onPresent) {
            this.onPresent = onPresent;
            this.depth = 0;
        }
        Glyff.create = function (onPresent, depth) {
            var glyff = new Glyff(onPresent);
            glyff.depth = depth || 0;
            return glyff;
        };
        Glyff.prototype.present = function (perimeter, audience, reactionOrOnResult, onError) {
            var presenter = new BasePresenter(perimeter, audience, reactionOrOnResult, onError);
            this.onPresent(presenter);
            return presenter;
        };
        Glyff.prototype.lift = function (lifter, depth) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var lifted = lifter(presenter);
                presenter.addPresentation(_this.present(lifted.perimeter, lifted.audience, lifted));
            }, depth || 0);
        };
        Glyff.prototype.rebuild = function (builder) {
            return builder(this);
        };
        Glyff.prototype.disappear = function (disappeared) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = disappeared ? {
                    addPatch: function (bounds, color) {
                        return exports.EMPTY_REMOVABLE;
                    },
                    addZone: function (bounds, touchProvider) {
                        return presenter.audience.addZone(bounds, touchProvider);
                    },
                    present: function (glyff, reactionOrOnResult, onError) {
                        return presenter.audience.present(glyff, reactionOrOnResult, onError);
                    }
                } : presenter.audience;
                presenter.addPresentation(_this.present(presenter.perimeter, audience, presenter));
            }, this.depth);
        };
        Glyff.prototype.isolate = function (isolated) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = isolated ? {
                    addPatch: function (bounds, color) {
                        return presenter.audience.addPatch(bounds, color);
                    },
                    addZone: function (bounds, touchProvider) {
                        return exports.EMPTY_REMOVABLE;
                    },
                    present: function (glyff, reactionOrOnResult, onError) {
                        return presenter.audience.present(glyff, reactionOrOnResult, onError);
                    }
                } : presenter.audience;
                presenter.addPresentation(_this.present(presenter.perimeter, audience, presenter));
            }, this.depth);
        };
        Glyff.prototype.addLefts = function (insertions) {
            var current = this;
            var todo = insertions.slice();
            while (todo.length > 0) {
                var insertion = todo.pop();
                current = current.splitWidthCombine(insertion.amount, insertion.glyff);
            }
            return current;
        };
        Glyff.prototype.splitWidthCombine = function (size, glyff) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitWidth(size);
                presenter.addPresentation(glyff.present(split[0], audience, presenter));
                presenter.addPresentation(_this.present(split[1], audience, presenter));
            }, Math.max(this.depth, glyff.depth));
        };
        Glyff.prototype.splitHeight = function (size, topGlyff) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(split[0], audience, presenter));
                presenter.addPresentation(_this.present(split[1], audience, presenter));
            }, Math.max(this.depth, topGlyff.depth));
        };
        Glyff.prototype.splitHeightYield = function (size, topGlyff) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(split[0], audience, presenter));
                presenter.addPresentation(_this.present(split[1], audience, new NoResultReaction(presenter)));
            }, Math.max(this.depth, topGlyff.depth));
        };
        Glyff.prototype.splitHeightRetain = function (size, addGlyff) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(addGlyff.present(split[0], audience, new NoResultReaction(presenter)));
                presenter.addPresentation(_this.present(split[1], audience, presenter));
            }, Math.max(this.depth, addGlyff.depth));
        };
        Glyff.prototype.over = function (farGlyph, dz) {
            var nearGlyff = this;
            var gapToNear = farGlyph.depth + (1 + (dz ? dz : 0));
            function onPresent(presenter) {
                var audience = presenter.audience;
                var farPerimeter = presenter.perimeter;
                var nearPerimeter = farPerimeter.withLevel(farPerimeter.level + gapToNear);
                presenter.addPresentation(farGlyph.present(farPerimeter, audience, presenter));
                presenter.addPresentation(nearGlyff.present(nearPerimeter, audience, presenter));
            }
            return Glyff.create(onPresent, gapToNear + nearGlyff.depth);
        };
        Glyff.prototype.addNearMajor = function (level, nearGlyff) {
            var farGlyff = this;
            var gapToNear = farGlyff.depth + level;
            function onPresent(presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                presenter.addPresentation(farGlyff.present(perimeter, audience, new NoResultReaction(presenter)));
                var nearPerimeter = perimeter.addLevel(gapToNear);
                presenter.addPresentation(nearGlyff.present(nearPerimeter, audience, presenter));
            }
            return Glyff.create(onPresent, gapToNear + nearGlyff.depth);
        };
        Glyff.prototype.revealDown = function (inset, revelation, startDown) {
            var _this = this;
            var gapToCover = revelation.depth + 1;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var perimeterHeight = perimeter.getHeight();
                var maxRevelationHeight = inset.getPixels(perimeterHeight);
                var revelationPerimeter = perimeter.resizeFromTop(maxRevelationHeight);
                var revelationHeight;
                var unpresent = null;
                var cover = _this;
                function setRevelationHeight(height) {
                    revelationHeight = Math.max(0, Math.min(height, maxRevelationHeight));
                    var coverPerimeter = perimeter.downFromTop(revelationHeight, perimeterHeight)
                        .addLevel(gapToCover);
                    if (unpresent) {
                        unpresent();
                    }
                    var revelationRemovable = presenter.addPresentation(revelation
                        .isolate(revelationHeight < maxRevelationHeight)
                        .disappear(revelationHeight <= 0)
                        .present(revelationPerimeter, audience, presenter));
                    var coverRemovable = presenter.addPresentation(cover
                        .present(coverPerimeter, audience, presenter));
                    unpresent = function () {
                        coverRemovable.remove();
                        revelationRemovable.remove();
                    };
                }
                var anchorHeight;
                var zone;
                var zonePerimeter = perimeter.addLevel(gapToCover);
                function setAnchorHeight(height) {
                    if (zone) {
                        zone.remove();
                    }
                    setRevelationHeight(height);
                    anchorHeight = height;
                    zone = audience.addZone(zonePerimeter, {
                        init: function (spot) {
                            return new VerticalGesturing(spot, perimeter.tapHeight / 2, anchorHeight <= 0 ? 1 : -1, function (moved) {
                                setRevelationHeight(anchorHeight + moved);
                            }, function () {
                                setRevelationHeight(anchorHeight);
                            }, function () {
                                var target = anchorHeight <= 0 ? maxRevelationHeight : 0;
                                var distanceFromTarget = Math.abs(revelationHeight - target);
                                if (distanceFromTarget < maxRevelationHeight / 2) {
                                    setAnchorHeight(target);
                                    presenter.onResult(target === 0 ? "close" : "open");
                                }
                                else {
                                    setRevelationHeight(anchorHeight);
                                }
                            });
                        }
                    });
                }
                setAnchorHeight(startDown ? maxRevelationHeight : 0);
                presenter.addPresentation({
                    end: function () {
                        if (zone) {
                            zone.remove();
                        }
                    }
                });
            }, gapToCover + this.depth);
        };
        Glyff.prototype.limitWidth = function (maxWidth, align) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var width = perimeter.getWidth();
                if (width <= maxWidth) {
                    presenter.addPresentation(_this.present(perimeter, audience, presenter));
                }
                else {
                    var narrowPerimeter = perimeter.limitWidth(maxWidth, align);
                    presenter.addPresentation(_this.present(narrowPerimeter, audience, presenter));
                }
            }, this.depth);
        };
        Glyff.prototype.limitHeight = function (maxHeight, align) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var height = perimeter.getHeight();
                if (height <= maxHeight) {
                    presenter.addPresentation(_this.present(perimeter, audience, presenter));
                }
                else {
                    var shortPerimeter = perimeter.limitHeight(maxHeight, align);
                    presenter.addPresentation(_this.present(shortPerimeter, audience, presenter));
                }
            }, this.depth);
        };
        Glyff.prototype.kaleid = function (columns, rows, spots) {
            var upperGlyff = this;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var rowHeight = perimeter.getHeight() / rows;
                var colWidth = perimeter.getWidth() / columns;
                for (var i = 0, count = spots.length; i < count; i++) {
                    var spot = spots[i];
                    var left = perimeter.left + colWidth * spot[0];
                    var top = perimeter.top + rowHeight * spot[1];
                    var spotPerimeter = perimeter.at(left, top, left + colWidth, top + rowHeight);
                    new Perimeter(left, top, left + colWidth, top + rowHeight, perimeter.age, perimeter.level, perimeter.tapHeight, perimeter.readHeight, perimeter.palette);
                    presenter.addPresentation(upperGlyff.present(spotPerimeter, audience, presenter));
                }
            }, this.depth);
        };
        // TODO: Think about removing
        Glyff.prototype.pad = function (xPixels, yPixels) {
            return this.pad2(new Inset2(0, xPixels, 0, yPixels));
        };
        Glyff.prototype.pad2 = function (inset) {
            return this.lift(function (lowerPresenter) {
                var perimeter = lowerPresenter.perimeter;
                var insetPerimeter = perimeter.inset2(inset);
                return {
                    perimeter: insetPerimeter,
                    audience: lowerPresenter.audience,
                    addPresentation: function (presentation) {
                        return lowerPresenter.addPresentation(presentation);
                    },
                    onResult: function (result) {
                        lowerPresenter.onResult(result);
                    },
                    onError: function (err) {
                        lowerPresenter.onError(err);
                    },
                    isEnded: function () {
                        return lowerPresenter.isEnded();
                    },
                    end: function () {
                        lowerPresenter.end();
                    }
                };
            }, this.depth);
        };
        Glyff.prototype.moveX = function (x) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var perimeter = presenter.perimeter.translateX(x);
                presenter.addPresentation(_this.present(perimeter, audience, presenter));
            }, this.depth);
        };
        Glyff.prototype.moveY = function (y) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var perimeter = presenter.perimeter.translateY(y);
                presenter.addPresentation(_this.present(perimeter, audience, presenter));
            }, this.depth);
        };
        Glyff.prototype.clicken = function (symbol, pressed) {
            var unpressed = this;
            // No need to add pressed.depth.  The two are never draw at the same time.
            var gapToUnpressed = pressed ? 4 : 0;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var pressedPerimeter = presenter.perimeter;
                var unpressedPerimeter = pressedPerimeter.addLevel(gapToUnpressed);
                var removable = presenter.addPresentation(unpressed.present(unpressedPerimeter, audience));
                var zone = audience.addZone(unpressedPerimeter, new ClickGesturable(unpressedPerimeter.tapHeight / 2, function () {
                    if (!pressed || presenter.isEnded()) {
                        return;
                    }
                    removable.remove();
                    removable = presenter.addPresentation(pressed.present(pressedPerimeter, audience));
                }, function () {
                    if (!pressed || presenter.isEnded()) {
                        return;
                    }
                    removable.remove();
                    removable = presenter.addPresentation(unpressed.present(unpressedPerimeter, audience));
                }, function () {
                    if (presenter.isEnded()) {
                        return;
                    }
                    presenter.onResult(symbol);
                }));
                presenter.addPresentation({
                    end: function () {
                        zone.remove();
                    }
                });
            }, gapToUnpressed + unpressed.depth);
        };
        Glyff.prototype.stackNearLeft = function (far, nearLeft) {
            return Operator.stacken(this, false, far, nearLeft);
        };
        Glyff.prototype.stackNearRight = function (far, nearRight) {
            return Operator.stacken(this, true, far, nearRight);
        };
        Glyff.prototype.animateWithPath = function (path) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                path.start(Date.now());
                var presentation;
                var frame;
                var present = function () {
                    var now = Date.now();
                    var agedPerimeter = perimeter.withAge(path.getAge(now));
                    presentation = _this.present(agedPerimeter, audience, presenter);
                    if (path.hasMore(now)) {
                        frame = requestAnimationFrame(function () {
                            presentation.end();
                            present();
                        });
                    }
                };
                present();
                presenter.addPresentation({
                    end: function () {
                        if (frame) {
                            cancelAnimationFrame(frame);
                        }
                        presentation.end();
                    }
                });
            }, this.depth);
        };
        Glyff.prototype.animate = function (duration) {
            return this.animateWithPath(new LinearAnimationPath(duration, true));
        };
        Glyff.prototype.pulseAnimate = function (duration, count) {
            return this.animateWithPath(new CycleAnimationPath(duration, count));
        };
        Glyff.color = function (color) {
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var patch = audience.addPatch(presenter.perimeter, color);
                presenter.addPresentation({
                    end: function () {
                        patch.remove();
                    }
                });
            }, 0);
        };
        Glyff.colorAnimation = function (first, last) {
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var colorGlyff = Glyff.color(first.mix(perimeter.age, last));
                presenter.addPresentation(colorGlyff.present(perimeter, audience, presenter));
            }, 0);
        };
        Glyff.divideWidth = function (glyffs, inset, gapGlyff) {
            var depth = gapGlyff ? gapGlyff.depth : 0;
            for (var i = 0; i < glyffs.length; i++) {
                var glyff = glyffs[i];
                depth = Math.max(depth, glyff.depth);
            }
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var perimeter = presenter.perimeter;
                var gapReaction = (gapGlyff ? new NoResultReaction(presenter) : null);
                var sectionWidth = perimeter.getWidth() / glyffs.length;
                var gapWidth = (inset ? inset.getPixels(sectionWidth) : 0);
                var glyffWidth = sectionWidth - gapWidth + gapWidth / glyffs.length;
                var stride = glyffWidth + gapWidth;
                var left = perimeter.left, top = perimeter.top, bottom = perimeter.bottom;
                for (var i = 0; i < glyffs.length; i++) {
                    var glyff = glyffs[i];
                    var right = left + glyffWidth;
                    var glyffPerimeter = perimeter.at(left, top, right, bottom);
                    presenter.addPresentation(glyff.present(glyffPerimeter, audience, presenter));
                    if ((i + 1) < glyffs.length && gapGlyff) {
                        var gapPerimeter = perimeter.at(right, top, right + gapWidth, bottom);
                        presenter.addPresentation(gapGlyff.present(gapPerimeter, audience, gapReaction));
                    }
                    left += stride;
                }
            }, depth);
        };
        Glyff.divideHeight = function (glyffs, inset, gapGlyff) {
            var depth = gapGlyff ? gapGlyff.depth : 0;
            for (var i = 0; i < glyffs.length; i++) {
                var glyff = glyffs[i];
                depth = Math.max(depth, glyff.depth);
            }
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var perimeter = presenter.perimeter;
                var gapReaction = (gapGlyff ? new NoResultReaction(presenter) : null);
                var sectionHeight = perimeter.getHeight() / glyffs.length;
                var gapHeight = (inset ? inset.getPixels(sectionHeight) : 0);
                var glyffHeight = sectionHeight - gapHeight + gapHeight / glyffs.length;
                var stride = glyffHeight + gapHeight;
                var left = perimeter.left, right = perimeter.right, top = perimeter.top;
                for (var i = 0; i < glyffs.length; i++) {
                    var glyff = glyffs[i];
                    var bottom = top + glyffHeight;
                    var glyffPerimeter = perimeter.at(left, top, right, bottom);
                    presenter.addPresentation(glyff.present(glyffPerimeter, audience, presenter));
                    if ((i + 1) < glyffs.length && gapGlyff) {
                        var gapPerimeter = perimeter.at(left, bottom, right, bottom + gapHeight);
                        presenter.addPresentation(gapGlyff.present(gapPerimeter, audience, gapReaction));
                    }
                    top += stride;
                }
            }, depth);
        };
        Glyff.verticalList = function (cellGlyffs, cellHeight) {
            return makeVerticalList(cellGlyffs, cellHeight);
        };
        return Glyff;
    })();
    exports.Glyff = Glyff;
    exports.ClearGlyff = Glyff.create(function () {
    }, 0);
    function colorPath(colorPath, mix, colorPath2) {
        return Glyff.create(function (presenter) {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var color = perimeter.palette.get(colorPath);
            if (mix) {
                color = color.mix(mix, perimeter.palette.get(colorPath2));
            }
            var colorGlyff = Glyff.color(color);
            presenter.addPresentation(colorGlyff.present(perimeter, audience, null, null));
        }, 0);
    }
    exports.colorPath = colorPath;
    exports.RedGlyff = Glyff.color(Color.RED);
    exports.YellowGlyff = Glyff.color(Color.YELLOW);
    exports.GreenGlyff = Glyff.color(Color.GREEN);
    exports.CyanGlyff = Glyff.color(Color.CYAN);
    exports.BlueGlyff = Glyff.color(Color.BLUE);
    exports.MagentaGlyff = Glyff.color(Color.MAGENTA);
    exports.WhiteGlyff = Glyff.color(Color.WHITE);
    exports.BlackGlyff = Glyff.color(Color.BLACK);
    exports.GrayGlyff = Glyff.color(Color.GRAY);
    exports.BeigeGlyff = Glyff.color(Color.BEIGE);
    var Operator;
    (function (Operator) {
        function stacken(center, slideRight, far, near) {
            var gapToCenter = (far ? far.depth + 1 : 0);
            var gapToNear = gapToCenter + center.depth + 1;
            var newDepth = gapToNear + (near ? near.depth : 0);
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var farPerimeter = perimeter;
                var centerPerimeter = perimeter.addLevel(gapToCenter);
                var nearPerimeter = perimeter.addLevel(gapToNear);
                var noResultReaction = new NoResultReaction(presenter);
                var slideRange = perimeter.right;
                var directionFactor = (slideRight ? 1 : -1);
                var maxSlide = directionFactor * slideRange;
                var centerAdded;
                var farAdded;
                var nearAdded;
                function showFar(show) {
                    if (show && !farAdded && far) {
                        farAdded = presenter.addPresentation(far.present(farPerimeter, audience, noResultReaction));
                    }
                    else if (!show && farAdded) {
                        farAdded.remove();
                        farAdded = null;
                    }
                }
                function setCenter(glyff) {
                    if (centerAdded) {
                        centerAdded.remove();
                    }
                    centerAdded =
                        presenter.addPresentation(glyff.present(centerPerimeter, audience, presenter));
                }
                function setNear(glyff) {
                    if (nearAdded) {
                        nearAdded.remove();
                    }
                    if (glyff) {
                        nearAdded = presenter.addPresentation(glyff.present(nearPerimeter, audience, noResultReaction));
                    }
                }
                var centerSlide;
                var nearSlide;
                function setCenterSlide(newSlide) {
                    if (newSlide !== centerSlide) {
                        centerSlide = newSlide;
                        setCenter(newSlide === 0 ? center : center.moveX(newSlide));
                    }
                }
                function setNearSlide(newSlide) {
                    if (slideRight) {
                        newSlide = Math.min(newSlide, maxSlide);
                        newSlide = Math.max(newSlide, 0);
                    }
                    else {
                        newSlide = Math.max(newSlide, maxSlide);
                        newSlide = Math.min(newSlide, 0);
                    }
                    if (newSlide !== nearSlide) {
                        nearSlide = newSlide;
                        var offStage = slideRight ?
                            (newSlide >= slideRange) : (newSlide <= -slideRange);
                        setNear((offStage || !near) ? null : near.moveX(newSlide));
                    }
                }
                var triggerAge = (perimeter.tapHeight * 1.5) / slideRange;
                var age = 0.0;
                function setAge(newAge) {
                    showFar(newAge > 0);
                    setCenterSlide(newAge <= 0 ? 0 : newAge * maxSlide);
                    setNearSlide(newAge >= 0 ? maxSlide : (newAge + 1) * maxSlide);
                    age = newAge;
                }
                var stopAnimation;
                function animateAge(newAge, ageVelocity, onEnd) {
                    if (stopAnimation) {
                        stopAnimation();
                    }
                    var startAge = age;
                    var ageRange = newAge - startAge;
                    var startTime = Date.now();
                    var duration = 200;
                    if (ageVelocity * ageRange > 0) {
                        // Velocity and range are in same direction and both non-zero.
                        // Continue to see if we should shorten the duration.
                        var minVelocity = ageRange / duration;
                        if (ageVelocity / minVelocity > 1) {
                            // Moving faster than minimum.  Get new duration.
                            duration = ageRange / ageVelocity;
                        }
                    }
                    var frame;
                    stopAnimation = function () {
                        if (frame) {
                            window.cancelAnimationFrame(frame);
                            frame = 0;
                        }
                        stopAnimation = null;
                    };
                    function animate() {
                        if (age == newAge) {
                            stopAnimation = null;
                            setTimeout(function () {
                                if (onEnd) {
                                    onEnd();
                                }
                            }, 1);
                            return;
                        }
                        frame = window.requestAnimationFrame(function () {
                            frame = 0;
                            var elapsed = (Date.now() - startTime);
                            var progress = (elapsed / duration) + .001; // Bias ensures we get there
                            setAge(elapsed >= duration ? newAge : startAge + ageRange * progress);
                            animate();
                        });
                    }
                    // Animate only after initializing stopAnimation so that animate can set
                    // it to null if needed.
                    animate();
                }
                setAge(0);
                var zone = audience.addZone(perimeter, {
                    init: function (startSpot) {
                        if (stopAnimation) {
                            return null;
                        }
                        var moveFrame;
                        var targetAge = age;
                        return new PagenGesturing(startSpot, perimeter.tapHeight * .75, function (pixelsMoved) {
                            var boost = 1.2;
                            targetAge = pixelsMoved / maxSlide * boost;
                            if ((targetAge < 0 && !near) || (targetAge > 0 && !far)) {
                                targetAge = 0;
                            }
                            if (!moveFrame) {
                                moveFrame = setTimeout(function () {
                                    if (!moveFrame) {
                                        return;
                                    }
                                    moveFrame = 0;
                                    setAge(targetAge);
                                }, 3);
                            }
                        }, function () {
                            moveFrame = 0;
                            setAge(0);
                        }, function (velocity) {
                            moveFrame = 0;
                            var ageVelocity = velocity / maxSlide;
                            if (Math.abs(targetAge) < triggerAge) {
                                animateAge(0, ageVelocity, null);
                            }
                            else if (targetAge > 0) {
                                animateAge(1, ageVelocity, function () {
                                    presenter.onResult("next");
                                });
                            }
                            else {
                                animateAge(-1, ageVelocity, function () {
                                    presenter.onResult("back");
                                });
                            }
                        });
                    }
                });
                presenter.addPresentation({
                    end: function () {
                        zone.remove();
                    }
                });
            }, newDepth);
        }
        Operator.stacken = stacken;
    })(Operator || (Operator = {}));
});
//# sourceMappingURL=glyffin.js.map