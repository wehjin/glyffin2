import {Spot} from "./glyffin-type";
import {
    Glyff,Color, Gesturing, Gesturable, GestureStatus, OnError, OnResult, Perimeter,
    Patch, Reaction, Presentation, Zone, Palette, Audience, EMPTY_PRESENTATION, EMPTY_PATCH, Hall
} from "./glyffin";
import {SpotObservable} from "./glyffin-html";
import {Interactive} from "./glyffin-touch";

declare class GlRoom {
}

declare class GlAudience implements Audience {
    addPatch(bounds : Perimeter, color : Color, codePoint : number) : Patch;

    addZone(bounds : Perimeter, touchProvider : Gesturable) : Zone;

    willDraw() : boolean;

    present<U>(glyff : Glyff<U>, reactionOrOnResult : any, onError : OnError) : Presentation;
}
