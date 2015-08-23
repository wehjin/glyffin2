/**
 * Created by wehjin on 6/6/15.
 */
import Glyffin = require("./glyffin");
import Perimeter = Glyffin.Perimeter;
import Gesturable = Glyffin.Gesturable;
export declare class Interactive {
    bounds: Perimeter;
    touchProvider: Gesturable;
    constructor(bounds: Perimeter, touchProvider: Gesturable);
    isHit(touchX: number, touchY: number): boolean;
    static findHits(all: Interactive[], x: number, y: number): Interactive[];
}
export declare function button(symbol?: string): Glyffin.Glyff<string>;
