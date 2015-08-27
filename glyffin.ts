/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />

export class Void {
}

export class Inset1 {

    constructor(public fraction : number, public fixed : number) {
    }

    public getPixels(whole : number) : number {
        return this.fraction * whole + this.fixed;
    }
}

export class Inset2 {
    public x : Inset1;
    public y : Inset1;

    constructor(fractionX : number, fixedX : number, fractionY : number, fixedY : number) {
        this.x = new Inset1(fractionX, fixedX);
        this.y = new Inset1(fractionY, fixedY);
    }

    public static QUARTER : Inset2 = new Inset2(.25, 0, .25, 0);
    public static EIGHTH : Inset2 = new Inset2(.125, 0, .125, 0);
}

export class Spot {
    constructor(public x : number, public y : number) {
    }

    gridDistance(other : Spot) : number {
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
    }

    xDistance(origin : Spot) : number {
        return this.x - origin.x;
    }

    yDistance(origin : Spot) : number {
        return this.y - origin.y;
    }

    addX(addition : number) : Spot {
        return new Spot(this.x + addition, this.y);
    }

    addY(addition : number) : Spot {
        return new Spot(this.x, this.y + addition);
    }
}

export class Perimeter {

    constructor(public left : number, public top : number, public right : number,
                public bottom : number, public age : number, public level : number,
                public tapHeight : number, public readHeight : number,
                public palette : Palette) {
    }

    getHeight() : number {
        return this.bottom - this.top;
    }

    getWidth() : number {
        return this.right - this.left;
    }

    at(left : number, top : number, right : number, bottom : number) : Perimeter {
        return new Perimeter(left, top, right,
            bottom, this.age, this.level, this.tapHeight, this.readHeight, this.palette);
    }

    withAge(age : number) : Perimeter {
        return new Perimeter(this.left, this.top, this.right, this.bottom, age, this.level,
            this.tapHeight, this.readHeight, this.palette);
    }

    withLevel(level : number) : Perimeter {
        return new Perimeter(this.left, this.top, this.right, this.bottom, this.age, level,
            this.tapHeight, this.readHeight, this.palette);
    }

    addLevel(add : number) : Perimeter {
        return new Perimeter(this.left, this.top, this.right, this.bottom, this.age,
            this.level + add, this.tapHeight, this.readHeight, this.palette);
    }

    translateX(x : number) : Perimeter {
        return new Perimeter(this.left + x, this.top, this.right + x, this.bottom, this.age,
            this.level, this.tapHeight, this.readHeight, this.palette);
    }

    translateY(y : number) : Perimeter {
        return new Perimeter(this.left, this.top + y, this.right, this.bottom + y, this.age,
            this.level, this.tapHeight, this.readHeight, this.palette);
    }

    inset(pixelsX : number, pixelsY : number) : Perimeter {
        return new Perimeter(this.left + pixelsX, this.top + pixelsY, this.right - pixelsX,
            this.bottom - pixelsY, this.age, this.level, this.tapHeight, this.readHeight,
            this.palette);
    }

    inset2(inset : Inset2) : Perimeter {
        var pixelsX = inset.x.getPixels(this.getWidth());
        var pixelsY = inset.y.getPixels(this.getHeight());
        return this.inset(pixelsX, pixelsY);
    }

    downFromTop(pixelsY : number, pixelsHigh : number) : Perimeter {
        var insetTop = this.top + pixelsY;
        return new Perimeter(this.left, insetTop, this.right, insetTop + pixelsHigh, this.age,
            this.level, this.tapHeight, this.readHeight, this.palette);
    }

    rightFromLeft(pixelsX : number, pixelsWide : number) : Perimeter {
        var insetLeft = this.left + pixelsX;
        return new Perimeter(insetLeft, this.top, insetLeft + pixelsWide, this.bottom,
            this.age, this.level, this.tapHeight, this.readHeight, this.palette);
    }

    resizeFromTop(pixelsHigh : number) : Perimeter {
        return new Perimeter(this.left, this.top, this.right, this.top + pixelsHigh, this.age,
            this.level, this.tapHeight, this.readHeight, this.palette);
    }

    splitHeight(pixels : number) : Perimeter[] {
        if (pixels >= 0) {
            var split = this.top + pixels;
            return [new Perimeter(this.left, this.top, this.right, split, this.age, this.level,
                this.tapHeight, this.readHeight, this.palette),
                    new Perimeter(this.left, split, this.right, this.bottom, this.age,
                        this.level, this.tapHeight, this.readHeight, this.palette)];
        } else {
            var split = this.bottom + pixels;
            return [new Perimeter(this.left, split, this.right, this.bottom, this.age,
                this.level,
                this.tapHeight, this.readHeight, this.palette),
                    new Perimeter(this.left, this.top, this.right, split, this.age,
                        this.level, this.tapHeight, this.readHeight, this.palette)];
        }
    }

