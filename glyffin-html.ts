/**
 * Created by wehjin on 7/2/15.
 */

import Glyffin = require("./glyffin");
import Spot = Glyffin.Spot;

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

class TouchEvents {

    private ontouchstart;
    private ontouchend;
    private ontouchcancel;
    private ontouchmove;
    private startTime;


    constructor(private element : HTMLElement) {
    }

    public enable(onStart : (spot : Spot)=>boolean, onCancel : ()=>void, onEnd : ()=>void,
                  onMove : (spot : Spot)=>void) {
        var started = false;
        this.element.addEventListener("touchstart", this.ontouchstart = (ev : Event) => {
            ev.stopPropagation();
            ev.preventDefault();
            var touches = (<JsTouchEvent>ev).touches;
            if (touches.length > 1) {
                return;
            }
            if (!onStart(this.getTouchSpot(touches))) {
                return;
            }
            started = true;
            this.startTime = Date.now();
        }, false);
        this.element.addEventListener("touchcancel", this.ontouchcancel = (ev : Event)=> {
            ev.stopPropagation();
            ev.preventDefault();
            if (!started) {
                return;
            }
            started = false;
            onCancel();
        }, false);
        this.element.addEventListener("touchmove", this.ontouchmove = (ev : Event)=> {
            ev.stopPropagation();
            ev.preventDefault();
            if (!started) {
                return;
            }
            var elapsed = Date.now() - this.startTime;
            var touches = (<JsTouchEvent>ev).touches;
            onMove(this.getTouchSpot(touches));
        }, false);
        this.element.addEventListener("touchend", this.ontouchend = (ev : Event)=> {
            ev.stopPropagation();
            ev.preventDefault();
            if (!started) {
                return;
            }
            started = false;
            onEnd();
        }, false);
    }

    public disable() {
        this.element.removeEventListener("touchmove", this.ontouchmove, false);
        this.element.removeEventListener("touchcancel", this.ontouchcancel, false);
        this.element.removeEventListener("touchend", this.ontouchend, false);
        this.ontouchcancel = this.ontouchmove = this.ontouchend = null;
    }

    private getTouchSpot(touches : JsTouchList) : Spot {
        var jsTouch = touches.item(0);
        var canvasX = jsTouch.pageX - this.element.offsetLeft;
        var canvasY = jsTouch.pageY - this.element.offsetTop;
        return new Spot(canvasX, canvasY);
    }
}

export class SpotObservable {

    constructor(private element : HTMLElement) {
    }

    subscribe(spotObserver : SpotObserver) : ()=>void {
        var touchEvents = new TouchEvents(this.element);

        var started : boolean;
        var stop = ()=> {
            this.element.onmouseout = this.element.onmousemove = this.element.onmouseup = null;
            started = false;
        };
        var unsubscribe = () => {
            if (started) {
                stop();
            }
            this.element.onmousedown = null;
            touchEvents.disable();
        };

        touchEvents.enable((spot : Spot) : boolean => {
            stop();
            var isStart = spotObserver.onStart(spot);
            if (isStart) {
                started = true;
            }
            return isStart;
        }, ()=> {
            if (!started) {
                return;
            }
            stop();
            spotObserver.onCancel();
        }, ()=> {
            if (!started) {
                return;
            }
            stop();
            spotObserver.onEnd();
        }, (spot : Spot)=> {
            if (!started) {
                return;
            }
            var carryOn = spotObserver.onMove(spot);
            if (!carryOn) {
                stop();
            }
        });
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
        return unsubscribe;
    }

    private
    getMouseSpot(ev : MouseEvent) : Spot {
        return new Spot(ev.pageX - this.element.offsetLeft, ev.pageY - this.element.offsetTop);
    }

}
