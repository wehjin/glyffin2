import {
    Glyff,Color, Spot,Gesturing, Gesturable, GestureStatus, OnError, OnResult, Perimeter,
    Patch, Reaction, Presentation, Zone, Palette, Audience, EMPTY_PRESENTATION, EMPTY_PATCH, Hall
} from "./glyffin";
import {SpotObservable} from "./glyffin-html";
import {Interactive} from "./glyffin-touch";

export declare class GlRoom {
}


export declare class GlAudience implements Audience {
    addPatch(bounds : Perimeter, color : Color) : Patch;

    addZone(bounds : Perimeter, touchProvider : Gesturable) : Zone;

    present<U>(glyff : Glyff<U>, reactionOrOnResult : any, onError : OnError) : Presentation;
}
