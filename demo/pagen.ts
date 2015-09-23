/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="../rx.ts" />

import {Inset1} from "../glyffin-type";
import Glyffin=require("../glyffin");
import GlyffinGl = require("../glyffin-gl");
import Void = Glyffin.Void;
import Glyff = Glyffin.Glyff;
import Color = Glyffin.Color;

var room = new GlyffinGl.GlRoom(<HTMLCanvasElement>document.getElementById('webgl'));
var glAudience = new GlyffinGl.GlAudience(room);

var backColors = [Color.RED, Color.GREEN, Color.BLUE];
var pageGlyffs = [];
backColors.forEach((color)=> {
    pageGlyffs.push(Glyff.color(color));
});

function getPageGlyff(index : number) : Glyff<string> {
    var page = (index >= 0 && index < pageGlyffs.length) ? pageGlyffs[index] : null;
    if (!page) {
        return null;
    }
    return page.clicken("drill").revealDown(new Inset1(.3, 0), Glyffin.BlackGlyff);
}

room.perimeter.readHeight = 13;
var perimeter = room.perimeter;
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

    var page = getPageGlyff(index);
    var pages = page.stackNearLeft(getPageGlyff(index + 1), getPageGlyff(index - 1));
    var app = Glyffin.BlackGlyff.addNearMajor(1, pages);
    presentation = app.present(perimeter, glAudience, (symbol)=> {
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


