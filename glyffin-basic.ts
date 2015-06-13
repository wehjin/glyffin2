/**
 * Created by wehjin on 5/24/15.
 */

module Glyffin {
    export interface Audience {
        getPerimeter():RectangleBounds;
        getPalette():Palette;
        addPatch(bounds : RectangleBounds, color : Color):Patch;
        addZone(bounds : RectangleBounds,
                touchProvider : TouchProvider):Zone;

    }

    export class PerimeterAudience implements Audience {

        constructor(private perimeter : RectangleBounds, private audience : Audience) {
        }

        getPerimeter() : RectangleBounds {
            return this.perimeter;
        }

        getPalette() : Palette {
            return this.audience.getPalette();
        }

        addPatch(bounds : RectangleBounds, color : Color) : Patch {
            return this.audience.addPatch(bounds, color);
        }


        addZone(bounds : RectangleBounds,
                touchProvider : TouchProvider) : Zone {
            return this.audience.addZone(bounds, touchProvider);
        }
    }

    export interface Removable {
        remove();
    }
    export var EMPTY_REMOVABLE = {
        remove() {
        }
    };

    export interface Patch extends Removable {
    }
    export interface Zone extends Removable {
    }

    export var EMPTY_PATCH : Patch = EMPTY_REMOVABLE;
    export var EMPTY_ACTIVE : Zone = EMPTY_REMOVABLE;

    export interface TouchProvider {
        getTouch(spot : Spot): Touch;
    }

    export interface Touch {
        onMove(spot : Spot);
        onRelease();
        onCancel();
    }

    export interface Reaction<T> {
        onResult(result : T);
        onError(error : Error);
    }

    export type ResultCallback = <T>(result : T)=>void;
    export type ErrorCallback = (error : Error)=>void;


    export interface Presentation {
        end();
    }

    export interface Presenter<T> extends Reaction<T> {
        addPresentation(presentation : Presentation):Removable;
    }

    export interface Mogrifier<T,U> {
        getUpperAudience(audience : Audience, presenter : Presenter<U>):Audience;
        getUpperReaction(audience : Audience, presenter : Presenter<U>):Reaction<T>;
    }

    export class Insertion<T> {

        constructor(public amount : number, public glyff : Glyff<T>) {
        }
    }

    export class RectangleBounds {
        constructor(public left : number, public top : number, public right : number,
                    public bottom : number) {
        }

        getHeight() : number {
            return this.bottom - this.top;
        }

        getWidth() : number {
            return this.right - this.left;
        }

        inset(pixelsX : number, pixelsY : number) : RectangleBounds {
            return new RectangleBounds(this.left + pixelsX,
                this.top + pixelsY, this.right - pixelsX,
                this.bottom - pixelsY);
        }

        downFromTop(pixelsY : number, pixelsHigh : number) : RectangleBounds {
            var inTop = this.top + pixelsY;
            return new RectangleBounds(this.left, inTop, this.right, inTop + pixelsHigh);
        }

        splitHorizontal(pixelsDown : number) : RectangleBounds[] {
            var split = this.top + pixelsDown;
            return [new RectangleBounds(this.left, this.top, this.right, split),
                    new RectangleBounds(this.left, split, this.right, this.bottom)];
        }
    }

    export class Color {
        constructor(public red : number, public green : number, public blue : number,
                    public alpha : number) {
        }
    }

    export class Palette {
        public static RED = new Color(1, 0, 0, 1);
        public static GREEN = new Color(0, 1, 0, 1);
        public static BLUE = new Color(0, 0, 1, 1);
        public static BEIGE = new Color(245 / 255, 245 / 255, 220 / 255, 1);
    }

    export class Spot {
        constructor(public x : number, public y : number) {
        }
    }

    export class Void {
    }
}