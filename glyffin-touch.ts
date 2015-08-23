/**
 * Created by wehjin on 6/6/15.
 */

import Glyffin = require("./glyffin");
import Perimeter = Glyffin.Perimeter;
import Gesturable = Glyffin.Gesturable;

export class Interactive {
    constructor(public bounds : Perimeter, public touchProvider : Gesturable) {
    }

    isHit(touchX : number, touchY : number) : boolean {
        return this.bounds.left <= touchX &&
            this.bounds.right >= touchX &&
            this.bounds.top <= touchY &&
            this.bounds.bottom >= touchY;
    }

    static findHits(all : Interactive[], x : number, y : number) : Interactive[] {
        var hitInteractives : Interactive[] = [];
        all.forEach((interactive : Interactive)=> {
            var isHit = interactive.isHit(x, y);
            if (isHit) {
                hitInteractives.push(interactive);
            }
        });
        hitInteractives.sort((a : Interactive, b : Interactive) : number=> {
            return -(a.bounds.level - b.bounds.level);
        });
        return hitInteractives;
    }
}

export function button(symbol? : string) : Glyffin.Glyff<string> {
    symbol = symbol || "button";
    return Glyffin.GreenGlyff.clicken(symbol, Glyffin.BlueGlyff);
}
