/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    function asciiString(str) {
        var insertions = [];
        var xWeightWidth = 5;
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            var capWidth = xWeightWidth * x_weights[code];
            insertions.push(new Glyffin.Insertion(capWidth, Glyffin.asciiByCode(code)));
            insertions.push(new Glyffin.Insertion(xWeightWidth, Glyffin.ClearGlyff));
        }
        return Glyffin.RedGlyff.insertLefts(insertions);
    }
    Glyffin.asciiString = asciiString;
    function asciiChar(ch) {
        return asciiByCode(ch.charCodeAt(0));
    }
    Glyffin.asciiChar = asciiChar;
    function asciiByCode(code) {
        var spots = ascii_spots[code];
        return Glyffin.RedGlyff.kaleido(x_weights[code], 7, spots);
    }
    Glyffin.asciiByCode = asciiByCode;
    var no_spots = [];
    var A_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var B_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var C_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var D_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var E_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var F_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6]
    ];
    var G_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 1],
        [0, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var H_spots = [
        [0, 0],
        [4, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var I_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [0, 6],
        [1, 6],
        [2, 6]
    ];
    var J_spots = [
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var K_spots = [
        [0, 0],
        [4, 0],
        [0, 1],
        [3, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [0, 3],
        [3, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var R_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var ascii_spots = [
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        A_spots,
        B_spots,
        C_spots,
        D_spots,
        E_spots,
        F_spots,
        G_spots,
        H_spots,
        I_spots,
        J_spots,
        K_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        R_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
    ];
    var x_weights = [
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        3,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
        5,
    ];
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-ascii.js.map