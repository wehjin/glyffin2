/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="glyffin.ts" />

module Glyffin {
    export function asciiByCode(code : number) : Glyff<Void> {
        var spots = ascii_spots[code];
        return RedGlyff.kaleido(5, 7, spots);
    }

    var no_spots = [];
    var A_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var B_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [1, 6], [2, 6], [3, 6]
    ];
    var C_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var J_spots = [
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var R_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var ascii_spots = [
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,

        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,

        no_spots, A_spots, B_spots, C_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, J_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, R_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,

        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
    ];
}