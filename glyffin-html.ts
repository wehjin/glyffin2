/**
 * Created by wehjin on 7/2/15.
 */

/// <reference path="glyffin-basic.ts" />

module Glyffin {

    interface JsTouch {
        clientX: number;
        clientY: number;
        pageX: number;
        pageY: number;
    }
    interface JsTouchList {
        length: number;
        item(index : number):JsTouch;
    }
    interface JsTouchEvent extends UIEvent {
        touches:JsTouchList;
    }

    export interface SpotObserver {
        onStart(spot : Spot):boolean;
        onMove(spot : Spot):boolean;
        onEnd();
        onCancel();
    }

    export class SpotObservable {

        ontouchmove : (ev : Event)=>void;
        ontouchcancel : (ev : Event)=>void;
        ontouchend : (ev : Event)=>void;

        constructor(private element : HTMLElement) {
        }

        private addTouchListeners(onMove : (ev : Event)=>void, onCancel : (ev : Event)=>void,
                                  onEnd : (ev : Event)=>void) {
            this.element.addEventListener("touchmove", this.ontouchmove = onMove, false);
            this.element.addEventListener("touchcancel", this.ontouchcancel = onCancel, false);
            this.element.addEventListener("touchend", this.ontouchcancel = onEnd, false);
        }

        private removeTouchListeners() {
            this.element.removeEventListener("touchmove", this.ontouchmove, false);
            this.element.removeEventListener("touchcancel", this.ontouchcancel, false);
            this.element.removeEventListener("touchend", this.ontouchend, false);
            this.ontouchcancel = this.ontouchmove = this.ontouchend = null;
        }

        subscribe(spotObserver : SpotObserver) : ()=>void {
            var started : boolean;
            var stop = ()=> {
                this.removeTouchListeners();
                this.element.onmouseout = this.element.onmousemove = this.element.onmouseup = null;
                started = false;
            };
            var ontouchstart : (ev : Event)=>void;
            this.element.addEventListener("touchstart", ontouchstart = (ev : Event) => {
                var touches = (<JsTouchEvent>ev).touches;
                if (touches.length > 1) {
                    if (started) {
                        stop();
                        spotObserver.onCancel();
                    }
                    return;
                }
                if (!spotObserver.onStart(this.getTouchSpot(touches))) {
                    return;
                }
                started = true;
                this.addTouchListeners((ev : Event) => {
                    var carryOn = spotObserver.onMove(this.getTouchSpot((<JsTouchEvent>ev).touches));
                    if (!carryOn) {
                        stop();
                    }
                }, ()=> {
                    stop();
                    spotObserver.onCancel();
                }, ()=> {
                    stop();
                    spotObserver.onEnd();
                });
                ev.stopPropagation();
                ev.preventDefault();
            }, false);
            this.element.onmousedown = (ev : MouseEvent)=> {
                if (!spotObserver.onStart(this.getMouseSpot(ev))) {
                    return;
                }
                started = true;
                this.element.onmousemove = (ev : MouseEvent)=> {
                    var carryOn = spotObserver.onMove(this.getMouseSpot(ev));
                    if (!carryOn) {
                        stop();
                    }
                };
                this.element.onmouseout = ()=> {
                    stop();
                    spotObserver.onCancel();
                };
                this.element.onmouseup = ()=> {
                    stop();
                    spotObserver.onEnd();
                };
                ev.stopPropagation();
                ev.preventDefault();
            };
            return () => {
                if (started) {
                    stop();
                }
                this.element.removeEventListener("touchstart", ontouchstart, false);
                this.element.onmousedown = null;
            }
        }

        private
        getMouseSpot(ev : MouseEvent) : Spot {
            return new Spot(ev.pageX - this.element.offsetLeft, ev.pageY - this.element.offsetTop);
        }

        private
        getTouchSpot(touches : JsTouchList) : Spot {
            var jsTouch = touches.item(0);
            var canvasX = jsTouch.pageX - this.element.offsetLeft;
            var canvasY = jsTouch.pageY - this.element.offsetTop;
            return new Spot(canvasX, canvasY);
        }
    }
}