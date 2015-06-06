/**
 * Created by wehjin on 5/24/15.
 */

module Glyffin {

    export class Void {
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

        inset(pixels : number) : RectangleBounds {
            return new RectangleBounds(this.left + pixels,
                this.top + pixels, this.right - pixels,
                this.bottom - pixels);
        }
    }

    export class Color {

        constructor(public red : number, public green : number, public blue : number,
                    public alpha : number) {
        }
    }

    export interface Audience {
        getPerimeter():RectangleBounds;
        getPalette():Palette;
        addRectanglePatch(bounds : RectangleBounds, color : Color):RectanglePatch;
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

        addRectanglePatch(bounds : RectangleBounds, color : Color) : RectanglePatch {
            return this.audience.addRectanglePatch(bounds, color);
        }
    }

    export class Palette {
        public static RED = new Color(1, 0, 0, 1);
        public static GREEN = new Color(0, 1, 0, 1);
        public static BLUE = new Color(0, 0, 1, 1);
        public static BEIGE = new Color(245 / 255, 245 / 255, 220 / 255, 1);
    }

    export interface RectanglePatch {
        remove();
    }

    export var EMPTY_PATCH : RectanglePatch = {
        remove() {
        }
    };

    export interface Reaction<T> {
        onResult(result : T);
        onError(error : Error);
    }

    export interface Presentation {
        end();
    }

    export interface Presenter<T> extends Reaction<T> {
        addPresentation(presentation : Presentation);
    }

    export interface OnPresent<T> {
        call(audience : Audience, presenter : Presenter<T>);
    }

    export interface Mogrifier<T,U> {
        getUpperAudience(audience : Audience, presenter : Presenter<U>):Audience;
        getUpperReaction(audience : Audience, presenter : Presenter<U>):Reaction<T>;
    }

    export class Insertion<T> {

        constructor(public amount : number, public glyff : Glyff<T>) {
        }
    }
}