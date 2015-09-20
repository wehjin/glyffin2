///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */

import {Inset2, GlRoom, GlAudience, Atlas} from "../src/glyffin-all";

var canvas = <HTMLCanvasElement>document.getElementById("webgl");
var atlas = new Atlas();
document.body.removeChild(canvas);
document.body.appendChild(atlas.image);
