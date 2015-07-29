/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="../webglbook.d.ts" />
/// <reference path="../glyffin.ts" />
/// <reference path="../glyffin-ascii.ts" />
/// <reference path="../glyffin-gl.ts" />
/// <reference path="../glyffin-touch.ts" />
/// <reference path="../rx.ts" />

import Void = Glyffin.Void;
import Glyff = Glyffin.Glyff;
import Color = Glyffin.Color;

function main() {
    var canvas = <HTMLCanvasElement>document.getElementById('webgl');
    var glHall = new Glyffin.GlHall(canvas);

    glHall.present(Glyffin.RedGlyff, ()=> {
    }, (err : Error)=> {
        console.error(err);
    });
}

