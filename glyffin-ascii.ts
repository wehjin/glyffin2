/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="glyffin.ts" />

module Glyffin {

    export function asciiEntireWord(word : string) : Glyff<Void> {
        var xWeightWidth = 5;
        var spaceWeights = word.length <= 1 ? 0 : (word.length - 1);
        var letterWeights = 0;
        for (var i = 0; i < word.length; i++) {
            letterWeights += x_weights[word.charCodeAt(i)];
        }
        var combinedWeights = letterWeights + spaceWeights;
        return Glyff.create({
            call(audience : Audience, presenter : Presenter<Void>) {
                var perimeter = audience.getPerimeter();
                var maxWeightWidth = perimeter.getWidth() / combinedWeights;
                var fittedWeightWidth = Math.min(xWeightWidth, maxWeightWidth);
                presenter.addPresentation(asciiWord(word,
                    fittedWeightWidth).present(audience, presenter));
            }
        });
    }

    export function asciiWord(word : string, xWeightWidth : number) {
        var insertions : Insertion<Void>[] = [];
        for (var i = 0; i < word.length; i++) {
            var code = word.charCodeAt(i);
            var capWidth = xWeightWidth * x_weights[code];
            if (i > 0) {
                insertions.push(new Insertion(xWeightWidth, Glyffin.ClearGlyff));
            }
            insertions.push(new Insertion(capWidth, Glyffin.asciiByCode(code)));
        }
        return GreenGlyff.insertLefts(insertions);
    }

    export function asciiChar(ch : string) : Glyff<Void> {
        return asciiByCode(ch.charCodeAt(0));
    }

    export function asciiByCode(code : number) : Glyff<Void> {
        var spots = ascii_spots[code];
        return BeigeGlyff.kaleido(x_weights[code], 7, spots);
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
    var D_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [1, 6], [2, 6], [3, 6]
    ];
    var E_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1],
        [0, 2], [1, 2], [2, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var F_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1],
        [0, 2], [1, 2], [2, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6]
    ];
    var G_spots = [
        [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1],
        [0, 2], [2, 2], [3, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var H_spots = [
        [0, 0], [4, 0],
        [0, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var I_spots = [
        [0, 0], [1, 0], [2, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [0, 6], [1, 6], [2, 6]
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
    var K_spots = [
        [0, 0], [4, 0],
        [0, 1], [3, 1],
        [0, 2], [1, 2], [2, 2],
        [0, 3], [3, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var L_spots = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var M_spots = [
        [0, 0], [4, 0],
        [0, 1], [1, 1], [3, 1], [4, 1],
        [0, 2], [2, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var N_spots = [
        [0, 0], [4, 0],
        [0, 1], [1, 1], [4, 1],
        [0, 2], [2, 2], [4, 2],
        [0, 3], [3, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var O_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var P_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [1, 2], [2, 2], [3, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6]
    ];
    var Q_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [3, 5],
        [1, 6], [2, 6], [4, 6]
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
    var S_spots = [
        [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1],
        [1, 2], [2, 2], [3, 2],
        [4, 3],
        [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var T_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [2, 6]
    ];
    var U_spots = [
        [0, 0], [4, 0],
        [0, 1], [4, 1],
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var V_spots = [
        [0, 0], [4, 0],
        [0, 1], [4, 1],
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [1, 4], [3, 4],
        [1, 5], [3, 5],
        [2, 6]
    ];
    var W_spots = [
        [0, 0], [4, 0],
        [0, 1], [4, 1],
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [2, 4], [4, 4],
        [0, 5], [1, 5], [3, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var X_spots = [
        [0, 0], [4, 0],
        [1, 1], [3, 1],
        [2, 2],
        [1, 3], [3, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var Y_spots = [
        [0, 0], [4, 0],
        [1, 1], [3, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [2, 6],
    ];
    var Z_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
        [4, 1],
        [3, 2],
        [2, 3],
        [1, 4],
        [0, 5],
        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6]
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

        no_spots, A_spots, B_spots, C_spots, D_spots, E_spots, F_spots, G_spots,
        H_spots, I_spots, J_spots, K_spots, L_spots, M_spots, N_spots, O_spots,
        P_spots, Q_spots, R_spots, S_spots, T_spots, U_spots, V_spots, W_spots,
        X_spots, Y_spots, Z_spots, no_spots, no_spots, no_spots, no_spots, no_spots,

        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
    ];

    var x_weights = [
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,

        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,

        5, 5, 5, 5, 5, 5, 5, 5,
        5, 3, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,

        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
    ]
}