/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="glyffin.ts" />

module Glyffin {

    export class Void {
    }

    export class Perimeter {

        constructor(public left : number, public top : number, public right : number,
                    public bottom : number, public age : number, public level : number) {
        }

        getHeight() : number {
            return this.bottom - this.top;
        }

        getWidth() : number {
            return this.right - this.left;
        }

        withAge(age : number) : Perimeter {
            return new Perimeter(this.left, this.top, this.right, this.bottom, age, this.level);
        }

        withLevel(level : number) : Perimeter {
            return new Perimeter(this.left, this.top, this.right, this.bottom, this.age, level);
        }

        translate(x : number) : Perimeter {
            return new Perimeter(this.left + x, this.top, this.right + x, this.bottom, this.age,
                this.level);
        }

        inset(pixelsX : number, pixelsY : number) : Perimeter {
            return new Perimeter(this.left + pixelsX, this.top + pixelsY, this.right - pixelsX,
                this.bottom - pixelsY, this.age, this.level);
        }

        downFromTop(pixelsY : number, pixelsHigh : number) : Perimeter {
            var insetTop = this.top + pixelsY;
            return new Perimeter(this.left, insetTop, this.right, insetTop + pixelsHigh, this.age,
                this.level);
        }

        rightFromLeft(pixelsX : number, pixelsWide : number) : Perimeter {
            var insetLeft = this.left + pixelsX;
            return new Perimeter(insetLeft, this.top, insetLeft + pixelsWide, this.bottom,
                this.age, this.level);
        }

        splitHeight(pixels : number) : Perimeter[] {
            if (pixels >= 0) {
                var split = this.top + pixels;
                return [new Perimeter(this.left, this.top, this.right, split, this.age, this.level),
                        new Perimeter(this.left, split, this.right, this.bottom, this.age,
                            this.level)];
            } else {
                var split = this.bottom + pixels;
                return [new Perimeter(this.left, split, this.right, this.bottom, this.age,
                    this.level),
                        new Perimeter(this.left, this.top, this.right, split, this.age,
                            this.level)];
            }
        }

        splitWidth(pixels : number) : Perimeter[] {
            if (pixels >= 0) {
                var split = this.left + pixels;
                return [new Perimeter(this.left, this.top, split, this.bottom, this.age,
                    this.level),
                        new Perimeter(split, this.top, this.right, this.bottom, this.age,
                            this.level)];
            } else {
                var split = this.right + pixels;
                return [new Perimeter(split, this.top, this.right, this.bottom, this.age,
                    this.level),
                        new Perimeter(this.left, this.top, split, this.bottom, this.age,
                            this.level)];
            }
        }

        limitHeight(maxHeight : number, align : number) : Perimeter {
            var height = this.getHeight();
            return (height <= maxHeight) ? this :
                this.downFromTop((height - maxHeight) * align, maxHeight);
        }

        limitWidth(maxWidth : number, align : number) : Perimeter {
            var width = this.getWidth();
            return (width <= maxWidth) ? this :
                this.rightFromLeft((width - maxWidth) * align, maxWidth);
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

        private static mixComponent(mix : number, start : number, end : number) : number {
            return Math.min(1.0, Math.max(0.0, start + (end - start) * mix));
        }

        mix(mix : number, endColor : Color) : Color {
            return new Color(Color.mixComponent(mix, this.red, endColor.red),
                Color.mixComponent(mix, this.green, endColor.green),
                Color.mixComponent(mix, this.blue, endColor.blue),
                Color.mixComponent(mix, this.alpha, endColor.alpha));
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

        gridDistance(other : Spot) : number {
            return Math.max(Math.abs(other.x - this.x), Math.abs(other.y - this.y));
        }

        xDistance(origin : Spot) : number {
            return this.x - origin.x;
        }
    }

    export class Metrics {

        constructor(public perimeter : Perimeter, public tapHeight : number,
                    public readHeight : number, public palette : Palette) {
        }

        withPerimeter(perimeter : Perimeter) : Metrics {
            return new Metrics(perimeter, this.tapHeight, this.readHeight, this.palette);
        }
    }

    export class Stage {

        constructor(public metrics : Metrics, public palette : Palette) {
        }
    }

    export interface Audience {
        addPatch(bounds : Perimeter, color : Color):Patch;
        addZone(bounds : Perimeter,
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