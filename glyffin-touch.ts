/**
 * Created by wehjin on 6/6/15.
 */

/// <reference path="glyffin.ts" />

module Glyffin {

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
                if (interactive.isHit(x, y)) {
                    hitInteractives.push(interactive);
                }
            });
            return hitInteractives;
        }
    }

    export function button(symbol? : string) : Glyff<string> {
        symbol = symbol || "button";
        return GreenGlyff.clicken(symbol, BlueGlyff);
    }
}