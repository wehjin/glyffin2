/// <reference path="webglbook.d.ts" />
/**
 * Created by wehjin on 5/24/15.
 */
export declare class Void {
}
export declare class Inset1 {
    fraction: number;
    fixed: number;
    constructor(fraction: number, fixed: number);
    getPixels(whole: number): number;
}
export declare class Inset2 {
    x: Inset1;
    y: Inset1;
    constructor(fractionX: number, fixedX: number, fractionY: number, fixedY: number);
    static QUARTER: Inset2;
    static EIGHTH: Inset2;
}
export declare class Spot {
    x: number;
    y: number;
    constructor(x: number, y: number);
    gridDistance(other: Spot): number;
    xDistance(origin: Spot): number;
    yDistance(origin: Spot): number;
    addX(addition: number): Spot;
    addY(addition: number): Spot;
}
export declare class Perimeter {
    left: number;
    top: number;
    right: number;
    bottom: number;
    age: number;
    level: number;
    tapHeight: number;
    readHeight: number;
    palette: Palette;
    constructor(left: number, top: number, right: number, bottom: number, age: number, level: number, tapHeight: number, readHeight: number, palette: Palette);
    getHeight(): number;
    getWidth(): number;
    at(left: number, top: number, right: number, bottom: number): Perimeter;
    withAge(age: number): Perimeter;
    withLevel(level: number): Perimeter;
    addLevel(add: number): Perimeter;
    translateX(x: number): Perimeter;
    translateY(y: number): Perimeter;
    inset(pixelsX: number, pixelsY: number): Perimeter;
    inset2(inset: Inset2): Perimeter;
    downFromTop(pixelsY: number, pixelsHigh: number): Perimeter;
    rightFromLeft(pixelsX: number, pixelsWide: number): Perimeter;
    resizeFromTop(pixelsHigh: number): Perimeter;
    splitHeight(pixels: number): Perimeter[];
    splitWidth(pixels: number): Perimeter[];
    limitHeight(maxHeight: number, align: number): Perimeter;
    limitWidth(maxWidth: number, align: number): Perimeter;
}
export declare class Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;
    constructor(red: number, green: number, blue: number, alpha: number);
    static WHITE: Color;
    static BLACK: Color;
    static RED: Color;
    static YELLOW: Color;
    static GREEN: Color;
    static CYAN: Color;
    static BLUE: Color;
    static MAGENTA: Color;
    static BEIGE: Color;
    static GRAY: Color;
    static get(red: number, green: number, blue: number, alpha: number): Color;
    static getMany(hexRgbas: number[][]): Color[];
    private static mixComponent(mix, start, end);
    mix(mix: number, endColor: Color): Color;
    darken(mix: number): Color;
    lighten(mix: number): Color;
    neutralize(mix: number): Color;
}
export declare class Palette {
    private colors;
    constructor(colors?: Color[][]);
    withLevel(level: number, hexRgbas: number[][]): Palette;
    get(colorPath: number[]): Color;
}
export declare class Stage {
    perimeter: Perimeter;
    constructor(perimeter: Perimeter);
}
export interface Removable {
    remove(): any;
}
export declare var EMPTY_REMOVABLE: {
    remove(): void;
};
export interface Patch extends Removable {
}
export interface Zone extends Removable {
}
export declare var EMPTY_PATCH: Patch;
export declare var EMPTY_ACTIVE: Zone;
export declare enum GestureStatus {
    CHARGING = 0,
    CHARGED = 1,
    SUPERCHARGED = 2,
    DRAINED = 3,
}
export interface Gesturable {
    init(spot: Spot): Gesturing;
}
export interface Gesturing {
    isDrained(): boolean;
    isPowered(): boolean;
    move(spot: Spot): GestureStatus;
    release(): any;
    cancel(): any;
}
export declare type ErrorCallback = (error: Error) => void;
export interface OnError {
    (err: Error): void;
}
export interface OnResult<T> {
    (result: T): void;
}
export interface Reaction<T> {
    onResult(result: T): any;
    onError(error: Error): any;
}
export interface Presentation {
    end(): any;
}
export declare var EMPTY_PRESENTATION: Presentation;
export declare class NoResultReaction<T, U> implements Reaction<T> {
    private reaction;
    constructor(reaction: Reaction<U>);
    onResult(result: T): void;
    onError(error: Error): void;
}
export declare class SpeedometerX {
    private spots;
    private times;
    private count;
    constructor(spot: Spot);
    addSpot(spot: Spot): void;
    getVelocity(): number;
    getCount(): number;
    private getVelocity1();
    private getVelocity2();
}
export declare class PagenGesturing implements Gesturing {
    private downSpot;
    private minCharging;
    private onStarted;
    private onCanceled;
    private onFinished;
    private drained;
    private sliding;
    private speedometer;
    constructor(downSpot: Spot, minCharging: number, onStarted: (pixelsMoved: number) => void, onCanceled: () => void, onFinished: (velocity: number) => void);
    isDrained(): boolean;
    isPowered(): boolean;
    move(spot: Spot): GestureStatus;
    release(): void;
    cancel(): void;
}
export declare class HorizontalGesturing implements Gesturing {
    private downSpot;
    private chargingSize;
    private chargingDirection;
    private onStarted;
    private onCanceled;
    private onFinished;
    private startSpot;
    private drained;
    private direction;
    constructor(downSpot: Spot, chargingSize: number, chargingDirection: number, onStarted: (pixelsMoved: number) => void, onCanceled: () => void, onFinished: () => void);
    isDrained(): boolean;
    isPowered(): boolean;
    move(spot: Spot): GestureStatus;
    release(): void;
    cancel(): void;
}
export declare class VerticalGesturing implements Gesturing {
    private downSpot;
    private minMove;
    private onStarted;
    private onCanceled;
    private onFinished;
    private startSpot;
    private drained;
    constructor(downSpot: Spot, minMove: number, onStarted: (down: number) => void, onCanceled: () => void, onFinished: () => void);
    isDrained(): boolean;
    isPowered(): boolean;
    move(spot: Spot): GestureStatus;
    release(): void;
    cancel(): void;
}
export interface Audience {
    addPatch(bounds: Perimeter, color: Color): Patch;
    addZone(bounds: Perimeter, touchProvider: Gesturable): Zone;
    present<U>(glyff: Glyff<U>, reactionOrOnResult?: Reaction<U> | OnResult<U>, onError?: OnError): Presentation;
}
export interface Presenter<T> extends Reaction<T>, Presentation {
    perimeter: Perimeter;
    audience: Audience;
    addPresentation(presentation: Presentation): Removable;
}
export interface OnPresent<T> {
    (presenter: Presenter<T>): any;
}
export interface Lifter<U, T> {
    (lowerPresenter: Presenter<U>): Presenter<T>;
}
export interface Transformer<U, T> {
    (higher: Glyff<T>): Glyff<U>;
}
export declare class Insertion<T> {
    amount: number;
    glyff: Glyff<T>;
    constructor(amount: number, glyff: Glyff<T>);
}
export declare class Glyff<T> {
    private onPresent;
    depth: number;
    constructor(onPresent: OnPresent<T>);
    static create<U>(onPresent: OnPresent<U>, depth: number): Glyff<U>;
    present(perimeter: Perimeter, audience: Audience, reactionOrOnResult?: Reaction<T> | OnResult<T>, onError?: ErrorCallback): Presentation;
    lift<U>(lifter: Lifter<U, T>, depth?: number): Glyff<U>;
    rebuild<U>(builder: Transformer<U, T>): Glyff<U>;
    disappear(disappeared: boolean): Glyff<T>;
    isolate(isolated: boolean): Glyff<T>;
    addLefts(insertions: Insertion<T>[]): Glyff<T>;
    splitWidthCombine(size: number, glyff: Glyff<T>): Glyff<T>;
    splitHeight<U>(size: number, topGlyff: Glyff<U>): Glyff<T | U>;
    splitHeightYield<U>(size: number, topGlyff: Glyff<U>): Glyff<U>;
    splitHeightRetain<U>(size: number, addGlyff: Glyff<U>): Glyff<T>;
    over<U>(farGlyph: Glyff<U>, dz?: number): Glyff<T | U>;
    addNearMajor<U>(level: number, nearGlyff: Glyff<U>): Glyff<U>;
    revealDown<U>(inset: Inset1, revelation: Glyff<U>): Glyff<T | U | string>;
    limitWidth(maxWidth: number, align: number): Glyff<T>;
    limitHeight(maxHeight: number, align: number): Glyff<T>;
    kaleid(columns: number, rows: number, spots: number[][]): Glyff<Void>;
    pad(xPixels: number, yPixels: number): Glyff<T>;
    pad2(inset: Inset2): Glyff<T>;
    moveX(x: number): Glyff<T>;
    moveY(y: number): Glyff<T>;
    clicken<U>(symbol: string, pressed?: Glyff<U>): Glyff<string>;
    stackNearLeft<R, S>(far: Glyff<R>, nearLeft: Glyff<S>): Glyff<string | T>;
    stackNearRight<R, S>(far: Glyff<R>, nearRight: Glyff<S>): Glyff<string | T>;
    private animateWithPath(path);
    animate(duration: number): Glyff<T>;
    pulseAnimate(duration: number, count: number): Glyff<T>;
    static color(color: Color): Glyff<Void>;
    static colorAnimation(first: Color, last: Color): Glyff<Void>;
    static divideWidth<T>(glyffs: Glyff<T>[], inset?: Inset1, gapGlyff?: Glyff<any>): Glyff<T>;
    static divideHeight<T>(glyffs: Glyff<T>[], inset?: Inset1, gapGlyff?: Glyff<any>): Glyff<T>;
}
export interface Hall {
    present<U>(glyff: Glyff<U>, onResult?: OnResult<U>, onError?: OnError): Presentation;
}
export declare var ClearGlyff: Glyff<Void>;
export declare function colorPath(colorPath: number[], mix?: number, colorPath2?: number[]): Glyff<Void>;
export declare var RedGlyff: Glyff<Void>;
export declare var YellowGlyff: Glyff<Void>;
export declare var GreenGlyff: Glyff<Void>;
export declare var CyanGlyff: Glyff<Void>;
export declare var BlueGlyff: Glyff<Void>;
export declare var MagentaGlyff: Glyff<Void>;
export declare var WhiteGlyff: Glyff<Void>;
export declare var BlackGlyff: Glyff<Void>;
export declare var GrayGlyff: Glyff<Void>;
export declare var BeigeGlyff: Glyff<Void>;
