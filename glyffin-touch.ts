/**
 * Created by wehjin on 6/6/15.
 */

/// <reference path="glyffin.ts" />

module Glyffin {

    export function button(symbol? : string) : Glyff<string> {
        symbol = symbol || "button";
        return GreenGlyff.clicken(symbol, BlueGlyff);
    }
}