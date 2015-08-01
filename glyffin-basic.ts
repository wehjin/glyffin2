/**
 * Created by wehjin on 5/24/15.
 */

module Glyffin {

    export class Void {
    }

    export class Inset1 {

        constructor(public fraction : number, public fixed : number) {
        }

        public getPixels(whole : number) : number {
            return this.fraction * whole + this.fixed;
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

        yDistance(origin : Spot) : number {
            return this.y - origin.y;
        }

        addY(addition : number) : Spot {
            return new Spot(this.x, this.y + addition);
        }
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

        addLevel(add : number) : Perimeter {
            return new Perimeter(this.left, this.top, this.right, this.bottom, this.age,
                this.level + add);
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

        resizeFromTop(pixelsHigh : number) : Perimeter {
            return new Perimeter(this.left, this.top, this.right, this.top + pixelsHigh, this.age,
                this.level);
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
        public static YELLOW = new Color(.5, .5, 0, 1);
        public static GREEN = new Color(0, 1, 0, 1);
        public static CYAN = new Color(0, .5, .5, 1);
        public static BLUE = new Color(0, 0, 1, 1);
        public static MAGENTA = new Color(.5, 0, .5, 1);
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

        darken(mix : number) : Color {
            return this.mix(mix, Color.BLACK);
        }

        lighten(mix : number) : Color {
            return this.mix(mix, Color.WHITE);
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

    export enum GestureStatus {
        CHARGING,
        CHARGED,
        SUPERCHARGED,
        DRAINED
    }

    export interface Gesturable {
        init(spot : Spot): Gesturing;
    }

    export interface Gesturing {
        isDrained():boolean;
        isPowered():boolean;
        move(spot : Spot):GestureStatus;
        release();
        cancel();
    }

    export interface Reaction<T> {
        onResult(result : T);
        onError(error : Error);
    }

    export type ErrorCallback = (error : Error)=>void;

    export interface OnError {
        (err : Error):void;
    }

    export interface OnResult<T> {
        (result : T):void;
    }


    export interface Presentation {
        end();
    }
    export var EMPTY_PRESENTATION : Presentation = {
        end() {
        }
    };

    export interface Presenter<T> extends Reaction<T> {
        addPresentation(presentation : Presentation):Removable;
    }

    var maxDuration = 50;
    var approximateDuration = maxDuration / 2;

    export class SpeedometerX {
        private spots : Spot[] = [null, null, null];
        private times : number[] = [0, 0, 0];
        private count : number = 0;

        constructor(spot : Spot) {
            this.addSpot(spot);
        }

        addSpot(spot : Spot) {
            var count = this.count;
            var spots = this.spots;
            var times = this.times;
            var time = Date.now();
            if (count > 0 && time <= times[count - 1]) {
                count = count - 1;
            }
            if (count >= 3) {
                spots[0] = spots[1];
                times[0] = times[1];
                spots[1] = spots[2];
                times[1] = times[2];
                count = 2;
            }
            spots[count] = spot;
            times[count] = time;
            this.count = count + 1;
        }

        getVelocity() : number {
            switch (this.count) {
                case 3:
                    return this.getVelocity2();
                case 2:
                    return this.getVelocity1();
                default:
                    return 0;
            }
        }

        getCount() : number {
            return this.count;
        }

        private getVelocity1() : number {
            var duration = this.times[1] - this.times[0];
            var distance = this.spots[1].xDistance(this.spots[0]);
            if (duration > maxDuration) {
                // Last mark was fresh move.  We don't have a hard duration so approximate;
                return distance / approximateDuration;
            }
            return distance / duration;
        }

        private getVelocity2() : number {
            var duration2 = this.times[2] - this.times[1];
            var distance2 = this.spots[2].xDistance(this.spots[1]);
            if (duration2 > maxDuration) {
                // Last mark was fresh move.  We don't have a hard duration so approximate;
                return distance2 / approximateDuration;
            }
            return (this.getVelocity1() + distance2 / duration2) / 2;
        }
    }

    export class VerticalGesturing implements Gesturing {

        private startSpot : Spot;
        private drained : boolean;
        private pixelsMoved : number;

        constructor(private downSpot : Spot, private minMove : number,
                    private onStarted : (down : number)=>void,
                    private onCanceled : ()=>void,
                    private onFinished : ()=>void) {
            this.drained = false;
            this.pixelsMoved = 0;
        }

        isDrained() : boolean {
            return this.drained;
        }

        isPowered() : boolean {
            return this.startSpot ? true : false;
        }

        move(spot : Glyffin.Spot) : GestureStatus {
            if (this.drained) {
                return;
            }
            if (!this.startSpot) {
                var crossOffset = Math.abs(spot.xDistance(this.downSpot));
                if (crossOffset > Math.abs(this.minMove)) {
                    this.drained = true;
                    return GestureStatus.DRAINED;
                }
                var grainOffset = spot.yDistance(this.downSpot);
                if (Math.abs(grainOffset) < Math.abs(this.minMove)) {
                    return GestureStatus.CHARGING;
                }
                if ((this.minMove > 0 && grainOffset < 0) ||
                    (this.minMove < 0 && grainOffset > 0)) {
                    return GestureStatus.CHARGING;
                }
                this.startSpot = this.downSpot.addY(this.minMove);
                this.onStarted(spot.yDistance(this.startSpot));
                return GestureStatus.SUPERCHARGED;
            }
            var grainOffset = spot.yDistance(this.startSpot);
            if (this.minMove > 0) {
                this.pixelsMoved = Math.max(0, grainOffset);
            } else if (this.minMove < 0) {
                this.pixelsMoved = Math.min(0, grainOffset);
            } else {
                this.pixelsMoved = grainOffset;
            }
            this.onStarted(this.pixelsMoved);
            return GestureStatus.SUPERCHARGED;
        }

        release() {
            if (this.drained || !this.startSpot) {
                return;
            }
            this.drained = true;
            this.onFinished();
        }

        cancel() {
            if (this.drained) {
                return;
            }
            this.drained = true;
            if (this.startSpot) {
                this.onCanceled();
            }
        }
    }
}