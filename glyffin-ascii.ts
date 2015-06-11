/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="glyffin.ts" />

module Glyffin {

    class LineContent {

        constructor(public weight : number, public text : string) {
        }
    }

    export function asciiMultiLine(lines : number, paragraph : string) : Glyff<Void> {
        return Glyff.create({
            call(audience : Audience, presenter : Presenter<Void>) {
                var perimeter = audience.getPerimeter();
                var linesAndLeadings = (lines * 2 - 1);
                var ascentPixels = perimeter.getHeight() / linesAndLeadings;
                var lineHeight = ascentPixels * 2;
                var xWeightPixels = ascentPixels / 7;
                var width = perimeter.getWidth();
                var xWeightsPerLine = Math.floor(width / xWeightPixels);

                var lineContents : LineContent[] = [];
                var currentLine : LineContent = null;
                var beginLine = (wordWeight : number, word : string)=> {
                    currentLine = new LineContent(wordWeight, word);
                    lineContents.push(currentLine);
                    if (wordWeight >= xWeightsPerLine && lineContents.length < lines) {
                        currentLine = null;
                    }
                };

                var words = paragraph.trim().split(/\s+/);
                words.forEach((word : string)=> {
                    var wordWeight = getWordXWeight(word);
                    if (wordWeight == 0) {
                        return;
                    }

                    if (!currentLine) {
                        beginLine(wordWeight, word);
                        return;
                    }

                    var newLineWeight = spaceWeight + wordWeight + currentLine.weight;
                    if (newLineWeight < xWeightsPerLine || lineContents.length == lines) {
                        currentLine.weight = newLineWeight;
                        currentLine.text += ' ' + word;
                        return;
                    }

                    beginLine(wordWeight, word);
                });

                var lineNumber = 0;
                lineContents.forEach((lineContent : LineContent)=> {
                    var lineAudience = new PerimeterAudience(perimeter.downFromTop(lineNumber *
                        lineHeight, ascentPixels), audience);
                    presenter.addPresentation(asciiEntireWord(lineContent.text).present(lineAudience,
                        presenter));
                    lineNumber++;
                });
            }
        });
    }

    export function asciiEntireWord(word : string) : Glyff<Void> {
        var wordXWeight = getWordXWeight(word);
        return Glyff.create({
            call(audience : Audience, presenter : Presenter<Void>) {
                var perimeter = audience.getPerimeter();
                var wordXWeightPixels = perimeter.getWidth() / wordXWeight;
                var preferredWeightPixels = perimeter.getHeight() / 7;
                var fittedWeightPixels = Math.min(preferredWeightPixels, wordXWeightPixels);
                presenter.addPresentation(asciiWord(word,
                    fittedWeightPixels).present(audience, presenter));
            }
        });
    }

    export function asciiWord(word : string, xWeightPixels : number) {
        var insertions : Insertion<Void>[] = [];
        for (var i = 0; i < word.length; i++) {
            var code = word.charCodeAt(i);
            var capWidth = xWeightPixels * x_weights[code];
            if (i > 0) {
                insertions.push(new Insertion(xWeightPixels, Glyffin.ClearGlyff));
            }
            insertions.push(new Insertion(capWidth, Glyffin.asciiByCode(code)));
        }
        return GreenGlyff.addLefts(insertions);
    }

    export function asciiChar(ch : string) : Glyff<Void> {
        return asciiByCode(ch.charCodeAt(0));
    }

