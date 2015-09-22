/**
 * @author  wehjin
 * @since   9/22/15
 */
define(["require", "exports"], function (require, exports) {
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
    var TexelRect = (function () {
        function TexelRect(s, t, u, v) {
            this.s = s;
            this.t = t;
            this.u = u;
            this.v = v;
        }
        return TexelRect;
    })();
    exports.TexelRect = TexelRect;
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
    var PatchPresentation = (function () {
        function PatchPresentation(patch) {
            this.patch = patch;
        }
        PatchPresentation.prototype.end = function () {
            if (this.patch) {
                this.patch.remove();
                this.patch = null;
            }
        };
        return PatchPresentation;
    })();
    exports.PatchPresentation = PatchPresentation;
});
//# sourceMappingURL=glyffin-type.js.map