    splitWidth(pixels : number) : Perimeter[] {
        if (pixels >= 0) {
            var split = this.left + pixels;
            return [new Perimeter(this.left, this.top, split, this.bottom, this.age,
                this.level, this.tapHeight, this.readHeight, this.palette),
                    new Perimeter(split, this.top, this.right, this.bottom, this.age,
                        this.level, this.tapHeight, this.readHeight, this.palette)];
        } else {
            var split = this.right + pixels;
            return [new Perimeter(split, this.top, this.right, this.bottom, this.age,
                this.level, this.tapHeight, this.readHeight, this.palette),
                    new Perimeter(this.left, this.top, split, this.bottom, this.age,
                        this.level, this.tapHeight, this.readHeight, this.palette)];
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
    public static GRAY = new Color(.5, .5, .5, 1);

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

    neutralize(mix : number) : Color {
        return this.mix(mix, Color.GRAY);
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

export class Stage {

    constructor(public perimeter : Perimeter) {
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

export type ErrorCallback = (error : Error)=>void;

export interface OnError {
    (err : Error):void;
}

export interface OnResult<T> {
    (result : T):void;
}

export interface Reaction<T> {
    onResult(result : T);
    onError(error : Error);
}

export interface Presentation {
    end();
}

export var EMPTY_PRESENTATION : Presentation = {
    end() {
    }
};

export class NoResultReaction<T,U> implements Reaction<T> {
    constructor(private reaction : Reaction<U>) {
    }

    onResult(result : T) {
        // Do nothing.  Send to null.
    }

    onError(error : Error) {
        this.reaction.onError(error);
    }
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

export class PagenGesturing implements Gesturing {
    private drained : boolean = false;
    private sliding : number = 0;
    private speedometer : SpeedometerX;

    constructor(private downSpot : Spot, private minCharging : number,
                private onStarted : (pixelsMoved : number)=>void,
                private onCanceled : ()=>void,
                private onFinished : (velocity : number) =>void) {
        this.speedometer = new SpeedometerX(downSpot);
    }

    isDrained() : boolean {
        return this.drained;
    }

    isPowered() : boolean {
        return !this.drained && (this.sliding != 0);
    }

    move(spot : Spot) : GestureStatus {
        if (this.drained) {
            return GestureStatus.DRAINED;
        }
        this.speedometer.addSpot(spot);
        if (this.sliding == 0) {
            var crossOffset = spot.yDistance(this.downSpot);
            if (Math.abs(crossOffset) > this.minCharging) {
                this.drained = true;
                return GestureStatus.DRAINED;
            }
            var grainOffset = spot.xDistance(this.downSpot);
            if (Math.abs(grainOffset) < this.minCharging) {
                return GestureStatus.CHARGING;
            }
            this.sliding = grainOffset > 0 ? 1 : -1;
        }
        var grainOffset = spot.xDistance(this.downSpot);
        var pixelsMoved;
        if (this.sliding > 0) {
            pixelsMoved = Math.max(0, grainOffset);
        } else if (this.sliding < 0) {
            pixelsMoved = Math.min(0, grainOffset);
        } else {
            pixelsMoved = grainOffset;
        }
        this.onStarted(pixelsMoved);
        return GestureStatus.SUPERCHARGED;
    }

    release() {
        if (this.drained || this.sliding == 0) {
            return;
        }
        this.drained = true;
        this.onFinished(this.speedometer.getVelocity());
    }

    cancel() {
        if (this.drained) {
            return;
        }
        this.drained = true;
        if (this.sliding != 0) {
            this.onCanceled();
        }
    }
}

export class HorizontalGesturing implements Gesturing {

    private startSpot : Spot;
    private drained : boolean;
    private direction : number;

    constructor(private downSpot : Spot,
                private chargingSize : number, private chargingDirection : number,
                private onStarted : (pixelsMoved : number)=>void,
                private onCanceled : ()=>void,
                private onFinished : ()=>void) {
        this.drained = false;
    }

    isDrained() : boolean {
        return this.drained;
    }

    isPowered() : boolean {
        return this.startSpot ? true : false;
    }

    move(spot : Spot) : GestureStatus {
        if (this.drained) {
            return;
        }
        if (!this.startSpot) {
            var crossOffset = Math.abs(spot.yDistance(this.downSpot));
            if (crossOffset > this.chargingSize) {
                this.drained = true;
                return GestureStatus.DRAINED;
            }
            var grainOffset = spot.xDistance(this.downSpot);
            if (Math.abs(grainOffset) < this.chargingSize) {
                return GestureStatus.CHARGING;
            }
            if ((this.chargingDirection > 0 && grainOffset < 0) ||
                (this.chargingDirection < 0 && grainOffset > 0)) {
                return GestureStatus.CHARGING;
            }

            this.direction = grainOffset >= 0 ? 1 : -1;
            this.startSpot = this.downSpot.addX(this.chargingSize * this.direction);
        }
        var grainOffset = spot.xDistance(this.startSpot);
        var pixelsMoved;
        if (this.direction > 0) {
            pixelsMoved = Math.max(0, grainOffset);
        } else if (this.direction < 0) {
            pixelsMoved = Math.min(0, grainOffset);
        } else {
            pixelsMoved = grainOffset;
        }
        this.onStarted(pixelsMoved);
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

export class VerticalGesturing implements Gesturing {

    private startSpot : Spot;
    private drained : boolean;

    constructor(private downSpot : Spot, private minMove : number,
                private onStarted : (down : number)=>void,
                private onCanceled : ()=>void,
                private onFinished : ()=>void) {
        this.drained = false;
    }

    isDrained() : boolean {
        return this.drained;
    }

    isPowered() : boolean {
        return this.startSpot ? true : false;
    }

    move(spot : Spot) : GestureStatus {
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
        }
        var grainOffset = spot.yDistance(this.startSpot);
        var pixelsMoved : number;
        if (this.minMove > 0) {
            pixelsMoved = Math.max(0, grainOffset);
        } else if (this.minMove < 0) {
            pixelsMoved = Math.min(0, grainOffset);
        } else {
            pixelsMoved = grainOffset;
        }
        this.onStarted(pixelsMoved);
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

export interface Audience {
    addPatch(bounds : Perimeter, color : Color):Patch;
    addZone(bounds : Perimeter, touchProvider : Gesturable):Zone;
    present<U>(glyff : Glyff<U>, reactionOrOnResult ? : Reaction<U>|OnResult<U>,
               onError? : OnError) : Presentation;
}

export interface Presenter<T> extends Reaction<T>, Presentation {
    perimeter:Perimeter;
    audience:Audience;
    addPresentation(presentation : Presentation):Removable;
}

export interface OnPresent<T> {
    (presenter : Presenter<T>);
}

export interface Lifter<U, T> {
    (lowerPresenter : Presenter<U>):Presenter<T>;
}


export class Insertion<T> {

    constructor(public amount : number, public glyff : Glyff<T>) {
    }
}

export interface Mogrifier<T,U> {
    getPerimeter(presenter : Presenter<U>): Perimeter;
    getUpperAudience(presenter : Presenter<U>): Audience;
    getUpperReaction(presenter : Presenter<U>): Reaction<T>;
}

class ClickGesturing implements Gesturing {

    private isEnded : boolean = false;
    private pressTime : number = 0;
    private willPress : number = 0;

    private clearWillPress() {
        if (this.willPress) {
            clearTimeout(this.willPress);
            this.willPress = 0;
        }
    }

    private doPress() {
        if (this.isEnded) {
            return;
        }
        this.clearWillPress();
        this.pressTime = Date.now();
        this.onPress();
    }

    private doEnd() {
        this.isEnded = true;
        this.clearWillPress();
        if (this.pressTime) {
            this.onUnpress();
        }
    }

    constructor(private startSpot : Spot, private threshold : number,
                private onPress : ()=>void,
                private onUnpress : ()=>void, private onClick : ()=>void) {
        this.willPress = setTimeout(()=> {
            this.doPress();
        }, 200);
    }

    isDrained() : boolean {
        return this.isEnded;
    }

    isPowered() : boolean {
        return !this.isEnded;
    }

    release() {
        if (this.isEnded) {
            return;
        }

        if (this.pressTime == 0) {
            this.doPress();
            // Let the press appear on screen before unpressing and clicking.
            window.requestAnimationFrame(()=> {
                this.doEnd();
                this.onClick();
            });
            return;
        }
        this.doEnd();
        this.onClick();
    }

    move(spot : Spot) : GestureStatus {
        if (this.isEnded) {
            return GestureStatus.DRAINED;
        }
        if (spot.gridDistance(this.startSpot) > this.threshold) {
            this.doEnd();
            return GestureStatus.DRAINED;
        }
        return GestureStatus.CHARGED;
    }

    cancel() {
        if (this.isEnded) {
            return;
        }
        this.doEnd();
    }
}

class ClickGesturable implements Gesturable {
    constructor(private threshold : number, private press : ()=>void,
                private unpress : ()=>void, private click : ()=>void) {
    }

    init(spot : Spot) : Gesturing {
        return new ClickGesturing(spot, this.threshold, this.press, this.unpress, this.click);
    }
}

interface AnimationPath {
    start(now : number);
    getAge(now : number) : number;
    hasMore(now : number) : boolean;
}

class LinearAnimationPath implements AnimationPath {
    private startTime;
    private endTime;

    constructor(private duration : number, private reverse : boolean) {
    }

    start(now : number) {
        this.startTime = now;
        this.endTime = this.startTime + this.duration;
    }

    getAge(now : number) : number {
        if (now >= this.endTime) {
            return this.reverse ? 0 : 1;
        }
        if (now <= this.startTime) {
            return this.reverse ? 1 : 0;
        }
        var age = (now - this.startTime) / this.duration;
        return this.reverse ? (1 - age) : age;
    }

    hasMore(now : number) : boolean {
        return now < this.endTime;
    }
}

class CycleAnimationPath implements AnimationPath {
    private reversed;
    private innerPath;
    private lives;
    private started;

    constructor(private duration : number, count : number) {
        this.reversed = false;
        this.innerPath = new LinearAnimationPath(duration, this.reversed);
        this.lives = count * 2 - 1;
    }

    start(now : number) {
        this.started = true;
        this.innerPath.start(now);
    }

    getAge(now : number) : number {
        return this.innerPath.getAge(now);
    }

    hasMore(now : number) : boolean {
        var hasMore = this.innerPath.hasMore(now);
        if (!hasMore) {
            if (this.started && this.lives > 0) {
                this.lives--;
                this.reversed = !this.reversed;
                this.innerPath = new LinearAnimationPath(this.duration, this.reversed);
                this.innerPath.start(now);
                hasMore = this.innerPath.hasMore(now);
            }
        }
        return hasMore;
    }
}

class BasePresenter<T> implements Presenter<T> {
    perimeter : Perimeter;
    audience : Audience;
    private reactionOrOnResult : Reaction<T>|OnResult<T>;
    private _onError : ErrorCallback;
    private presentations : Presentation[] = [];
    private ended : boolean = false;

    constructor(perimeter : Perimeter, audience : Audience,
                reactionOrOnResult ? : Reaction<T>|OnResult<T>, onError? : ErrorCallback) {
        this.perimeter = perimeter;
        this.audience = audience;
        this.reactionOrOnResult = reactionOrOnResult;
        this._onError = onError;
    }

    addPresentation(presentation : Presentation) : Removable {
        if (this.ended) {
            throw "addPresentation called after end";
        }
        var index = this.presentations.length;
        this.presentations.push(presentation);
        return {
            remove: ()=> {
                var presentation = this.presentations[index];
                if (presentation) {
                    this.presentations[index] = null;
                    presentation.end();
                }
            }
        };
    }

    onResult(result : T) {
        if (typeof this.reactionOrOnResult === 'object') {
            (<Reaction<T>>this.reactionOrOnResult).onResult(result);
        } else if (typeof this.reactionOrOnResult === 'function') {
            (<OnResult<T>>this.reactionOrOnResult)(result);
        }
    }

    onError(error : Error) {
        if (typeof this.reactionOrOnResult === 'object') {
            (<Reaction<T>>this.reactionOrOnResult).onError(error);
        } else if (this.onError) {
            this.onError(error);
        }
    }

    end() {
        this.ended = true;
        for (var i = 0; i < this.presentations.length; i++) {
            var presentation = this.presentations[i];
            if (presentation) {
                this.presentations[i] = null;
                presentation.end();
            }
        }
    }
}

export class Glyff<T> {

    depth : number = 0;

    constructor(private onPresent : OnPresent<T>) {
    }

    static create<U>(onPresent : OnPresent<U>, depth : number) : Glyff<U> {
        var glyff = new Glyff<U>(onPresent);
        glyff.depth = depth || 0;
        return glyff;
    }

    present(perimeter : Perimeter, audience : Audience,
            reactionOrOnResult ? : Reaction<T>|OnResult<T>,
            onError? : ErrorCallback) : Presentation {
        var presenter : Presenter<T> = new BasePresenter<T>(perimeter, audience,
            reactionOrOnResult, onError);
        this.onPresent(presenter);
        return presenter;
    }

    lift<U>(lifter : Lifter<U,T>, depth? : number) : Glyff<U> {
        return Glyff.create<U>((presenter : Presenter<U>)=> {
            var lifted = lifter(presenter);
            presenter.addPresentation(this.present(lifted.perimeter, lifted.audience, lifted));
        }, depth || 0);
    }

    rebuild<U>(builder : (previous : Glyff<T>)=>Glyff<U>) : Glyff<U> {
        var rebuilt = builder(this);
        return Glyff.create<U>((presenter : Presenter<U>)=> {
            presenter.addPresentation(rebuilt.present(presenter.perimeter, presenter.audience,
                presenter));
        }, rebuilt.depth);
    }

    compose<U>(mogrifier : Mogrifier<T,U>, depth? : number) : Glyff<U> {
        var upperGlyff = this;
        return Glyff.create<U>((presenter : Presenter<U>)=> {
            var perimeter = mogrifier.getPerimeter(presenter);
            var audience = mogrifier.getUpperAudience(presenter);
            var reaction = mogrifier.getUpperReaction(presenter);
            presenter.addPresentation(upperGlyff.present(perimeter, audience, reaction));
        }, depth || 0);
    }

    disappear(disappeared : boolean) : Glyff<T> {
        return Glyff.create<T>((presenter : Presenter<Void>)=> {
            var audience = disappeared ? {
                addPatch(bounds : Perimeter, color : Color) : Patch {
                    return EMPTY_REMOVABLE;
                },
                addZone(bounds : Perimeter, touchProvider : Gesturable) : Zone {
                    return presenter.audience.addZone(bounds, touchProvider);
                },
                present: <U>(glyff : Glyff<U>, reactionOrOnResult ? : Reaction<U>|OnResult<U>,
                             onError? : OnError) : Presentation => {
                    return presenter.audience.present(glyff, reactionOrOnResult, onError);
                }
            } : presenter.audience;
            presenter.addPresentation(this.present(presenter.perimeter, audience, presenter));
        }, this.depth);
    }

    isolate(isolated : boolean) : Glyff<T> {
        return Glyff.create<T>((presenter : Presenter<Void>)=> {
            var audience = isolated ? {
                addPatch(bounds : Perimeter, color : Color) : Patch {
                    return presenter.audience.addPatch(bounds, color);
                },
                addZone(bounds : Perimeter, touchProvider : Gesturable) : Zone {
                    return EMPTY_REMOVABLE;
                },
                present: <U>(glyff : Glyff<U>, reactionOrOnResult ? : Reaction<U>|OnResult<U>,
                             onError? : OnError) : Presentation => {
                    return presenter.audience.present(glyff, reactionOrOnResult, onError);
                }
            } : presenter.audience;
            presenter.addPresentation(this.present(presenter.perimeter, audience, presenter));
        }, this.depth);
    }

    addLefts(insertions : Insertion<T>[]) : Glyff<T> {
        var current : Glyff<T> = this;
        var todo = insertions.slice();
        while (todo.length > 0) {
            var insertion : Insertion<T> = todo.pop();
            current = current.splitWidthCombine(insertion.amount, insertion.glyff);
        }
        return current;
    }

    splitWidthCombine(size : number, glyff : Glyff<T>) : Glyff<T> {
        return Glyff.create((presenter : Presenter<T>)=> {
            var audience = presenter.audience;
            var split = presenter.perimeter.splitWidth(size);
            presenter.addPresentation(glyff.present(split[0], audience, presenter));
            presenter.addPresentation(this.present(split[1], audience, presenter));
        }, Math.max(this.depth, glyff.depth));
    }

    splitHeight<U>(size : number, topGlyff : Glyff<U>) : Glyff<T|U> {
        return Glyff.create((presenter : Presenter<T|U>) => {
            var audience = presenter.audience;
            var split = presenter.perimeter.splitHeight(size);
            presenter.addPresentation(topGlyff.present(split[0], audience, presenter));
            presenter.addPresentation(this.present(split[1], audience, presenter));
        }, Math.max(this.depth, topGlyff.depth));
    }

    splitHeightYield<U>(size : number, topGlyff : Glyff<U>) : Glyff<U> {
        return Glyff.create((presenter : Presenter<U>) => {
            var audience = presenter.audience;
            var split = presenter.perimeter.splitHeight(size);
            presenter.addPresentation(topGlyff.present(split[0], audience, presenter));
            presenter.addPresentation(this.present(split[1], audience,
                new NoResultReaction(presenter)));
        }, Math.max(this.depth, topGlyff.depth));
    }

    splitHeightRetain<U>(size : number, addGlyff : Glyff<U>) : Glyff<T> {
        return Glyff.create((presenter : Presenter<T>) => {
            var audience = presenter.audience;
            var split = presenter.perimeter.splitHeight(size);
            presenter.addPresentation(addGlyff.present(split[0], audience,
                new NoResultReaction(presenter)));
            presenter.addPresentation(this.present(split[1], audience, presenter));
        }, Math.max(this.depth, addGlyff.depth));
    }

    over<U>(farGlyph : Glyff<U>, dz ? : number) : Glyff<T|U> {
        var nearGlyff = this;
        var gapToNear = farGlyph.depth + (1 + (dz ? dz : 0));

        function onPresent(presenter : Presenter<T|U>) {
            var audience = presenter.audience;
            var farPerimeter = presenter.perimeter;
            var nearPerimeter = farPerimeter.withLevel(farPerimeter.level + gapToNear);
            presenter.addPresentation(farGlyph.present(farPerimeter, audience, presenter));
            presenter.addPresentation(nearGlyff.present(nearPerimeter, audience, presenter));
        }

        return Glyff.create(onPresent, gapToNear + nearGlyff.depth);
    }

    addNearMajor<U>(level : number, nearGlyff : Glyff<U>) : Glyff<U> {
        var farGlyff = this;
        var gapToNear = farGlyff.depth + level;

        function onPresent(presenter : Presenter<U>) {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            presenter.addPresentation(farGlyff.present(perimeter, audience,
                new NoResultReaction(presenter)));
            var nearPerimeter = perimeter.addLevel(gapToNear);
            presenter.addPresentation(nearGlyff.present(nearPerimeter, audience, presenter));
        }

        return Glyff.create(onPresent, gapToNear + nearGlyff.depth);
    }


    revealDown<U>(inset : Inset1, revelation : Glyff<U>) : Glyff<T|U> {
        var gapToCover = revelation.depth + 1;
        return Glyff.create<T|U>((presenter : Presenter<T|U>) => {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var perimeterHeight = perimeter.getHeight();
            var maxRevelationHeight = inset.getPixels(perimeterHeight);
            var revelationPerimeter = perimeter.resizeFromTop(maxRevelationHeight);

            var revelationHeight;
            var unpresent : ()=>void = null;
            var cover = this;

            function setRevelationHeight(height : number) {
                revelationHeight = Math.max(0, Math.min(height, maxRevelationHeight));
                var coverPerimeter = perimeter.downFromTop(revelationHeight, perimeterHeight)
                    .addLevel(gapToCover);
                if (unpresent) {
                    unpresent();
                }
                var revelationRemovable = presenter.addPresentation(revelation
                    .isolate(revelationHeight < maxRevelationHeight)
                    .disappear(revelationHeight <= 0)
                    .present(revelationPerimeter, audience, presenter));
                var coverRemovable = presenter.addPresentation(cover
                    .present(coverPerimeter, audience, presenter));
                unpresent = ()=> {
                    coverRemovable.remove();
                    revelationRemovable.remove();
                }
            }

            var anchorHeight;
            var zone : Removable;
            var zonePerimeter = perimeter.addLevel(gapToCover);

            function setAnchorHeight(height : number) {
                if (zone) {
                    zone.remove();
                }
                setRevelationHeight(height);
                anchorHeight = height;
                zone = audience.addZone(zonePerimeter, {
                    init: (spot : Spot) : Gesturing => {
                        return new VerticalGesturing(spot,
                            perimeter.tapHeight / 2 * (anchorHeight <= 0 ? 1 : -1),
                            (moved)=> {
                                setRevelationHeight(anchorHeight + moved);
                            }, ()=> {
                                setRevelationHeight(anchorHeight);
                            }, ()=> {
                                var target = anchorHeight <= 0 ? maxRevelationHeight : 0;
                                var distanceFromTarget = Math.abs(revelationHeight - target);
                                if (distanceFromTarget < maxRevelationHeight / 2) {
                                    setAnchorHeight(target);
                                } else {
                                    setRevelationHeight(anchorHeight);
                                }
                            })
                    }
                });
            }

            setAnchorHeight(0);
            presenter.addPresentation({
                end: ()=> {
                    if (zone) {
                        zone.remove();
                    }
                }
            });
        }, gapToCover + this.depth);
    }

    limitWidth(maxWidth : number, align : number) : Glyff<T> {
        return Glyff.create((presenter : Presenter<T>) => {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var width = perimeter.getWidth();
            if (width <= maxWidth) {
                presenter.addPresentation(this.present(perimeter, audience, presenter));
            } else {
                var narrowPerimeter : Perimeter = perimeter.limitWidth(maxWidth, align);
                presenter.addPresentation(this.present(narrowPerimeter, audience, presenter));
            }
        }, this.depth);
    }

    limitHeight(maxHeight : number, align : number) : Glyff<T> {
        return Glyff.create((presenter : Presenter<T>) => {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var height = perimeter.getHeight();
            if (height <= maxHeight) {
                presenter.addPresentation(this.present(perimeter, audience, presenter));
            } else {
                var shortPerimeter : Perimeter = perimeter.limitHeight(maxHeight, align);
                presenter.addPresentation(this.present(shortPerimeter, audience, presenter));
            }
        }, this.depth);
    }

    kaleid(columns : number, rows : number, spots : number[][]) : Glyff<Void> {
        var upperGlyff = this;
        return Glyff.create((presenter : Presenter<Void>)=> {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var rowHeight = perimeter.getHeight() / rows;
            var colWidth = perimeter.getWidth() / columns;
            for (var i = 0, count = spots.length; i < count; i++) {
                var spot = spots[i];
                var left = perimeter.left + colWidth * spot[0];
                var top = perimeter.top + rowHeight * spot[1];
                var spotPerimeter = perimeter.at(left, top, left + colWidth, top + rowHeight);
                new Perimeter(left, top, left + colWidth, top + rowHeight,
                    perimeter.age, perimeter.level, perimeter.tapHeight, perimeter.readHeight,
                    perimeter.palette);
                presenter.addPresentation(upperGlyff.present(spotPerimeter, audience,
                    presenter));
            }
        }, this.depth);
    }

    // TODO: Integrate with pad2.
    pad(xPixels : number, yPixels : number) : Glyff<T> {
        return this.compose({
            getPerimeter(presenter : Presenter<T>) : Perimeter {
                return presenter.perimeter.inset(xPixels, yPixels);
            },
            getUpperAudience(presenter : Presenter<T>) : Audience {
                return presenter.audience;
            },
            getUpperReaction(presenter : Presenter<T>) : Reaction<T> {
                return presenter;
            }
        });
    }

    pad2(inset : Inset2) : Glyff<T> {
        return this.lift((lowerPresenter : Presenter<T>) : Presenter<T>=> {
            var perimeter = lowerPresenter.perimeter;
            var insetPerimeter = perimeter.inset2(inset);
            return {
                perimeter: insetPerimeter,
                audience: lowerPresenter.audience,
                addPresentation(presentation : Presentation) : Removable {
                    return lowerPresenter.addPresentation(presentation);
                },
                onResult(result : T) {
                    lowerPresenter.onResult(result);
                },
                onError(err : Error) {
                    lowerPresenter.onError(err);
                },
                end() {
                    lowerPresenter.end();
                }
            };
        }, this.depth);
    }

    moveX(x : number) : Glyff<T> {
        return Glyff.create<T>((presenter : Presenter<Void>)=> {
            var audience = presenter.audience;
            var perimeter = presenter.perimeter.translateX(x);
            presenter.addPresentation(this.present(perimeter, audience, presenter));
        }, this.depth);
    }

    moveY(y : number) : Glyff<T> {
        return Glyff.create<T>((presenter : Presenter<Void>)=> {
            var audience = presenter.audience;
            var perimeter = presenter.perimeter.translateY(y);
            presenter.addPresentation(this.present(perimeter, audience, presenter));
        }, this.depth);
    }

    clicken<U>(symbol : string, pressed? : Glyff<U>) : Glyff<string> {
        var unpressed = this;
        // No need to add pressed.depth.  The two are never draw at the same time.
        var gapToUnpressed = pressed ? 4 : 0;
        return Glyff.create<string>((presenter : Presenter<Void>)=> {
            var audience = presenter.audience;
            var pressedPerimeter = presenter.perimeter;
            var unpressedPerimeter = pressedPerimeter.addLevel(gapToUnpressed);
            var removable = presenter.addPresentation(unpressed.present(unpressedPerimeter,
                audience));
            var zone = audience.addZone(unpressedPerimeter,
                new ClickGesturable(unpressedPerimeter.tapHeight / 2, ()=> {
                    if (!pressed) {
                        return;
                    }
                    removable.remove();
                    removable = presenter.addPresentation(pressed.present(pressedPerimeter,
                        audience));
                }, ()=> {
                    if (!pressed) {
                        return;
                    }
                    removable.remove();
                    removable = presenter.addPresentation(unpressed.present(unpressedPerimeter,
                        audience));
                }, ()=> {
                    presenter.onResult(symbol);
                }));
            presenter.addPresentation(<Presentation>{
                end: ()=> {
                    zone.remove();
                }
            });
        }, gapToUnpressed + unpressed.depth);
    }

    pagen<U>(index : number, next : Glyff<U>, prev : Glyff<U>) : Glyff<string|T> {
        var gapToCenter = (next ? next.depth + 1 : 0);
        var gapToLeft = gapToCenter + this.depth + 1;
        var newDepth = gapToLeft + (prev ? prev.depth : 0);
        return Glyff.create<string|T>((presenter : Presenter<string|T>)=> {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var current = this;
            var centerPerimeter = perimeter.addLevel(gapToCenter);
            var leftPerimeter = perimeter.addLevel(gapToLeft);
            var noResultReaction = new NoResultReaction(presenter);

            var slideRange = perimeter.right;
            var centerAdded : Removable, rightAdded : Removable, leftAdded : Removable;

            function setCenter(glyff : Glyff<string|T>) {
                if (centerAdded) {
                    centerAdded.remove();
                }
                centerAdded =
                    presenter.addPresentation(glyff.present(centerPerimeter, audience,
                        presenter));
            }

            var centerSlide : number;

            function setCenterSlide(newSlide : number) {
                if (newSlide !== centerSlide) {
                    centerSlide = newSlide;
                    setCenter(newSlide === 0 ? current : current.moveX(newSlide));
                }
            }

            function showRight(show : boolean) {
                if (show && !rightAdded && next) {
                    rightAdded = presenter.addPresentation(next.present(perimeter, audience,
                        noResultReaction));
                } else if (!show && rightAdded) {
                    rightAdded.remove();
                    rightAdded = null;
                }
            }

            var leftSlide : number;

            function setLeftSlide(newSlide : number) {
                if (newSlide <= -slideRange) {
                    newSlide = -slideRange;
                }
                if (newSlide >= 0) {
                    newSlide = 0;
                }
                if (newSlide !== leftSlide) {
                    leftSlide = newSlide;
                    setLeft((newSlide <= -slideRange || !prev) ? null : prev.moveX(newSlide));
                }
            }

            function setLeft(glyff : Glyff<Void>) {
                if (leftAdded) {
                    leftAdded.remove();
                }
                if (glyff) {
                    leftAdded = presenter.addPresentation(glyff.present(leftPerimeter, audience,
                        noResultReaction));
                }
            }

            var triggerAge = (perimeter.tapHeight * 1.5) / slideRange;
            var age = 0.0;

            function setAge(newAge : number) {
                setCenterSlide(newAge <= 0 ? 0 : (newAge * -slideRange));
                showRight(newAge > 0);
                setLeftSlide(newAge >= 0 ? -slideRange : (newAge + 1) * -slideRange);
                age = newAge;
            }

            var stopAnimation;

            function animateAge(newAge : number, ageVelocity : number, onEnd : ()=>void) {
                if (stopAnimation) {
                    stopAnimation();
                }
                var startAge = age;
                var ageRange = newAge - startAge;
                var startTime = Date.now();

                var duration = 200;
                if (ageVelocity * ageRange > 0) {
                    // Velocity and range are in same direction and both non-zero.
                    // Continue to see if we should shorten the duration.
                    var minVelocity = ageRange / duration;
                    if (ageVelocity / minVelocity > 1) {
                        // Moving faster than minimum.  Get new duration.
                        duration = ageRange / ageVelocity;
                    }
                }

                var frame;

                stopAnimation = ()=> {
                    if (frame) {
                        window.cancelAnimationFrame(frame);
                        frame = 0;
                    }
                    stopAnimation = null;
                };

                function animate() {
                    if (age == newAge) {
                        stopAnimation = null;
                        setTimeout(()=> {
                            if (onEnd) {
                                onEnd();
                            }
                        }, 1);
                        return;
                    }
                    frame = window.requestAnimationFrame(()=> {
                        frame = 0;
                        var elapsed = (Date.now() - startTime);
                        var progress = (elapsed / duration) + .001; // Bias ensures we get there
                        setAge(elapsed >= duration ? newAge : startAge + ageRange * progress);
                        animate();
                    });
                }

                // Animate only after initializing stopAnimation so that animate can set
                // it to null if needed.
                animate();
            }

            setAge(0);
            var zone = audience.addZone(perimeter, {
                init(startSpot : Spot) : Gesturing {
                    if (stopAnimation) {
                        return null;
                    }

                    var moveFrame;
                    var targetAge = age;
                    return new PagenGesturing(startSpot, perimeter.tapHeight * .75,
                        (pixelsMoved : number)=> {
                            targetAge = -pixelsMoved / slideRange * 1.2;
                            if ((targetAge < 0 && !prev) || (targetAge > 0 && !next)) {
                                targetAge = 0;
                            }
                            if (!moveFrame) {
                                moveFrame = setTimeout(()=> {
                                    if (!moveFrame) {
                                        return;
                                    }
                                    moveFrame = 0;
                                    setAge(targetAge);
                                }, 3);
                            }
                        }, ()=> {
                            moveFrame = 0;
                            setAge(0);
                        }, (velocity : number)=> {
                            moveFrame = 0;
                            var ageVelocity = -velocity / slideRange;
                            if (Math.abs(targetAge) < triggerAge) {
                                animateAge(0, ageVelocity, null);
                            } else if (targetAge > 0) {
                                animateAge(1, ageVelocity, ()=> {
                                    presenter.onResult("next");
                                });
                            } else {
                                animateAge(-1, ageVelocity, ()=> {
                                    presenter.onResult("back");
                                });
                            }
                        });
                }
            });
            presenter.addPresentation(<Presentation>{
                end: ()=> {
                    zone.remove();
                }
            });
        }, newDepth);
    }

    private animateWithPath(path : AnimationPath) {
        return Glyff.create((presenter : Presenter<Void>)=> {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            path.start(Date.now());

            var presentation;
            var frame;
            var present = ()=> {
                var now = Date.now();
                var agedPerimeter = perimeter.withAge(path.getAge(now));
                presentation = this.present(agedPerimeter, audience, presenter);
                if (path.hasMore(now)) {
                    frame = requestAnimationFrame(()=> {
                        presentation.end();
                        present();
                    })
                }
            };
            present();
            presenter.addPresentation({
                end: ()=> {
                    if (frame) {
                        cancelAnimationFrame(frame);
                    }
                    presentation.end();
                }
            })
        }, this.depth);
    }

    animate(duration : number) : Glyff<T> {
        return this.animateWithPath(new LinearAnimationPath(duration, true));
    }

    pulseAnimate(duration : number, count : number) : Glyff<T> {
        return this.animateWithPath(new CycleAnimationPath(duration, count));
    }

    static color(color : Color) : Glyff<Void> {
        return Glyff.create<Void>((presenter : Presenter<Void>)=> {
            var audience = presenter.audience;
            var patch = audience.addPatch(presenter.perimeter, color);
            presenter.addPresentation({
                end() {
                    patch.remove();
                }
            });
        }, 0);
    }

    static colorAnimation(first : Color, last : Color) : Glyff<Void> {
        return Glyff.create((presenter : Presenter<Void>)=> {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var colorGlyff = Glyff.color(first.mix(perimeter.age, last));
            presenter.addPresentation(colorGlyff.present(perimeter, audience, presenter));
        }, 0);
    }

    static divideWidth<T>(glyffs : Glyff<T>[], inset? : Inset1, gapGlyff? : Glyff<any>) : Glyff<T> {
        var depth = gapGlyff ? gapGlyff.depth : 0;
        for (var i = 0; i < glyffs.length; i++) {
            var glyff = glyffs[i];
            depth = Math.max(depth, glyff.depth);
        }
        return Glyff.create((presenter : Presenter<T>)=> {
            var audience = presenter.audience;
            var perimeter = presenter.perimeter;
            var gapReaction = (gapGlyff ? new NoResultReaction<any,T>(presenter) : <Reaction<any>>null);
            var sectionWidth = perimeter.getWidth() / glyffs.length;
            var gapWidth = (inset ? inset.getPixels(sectionWidth) : 0);
            var glyffWidth = sectionWidth - gapWidth + gapWidth / glyffs.length;
            var stride = glyffWidth + gapWidth;
            var left = perimeter.left, top = perimeter.top, bottom = perimeter.bottom;
            for (var i = 0; i < glyffs.length; i++) {
                var glyff = glyffs[i];
                var right = left + glyffWidth;
                var glyffPerimeter = perimeter.at(left, top, right, bottom);
                presenter.addPresentation(glyff.present(glyffPerimeter, audience, presenter));
                if ((i + 1) < glyffs.length && gapGlyff) {
                    var gapPerimeter = perimeter.at(right, top, right + gapWidth, bottom);
                    presenter.addPresentation(gapGlyff.present(gapPerimeter, audience,
                        gapReaction));
                }
                left += stride;
            }
        }, depth)
    }

    static divideHeight<T>(glyffs : Glyff<T>[], inset? : Inset1,
                           gapGlyff? : Glyff<any>) : Glyff<T> {
        var depth = gapGlyff ? gapGlyff.depth : 0;
        for (var i = 0; i < glyffs.length; i++) {
            var glyff = glyffs[i];
            depth = Math.max(depth, glyff.depth);
        }
        return Glyff.create((presenter : Presenter<T>)=> {
            var audience = presenter.audience;
            var perimeter = presenter.perimeter;
            var gapReaction = (gapGlyff ? new NoResultReaction<any,T>(presenter) : <Reaction<any>>null);
            var sectionHeight = perimeter.getHeight() / glyffs.length;
            var gapHeight = (inset ? inset.getPixels(sectionHeight) : 0);
            var glyffHeight = sectionHeight - gapHeight + gapHeight / glyffs.length;
            var stride = glyffHeight + gapHeight;
            var left = perimeter.left, right = perimeter.right, top = perimeter.top;
            for (var i = 0; i < glyffs.length; i++) {
                var glyff = glyffs[i];
                var bottom = top + glyffHeight;
                var glyffPerimeter = perimeter.at(left, top, right, bottom);
                presenter.addPresentation(glyff.present(glyffPerimeter, audience, presenter));
                if ((i + 1) < glyffs.length && gapGlyff) {
                    var gapPerimeter = perimeter.at(left, bottom, right, bottom + gapHeight);
                    presenter.addPresentation(gapGlyff.present(gapPerimeter, audience,
                        gapReaction));
                }
                top += stride;
            }
        }, depth)
    }
}

export interface Hall {
    present<U>(glyff : Glyff<U>, onResult? : OnResult<U>, onError? : OnError): Presentation;
}

export var ClearGlyff = Glyff.create<Void>(()=> {
}, 0);

export function colorPath(colorPath : number[], mix? : number,
                          colorPath2? : number[]) : Glyff<Void> {
    return Glyff.create((presenter : Presenter<Void>)=> {
        var perimeter = presenter.perimeter;
        var audience = presenter.audience;
        var color = perimeter.palette.get(colorPath);
        if (mix) {
            color = color.mix(mix, perimeter.palette.get(colorPath2));
        }
        var colorGlyff = Glyff.color(color);
        presenter.addPresentation(colorGlyff.present(perimeter, audience, null, null));
    }, 0);
}

export var RedGlyff = Glyff.color(Color.RED);
export var YellowGlyff = Glyff.color(Color.YELLOW);
export var GreenGlyff = Glyff.color(Color.GREEN);
export var CyanGlyff = Glyff.color(Color.CYAN);
export var BlueGlyff = Glyff.color(Color.BLUE);
export var MagentaGlyff = Glyff.color(Color.MAGENTA);
export var WhiteGlyff = Glyff.color(Color.WHITE);
export var BlackGlyff = Glyff.color(Color.BLACK);
export var GrayGlyff = Glyff.color(Color.GRAY);
export var BeigeGlyff = Glyff.color(Color.BEIGE);

