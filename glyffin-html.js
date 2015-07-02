/**
 * Created by wehjin on 7/2/15.
 */
/// <reference path="glyffin-basic.ts" />
var Glyffin;
(function (Glyffin) {
    var SpotObservable = (function () {
        function SpotObservable(element) {
            this.element = element;
        }
        SpotObservable.prototype.addTouchListeners = function (onMove, onCancel, onEnd) {
            this.element.addEventListener("touchmove", this.ontouchmove = onMove, false);
            this.element.addEventListener("touchcancel", this.ontouchcancel = onCancel, false);
            this.element.addEventListener("touchend", this.ontouchcancel = onEnd, false);
        };
        SpotObservable.prototype.removeTouchListeners = function () {
            this.element.removeEventListener("touchmove", this.ontouchmove, false);
            this.element.removeEventListener("touchcancel", this.ontouchcancel, false);
            this.element.removeEventListener("touchend", this.ontouchend, false);
            this.ontouchcancel = this.ontouchmove = this.ontouchend = null;
        };
        SpotObservable.prototype.subscribe = function (spotObserver) {
            var _this = this;
            var started;
            var stop = function () {
                _this.removeTouchListeners();
                _this.element.onmouseout = _this.element.onmousemove = _this.element.onmouseup = null;
                started = false;
            };
            var ontouchstart;
            this.element.addEventListener("touchstart", ontouchstart = function (ev) {
                var touches = ev.touches;
                if (touches.length > 1) {
                    if (started) {
                        stop();
                        spotObserver.onCancel();
                    }
                    return;
                }
                if (!spotObserver.onStart(_this.getTouchSpot(touches))) {
                    return;
                }
                started = true;
                _this.addTouchListeners(function (ev) {
                    var carryOn = spotObserver.onMove(_this.getTouchSpot(ev.touches));
                    if (!carryOn) {
                        stop();
                    }
                }, function () {
                    stop();
                    spotObserver.onCancel();
                }, function () {
                    stop();
                    spotObserver.onEnd();
                });
                ev.stopPropagation();
                ev.preventDefault();
            }, false);
            this.element.onmousedown = function (ev) {
                if (!spotObserver.onStart(_this.getMouseSpot(ev))) {
                    return;
                }
                started = true;
                _this.element.onmousemove = function (ev) {
                    var carryOn = spotObserver.onMove(_this.getMouseSpot(ev));
                    if (!carryOn) {
                        stop();
                    }
                };
                _this.element.onmouseout = function () {
                    stop();
                    spotObserver.onCancel();
                };
                _this.element.onmouseup = function () {
                    stop();
                    spotObserver.onEnd();
                };
                ev.stopPropagation();
                ev.preventDefault();
            };
            return function () {
                if (started) {
                    stop();
                }
                _this.element.removeEventListener("touchstart", ontouchstart, false);
                _this.element.onmousedown = null;
            };
        };
        SpotObservable.prototype.getMouseSpot = function (ev) {
            return new Glyffin.Spot(ev.pageX - this.element.offsetLeft, ev.pageY - this.element.offsetTop);
        };
        SpotObservable.prototype.getTouchSpot = function (touches) {
            var jsTouch = touches.item(0);
            var canvasX = jsTouch.pageX - this.element.offsetLeft;
            var canvasY = jsTouch.pageY - this.element.offsetTop;
            return new Glyffin.Spot(canvasX, canvasY);
        };
        return SpotObservable;
    })();
    Glyffin.SpotObservable = SpotObservable;
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-html.js.map