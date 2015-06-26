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
            if (pixelsDown >= 0) {
                var split = this.top + pixelsDown;
                return [new RectangleBounds(this.left, this.top, this.right, split),
                        new RectangleBounds(this.left, split, this.right, this.bottom)];
            } else {
                var split = this.bottom + pixelsDown;
                return [new RectangleBounds(this.left, split, this.right, this.bottom),
                        new RectangleBounds(this.left, this.top, this.right, split)];
            }
        }

        limitHeight(maxHeight : number, align : number) : RectangleBounds {
            var height = this.getHeight();
            return (height <= maxHeight) ? this :
                this.downFromTop((height - maxHeight) * align, maxHeight);
        }
    }

    export class Color {
        constructor(public red : number, public green : number, public blue : number,
                    public alpha : number) {
        }

        public static WHITE = new Color(1, 1, 1, 1);
        public static BLACK = new Color(0, 0, 0, 1);
        public static RED = new Color(1, 0, 0, 1);
        public static GREEN = new Color(0, 1, 0, 1);
        public static BLUE = new Color(0, 0, 1, 1);
        public static BEIGE = new Color(245 / 255, 245 / 255, 220 / 255, 1);

        public static get(red : number, green : number, blue : number, alpha : number) : Color {
            return new Color(red, green, blue, alpha);
        }

        public static getMany(hexRgbas : number[][]) : Color[] {
            var array = [];
            hexRgbas.forEach((hexRgba : number[])=> {
                array.push(Color.get(hexRgba[0] / 255, hexRgba[1] / 255, hexRgba[2] / 255,
                    hexRgba[3] / 255));
            });
            return array;
        }

        private mixComponent(mix : number, start : number, end : number) : number {
            return start + (end - start) * mix;
        }

        mix(mix : number, endColor : Color) : Color {
            return new Color(this.mixComponent(mix, this.red, endColor.red),
                this.mixComponent(mix, this.green, endColor.green),
                this.mixComponent(mix, this.blue, endColor.blue),
                this.mixComponent(mix, this.alpha, endColor.alpha));
        }
    }

    export class Palette {

        private colors : Color[][];

        constructor(colors? : Color[][]) {
            this.colors = colors || [];
        }

        withLevel(level : number, hexRgbas : number[][]) : Palette {
            var nextColors = this.colors.slice();
            nextColors[level] = Color.getMany(hexRgbas);
            return new Palette(nextColors);
        }

        get(colorPath : number[]) : Color {
            return this.colors[colorPath[0]][colorPath[1]];
        }
    }

    export class Spot {
        constructor(public x : number, public y : number) {
        }

        distanceSquared(other : Spot) : number {
            return other.x * this.x + other.y * this.y;
        }
    }

    export class Metrics {

        constructor(public perimeter : RectangleBounds, public tapHeight : number,
                    public readHeight : number, public palette : Palette) {
        }

        withPerimeter(perimeter : RectangleBounds) : Metrics {
            return new Metrics(perimeter, this.tapHeight, this.readHeight, this.palette);
        }
    }

    export class Stage {

        constructor(public metrics : Metrics, public palette : Palette) {
        }
    }

    export interface Audience {
        addPatch(bounds : RectangleBounds, color : Color):Patch;
        addZone(bounds : RectangleBounds,
                touchProvider : Gesturable):Zone;

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

    export interface Gesturable {
        init(spot : Spot): Gesturing;
    }

    export interface Gesturing {
        move(spot : Spot, onAbort : ()=>void);
        release();
        cancel();
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
        getMetrics(metrics : Metrics, presenter : Presenter<U>): Metrics;
        getUpperAudience(audience : Audience, presenter : Presenter<U>): Audience;
        getUpperReaction(audience : Audience, presenter : Presenter<U>): Reaction<T>;
    }

    export class Insertion<T> {

        constructor(public amount : number, public glyff : Glyff<T>) {
        }
    }

}