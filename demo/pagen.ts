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

    canvas.style.position = "absolute";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.overflow = "hidden";
    canvas.style.touchAction = "none";

    var glAudience = new Glyffin.GlAudience(canvas);

    var backColors = [Color.RED, Color.GREEN, Color.BLUE];
    var pageGlyffs = [];
    backColors.forEach((color)=> {
        pageGlyffs.push(Glyff.color(color));
    });

    function getPageGlyff(index : number) : Glyff<Void> {
        return (index >= 0 && index < pageGlyffs.length) ? pageGlyffs[index] : null;
    }

    var palette = new Glyffin.Palette();
    var screenWidth = glAudience.canvas.width;
    var perimeter = new Glyffin.Perimeter(0, 0, screenWidth, glAudience.canvas.height, 1, 0);
    var metrics = new Glyffin.Metrics(perimeter, 48, 13, palette);

    var index = 0;

    function incrIndex() {
        if ((index + 1) < pageGlyffs.length) {
            index = index + 1;
        }
    }

    function decrIndex() {
        if ((index - 1) >= 0) {
            index = index - 1;
        }
    }

    var presentation;

    function refresh() {
        if (presentation) {
            presentation.end();
        }

        var pageGlyff = getPageGlyff(index);
        var pagesGlyff = pageGlyff.pagen(index, getPageGlyff(index + 1), getPageGlyff(index - 1),
            pageGlyff);

        var app = Glyffin.BlackGlyff.addNearMajor(1, pagesGlyff);
        presentation = app.present(metrics, glAudience, (symbol)=> {
            console.log("%s", symbol);
            if (symbol === "next") {
                incrIndex();
                refresh();
            } else if (symbol === "back") {
                decrIndex();
                refresh();
            }
        });
    }

    refresh();
}

