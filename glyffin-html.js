/**
 * Created by wehjin on 7/2/15.
 */
/// <reference path="glyffin-basic.ts" />
var Glyffin;
(function (Glyffin) {
    var TouchEvents = (function () {
        function TouchEvents(element) {
            this.element = element;
        }
        TouchEvents.prototype.enable = function (onStart, onCancel, onEnd, onMove) {
            var _this = this;
            var started = false;
            this.element.addEventListener("touchstart", this.ontouchstart = function (ev) {
                ev.stopPropagation();
                ev.preventDefault();
                var touches = ev.touches;
                if (touches.length > 1) {
                    return;
                }
                if (!onStart(_this.getTouchSpot(touches))) {
                    return;
                }
                started = true;
                _this.startTime = Date.now();
            }, false);
            this.element.addEventListener("touchcancel", this.ontouchcancel = function (ev) {
                ev.stopPropagation();
                ev.preventDefault();
                if (!started) {
                    return;
                }
                started = false;
                onCancel();
            }, false);
            this.element.addEventListener("touchmove", this.ontouchmove = function (ev) {
                ev.stopPropagation();
                ev.preventDefault();
                if (!started) {
                    return;
                }
                var elapsed = Date.now() - _this.startTime;
                var touches = ev.touches;
                onMove(_this.getTouchSpot(touches));
            }, false);
            this.element.addEventListener("touchend", this.ontouchend = function (ev) {
                ev.stopPropagation();
                ev.preventDefault();
                if (!started) {
                    return;
                }
                started = false;
                onEnd();
            }, false);
        };
        TouchEvents.prototype.disable = function () {
            this.element.removeEventListener("touchmove", this.ontouchmove, false);
            this.element.removeEventListener("touchcancel", this.ontouchcancel, false);
            this.element.removeEventListener("touchend", this.ontouchend, false);
            this.ontouchcancel = this.ontouchmove = this.ontouchend = null;
        };
        TouchEvents.prototype.getTouchSpot = function (touches) {
            var jsTouch = touches.item(0);
            var canvasX = jsTouch.pageX - this.element.offsetLeft;
            var canvasY = jsTouch.pageY - this.element.offsetTop;
            return new Glyffin.Spot(canvasX, canvasY);
        };
        return TouchEvents;
    })();
    var SpotObservable = (function () {
        function SpotObservable(element) {
            this.element = element;
        }
        SpotObservable.prototype.subscribe = function (spotObserver) {
            var _this = this;
            var touchEvents = new TouchEvents(this.element);
            var started;
            var stop = function () {
                _this.element.onmouseout = _this.element.onmousemove = _this.element.onmouseup = null;
                started = false;
            };
            var unsubscribe = function () {
                if (started) {
                    stop();
                }
                _this.element.onmousedown = null;
                touchEvents.disable();
            };
            touchEvents.enable(function (spot) {
                stop();
                var isStart = spotObserver.onStart(spot);
                if (isStart) {
                    started = true;
                }
                return isStart;
            }, function () {
                if (!started) {
                    return;
                }
                stop();
                spotObserver.onCancel();
            }, function () {
                if (!started) {
                    return;
                }
                stop();
                spotObserver.onEnd();
            }, function (spot) {
                if (!started) {
                    return;
                }
                var carryOn = spotObserver.onMove(spot);
                if (!carryOn) {
                    stop();
                }
            });
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
            return unsubscribe;
        };
        SpotObservable.prototype.getMouseSpot = function (ev) {
            return new Glyffin.Spot(ev.pageX - this.element.offsetLeft, ev.pageY - this.element.offsetTop);
        };
        return SpotObservable;
    })();
    Glyffin.SpotObservable = SpotObservable;
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-html.js.map