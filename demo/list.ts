///<reference path="../src/glyffin-all.d.ts"/>
/**
 * Created by wehjin on 5/24/15.
 */

import {
    Glyff, Void, Presenter, Inset2, Inset1, Perimeter, EMPTY_REMOVABLE, Spot, Gesturing,
    GlRoom, GlAudience, asciiMultiLine, VerticalGesturing,
    RedGlyff, BlueGlyff, GreenGlyff, ClearGlyff,
} from "../src/glyffin-all";

var room = new GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var audience = new GlAudience(room);
var perimeter = room.perimeter;
var cells = [RedGlyff, BlueGlyff, GreenGlyff];
var cellHeight = new Inset1(.27, 0);

function getMaxDepth(glyffs : Glyff<any>[]) : number {
    var depth = 0;
    for (var i = 0; i < glyffs.length; i++) {
        depth = Math.max(depth, glyffs[i].depth);
    }
    return depth;
}

function listStatic(cellGlyffs : Glyff<Void>[], centerPerimeter : Perimeter,
                    dividerPixelsHigh : number, scrollPixels : number) : Glyff<Void> {
    if (cellGlyffs.length === 0) {
        return ClearGlyff;
    }
    if (cellGlyffs.length === 1) {
        var cellGlyff = cellGlyffs[0];
        return Glyff.create((lower : Presenter<Void>)=> {
            lower.addPresentation(cellGlyff.present(centerPerimeter, lower.audience, lower));
        }, cellGlyff.depth);
    }
    var cellCount = cellGlyffs.length;
    return Glyff.create((lower : Presenter<Void>)=> {
        var cellPixelsHigh = centerPerimeter.getHeight();
        var cellAndDividerPixelsHigh = cellPixelsHigh + dividerPixelsHigh;
        for (var i = 0; i < cellCount; i++) {
            var cellGlyff = cellGlyffs[i];
            var cellShift = i * cellAndDividerPixelsHigh - scrollPixels;
            var cellPerimeter = centerPerimeter.translateY(cellShift);
            lower.addPresentation(cellGlyff.present(cellPerimeter, lower.audience, lower));
        }
    }, getMaxDepth(cellGlyffs));
}

function list(cellGlyffs : Glyff<Void>[], cellHeight : Inset1) : Glyff<Void> {
    var dividerPixelsHigh = 10;
    return Glyff.create((lower : Presenter<Void>)=> {
        var listPerimeter = lower.perimeter;
        var listPixelsHigh = listPerimeter.getHeight();
        var cellPixelsHigh = cellHeight.getPixels(listPixelsHigh);
        var centerPerimeter = listPerimeter.withHeight(cellPixelsHigh, .5);
        var viewPresentation = EMPTY_REMOVABLE;

        var maxScrollUpAt0 = (cellPixelsHigh + dividerPixelsHigh) * (cellGlyffs.length - 1);
        var maxScrollDownAt0 = 0;

        var currentScrollUp = 0;
        var extraScrollUp = 0;
        var maxScrollUp = maxScrollUpAt0;
        var maxScrollDown = maxScrollDownAt0;

        function presentView() {
            var scrollPixels = currentScrollUp + extraScrollUp;
            var view = listStatic(cellGlyffs, centerPerimeter, dividerPixelsHigh, scrollPixels);
            viewPresentation.remove();
            viewPresentation =
                lower.addPresentation(view.present(listPerimeter, lower.audience, lower));
        }

        presentView();
        lower.audience.addZone(listPerimeter, {
            init: (spot : Spot) : Gesturing => {
                return new VerticalGesturing(spot, listPerimeter.readHeight, 0,
                    (pixelsMoved : number)=> {
                        // Started
                        var rawExtraUp = -pixelsMoved;
                        extraScrollUp = Math.min(maxScrollUp, Math.max(-maxScrollDown, rawExtraUp));
                        presentView();
                    }, ()=> {
                        // Cancelled
                        extraScrollUp = 0;
                        presentView();
                    }, ()=> {
                        // Completed
                        currentScrollUp = currentScrollUp + extraScrollUp;
                        extraScrollUp = 0;
                        maxScrollUp = maxScrollUpAt0 - currentScrollUp;
                        maxScrollDown = maxScrollDownAt0 + currentScrollUp;
                    })
            }
        });
    }, getMaxDepth(cellGlyffs));
}

list(cells, cellHeight).present(perimeter, audience);