    export function asciiByCode(code : number) : Glyff<Void> {
        var spots = ascii_spots[code];
        return BeigeGlyff.kaleid(x_weights[code], 7, spots);
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
    var a_spots = [
        [1, 2], [2, 2], [3, 2],
        [4, 3],
        [1, 4], [2, 4], [3, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var b_spots = [
        [0, 0],
        [0, 1],
        [0, 2], [2, 2], [3, 2],
        [0, 3], [1, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [1, 6], [2, 6], [3, 6]
    ];
    var c_spots = [
        [1, 2], [2, 2], [3, 2],
        [0, 3], [4, 3],
        [0, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var d_spots = [
        [4, 0],
        [4, 1],
        [1, 2], [2, 2], [4, 2],
        [0, 3], [3, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var e_spots = [
        [1, 2], [2, 2], [3, 2],
        [0, 3], [4, 3],
        [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
        [0, 5],
        [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var f_spots = [
        [2, 0], [3, 0],
        [1, 1],
        [0, 2], [1, 2], [2, 2], [3, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [1, 6]
    ];
    var g_spots = [
        [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [1, 5], [2, 5], [3, 5], [4, 5],
        [4, 6],
        [0, 7], [1, 7], [2, 7], [3, 7]
    ];
    var h_spots = [
        [0, 0],
        [0, 1],
        [0, 2], [2, 2], [3, 2],
        [0, 3], [1, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var i_spots = [
        [0, 0],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6]
    ];
    var j_spots = [
        [4, 0],
        [4, 2],
        [4, 3],
        [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6],
        [1, 7], [2, 7], [3, 7]
    ];
    var k_spots = [
        [0, 0],
        [0, 1],
        [0, 2], [3, 2],
        [0, 3], [2, 3],
        [0, 4], [1, 4],
        [0, 5], [2, 5],
        [0, 6], [3, 6]
    ];
    var l_spots = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 6]
    ];
    var m_spots = [
        [0, 2], [1, 2], [3, 2],
        [0, 3], [2, 3], [4, 3],
        [0, 4], [2, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var n_spots = [
        [0, 2], [1, 2], [2, 2], [3, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var o_spots = [
        [1, 2], [2, 2], [3, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var p_spots = [
        [0, 2], [2, 2], [3, 2],
        [0, 3], [1, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [1, 5], [2, 5], [3, 5],
        [0, 6],
        [0, 7]
    ];
    var q_spots = [
        [1, 2], [2, 2], [4, 2],
        [0, 3], [3, 3], [4, 3],
        [0, 4], [4, 4],
        [1, 5], [2, 5], [3, 5], [4, 5],
        [4, 6],
        [4, 7],
    ];
    var r_spots = [
        [0, 2], [2, 2], [3, 2],
        [0, 3], [1, 3], [4, 3],
        [0, 4],
        [0, 5],
        [0, 6]
    ];
    var s_spots = [
        [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 3],
        [1, 4], [2, 4], [3, 4],
        [4, 5],
        [0, 6], [1, 6], [2, 6], [3, 6]
    ];
    var t_spots = [
        [1, 0],
        [0, 1], [1, 1], [2, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 6]
    ];
    var u_spots = [
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var v_spots = [
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [1, 5], [3, 5],
        [2, 6]
    ];
    var w_spots = [
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [2, 4], [4, 4],
        [0, 5], [2, 5], [4, 5],
        [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var x_spots = [
        [0, 2], [4, 2],
        [1, 3], [3, 3],
        [2, 4],
        [1, 5], [3, 5],
        [0, 6], [4, 6]
    ];
    var y_spots = [
        [0, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [4, 4],
        [1, 5], [2, 5], [3, 5], [4, 5],
        [4, 6],
        [0, 7], [1, 7], [2, 7], [3, 7]
    ];
    var z_spots = [
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [3, 3],
        [2, 4],
        [1, 5],
        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var d0_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [3, 2], [4, 2],
        [0, 3], [2, 3], [4, 3],
        [0, 4], [1, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var d1_spots = [
        [2, 0],
        [1, 1], [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var d2_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [4, 2],
        [2, 3], [3, 3],
        [1, 4],
        [0, 5],
        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6]
    ];
    var d3_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [4, 2],
        [2, 3], [3, 3],
        [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var d4_spots = [
        [3, 0], [4, 0],
        [2, 1], [4, 1],
        [1, 2], [4, 2],
        [0, 3], [4, 3],
        [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
        [4, 5],
        [4, 6]
    ];
    var d5_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1],
        [0, 2], [1, 2], [2, 2], [3, 2],
        [4, 3],
        [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var d6_spots = [
        [2, 0], [3, 0],
        [1, 1],
        [0, 2],
        [0, 3], [1, 3], [2, 3], [3, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var d7_spots = [
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1], [4, 1],
        [4, 2],
        [3, 3],
        [2, 4],
        [2, 5],
        [2, 6]
    ];
    var d8_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [4, 2],
        [1, 3], [2, 3], [3, 3],
        [0, 4], [4, 4],
        [0, 5], [4, 5],
        [1, 6], [2, 6], [3, 6]
    ];
    var d9_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [0, 2], [4, 2],
        [1, 3], [2, 3], [3, 3], [4, 3],
        [4, 4],
        [3, 5],
        [1, 6], [2, 6]
    ];

    var ascii_spots = [
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,

        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        d0_spots, d1_spots, d2_spots, d3_spots, d4_spots, d5_spots, d6_spots, d7_spots,
        d8_spots, d9_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,

        no_spots, A_spots, B_spots, C_spots, D_spots, E_spots, F_spots, G_spots,
        H_spots, I_spots, J_spots, K_spots, L_spots, M_spots, N_spots, O_spots,
        P_spots, Q_spots, R_spots, S_spots, T_spots, U_spots, V_spots, W_spots,
        X_spots, Y_spots, Z_spots, no_spots, no_spots, no_spots, no_spots, no_spots,

        no_spots, a_spots, b_spots, c_spots, d_spots, e_spots, f_spots, g_spots,
        h_spots, i_spots, j_spots, k_spots, l_spots, m_spots, n_spots, o_spots,
        p_spots, q_spots, r_spots, s_spots, t_spots, u_spots, v_spots, w_spots,
        x_spots, y_spots, z_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
    ];

    var x_weights : number[] = [
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

        5, 5, 5, 5, 5, 5, 4, 5,
        5, 1, 5, 4, 2, 5, 5, 5,
        5, 5, 5, 5, 3, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
    ];

    function getWordXWeight(word : string) : number {
        var spaceWeights = word.length <= 1 ? 0 : (word.length - 1);
        var letterWeights = 0;
        for (var i = 0; i < word.length; i++) {
            var charCode = word.charCodeAt(i);
            letterWeights += x_weights[charCode];
        }
        return letterWeights + spaceWeights;
    }

    var spaceWeight = getWordXWeight(' ');
}