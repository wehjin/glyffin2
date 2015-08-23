/**
 * Created by wehjin on 7/2/15.
 */
import Glyffin = require("./glyffin");
import Spot = Glyffin.Spot;
export interface SpotObserver {
    onStart(spot: Spot): boolean;
    onMove(spot: Spot): boolean;
    onEnd(): any;
    onCancel(): any;
}
export declare class SpotObservable {
    private element;
    constructor(element: HTMLElement);
    subscribe(spotObserver: SpotObserver): () => void;
    private getMouseSpot(ev);
}
