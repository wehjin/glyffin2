/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "./glyffin"], function (require, exports, glyffin_1) {
    // TODO: Add horizontal alignment
    var LineContent = (function () {
        function LineContent(weight, text) {
            this.weight = weight;
            this.text = text;
        }
        return LineContent;
    })();
    function getAsciiCode(charCode) {
        if (charCode < exports.x_weights.length) {
            return charCode;
        }
        if (charCode == 0x2019) {
            return 39; //single quote
        }
        else if (charCode === 0x2013) {
            return 45; //minus
        }
        else if (charCode === 0x201C || charCode === 0x201D) {
            return 34; //double quote
        }
        return 0;
    }
    function getCharXWeight(charCode) {
        var asciiCode = getAsciiCode(charCode);
        return exports.x_weights[asciiCode];
    }
    function getWordXWeight(word) {
        var spaceWeights = word.length <= 1 ? 0 : (word.length - 1);
        var letterWeights = 0;
        for (var i = 0; i < word.length; i++) {
            letterWeights += getCharXWeight(word.charCodeAt(i));
        }
        return letterWeights + spaceWeights;
    }
    function asciiByCode(code, base) {
        var asciiCode = getAsciiCode(code);
        return base.kaleid(exports.x_weights[asciiCode], 7, ascii_spots[asciiCode]);
    }
    exports.asciiByCode = asciiByCode;
    var MultiLines = (function () {
        function MultiLines(maxWidthPixels, maxHeightPixels, lines, paragraph) {
            var linesAndLeadings = (lines * 2 - 1);
            var ascentPixels = maxHeightPixels / linesAndLeadings;
            var lineStride = ascentPixels * 2;
            var xWeightPixels = ascentPixels / 7;
            var xWeightsPerLine = Math.floor(maxWidthPixels / xWeightPixels);
            var lineContents = [];
            var currentLine = null;
            function beginLine(wordWeight, word) {
                currentLine = new LineContent(wordWeight, word);
                lineContents.push(currentLine);
                if (wordWeight >= xWeightsPerLine && lineContents.length < lines) {
                    currentLine = null;
                }
            }
            this.lineContents = lineContents;
            this.lineHeightPixels = ascentPixels;
            this.lineStridePixels = lineStride;
            var words = paragraph.trim().split(/\s+/);
            var wordCount = words.length;
            for (var i = 0; i < wordCount; i++) {
                var word = words[i];
                var wordWeight = getWordXWeight(word);
                if (wordWeight == 0) {
                    continue;
                }
                if (!currentLine) {
                    beginLine(wordWeight, word);
                    continue;
                }
                var newLineWeight = spaceWeight + wordWeight + currentLine.weight;
                if (newLineWeight < xWeightsPerLine || lineContents.length == lines) {
                    currentLine.weight = newLineWeight;
                    currentLine.text += ' ' + word;
                    continue;
                }
                beginLine(wordWeight, word);
            }
        }
        MultiLines.getKey = function (maxWidthPixels, maxHeightPixels, lines, paragraph) {
            return maxWidthPixels.toString() + ":" + maxHeightPixels + ":" + lines + ":" + paragraph;
        };
        return MultiLines;
    })();
    var MULTILINE_KEYS = [];
    var MULTILINE_MAP = {};
    function getMultiLines(maxWidthPixels, maxHeightPixels, lines, paragraph) {
        var key = MultiLines.getKey(maxWidthPixels, maxHeightPixels, lines, paragraph);
        if (MULTILINE_MAP.hasOwnProperty(key)) {
            return MULTILINE_MAP[key];
        }
        else {
            var multiLines = new MultiLines(maxWidthPixels, maxHeightPixels, lines, paragraph);
            MULTILINE_MAP[key] = multiLines;
            MULTILINE_KEYS.push(key);
            if (MULTILINE_KEYS.length > 50) {
                var toDelete = MULTILINE_KEYS.shift();
                delete MULTILINE_MAP[toDelete];
            }
            return multiLines;
        }
    }
    function asciiMultiLine(lines, paragraph, base) {
        return glyffin_1.Glyff.create(function (presenter) {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var maxHeightPixels = perimeter.getHeight();
            var maxWidthPixels = perimeter.getWidth();
            var multiLines = getMultiLines(maxWidthPixels, maxHeightPixels, lines, paragraph);
            var lineHeight = multiLines.lineHeightPixels;
            var lineStride = multiLines.lineStridePixels;
            var lineContents = multiLines.lineContents;
            var lineContentCount = lineContents.length;
            for (var i = 0; i < lineContentCount; i++) {
                var linePerimeter = perimeter.downFromTop(i * lineStride, lineHeight);
                presenter.addPresentation(asciiEntireWord(lineContents[i].text, base)
                    .present(linePerimeter, audience, presenter));
            }
        }, 0);
    }
    exports.asciiMultiLine = asciiMultiLine;
    function asciiEntireWord(word, ink) {
        var wordXWeight = getWordXWeight(word);
        return glyffin_1.Glyff.create(function (presenter) {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var wordXWeightPixels = perimeter.getWidth() / wordXWeight;
            var preferredWeightPixels = perimeter.getHeight() / 7;
            var fittedWeightPixels = Math.min(preferredWeightPixels, wordXWeightPixels);
            presenter.addPresentation(asciiWord(word, fittedWeightPixels, ink)
                .present(perimeter, audience, presenter));
        }, 0);
    }
    exports.asciiEntireWord = asciiEntireWord;
    function asciiWord(word, xWeightPixels, base) {
        var insertions = [];
        for (var i = 0; i < word.length; i++) {
            var code = word.charCodeAt(i);
            var charWidth = xWeightPixels * getCharXWeight(code);
            if (i > 0) {
                insertions.push(new glyffin_1.Insertion(xWeightPixels, glyffin_1.ClearGlyff));
            }
            insertions.push(new glyffin_1.Insertion(charWidth, asciiByCode(code, base)));
        }
        return glyffin_1.ClearGlyff.addLefts(insertions);
    }
    exports.asciiWord = asciiWord;
    function asciiChar(ch, base) {
        return asciiByCode(ch.charCodeAt(0), base);
    }
    exports.asciiChar = asciiChar;
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
    var colon_spots = [
        [0, 1],
        [0, 2],
        [0, 5],
        [0, 6]
    ];
    var smcolon_spots = [
        [0, 1],
        [0, 2],
        [0, 5],
        [0, 6],
        [0, 7]
    ];
    var slash_spots = [
        [4, 0],
        [3, 1],
        [3, 2],
        [2, 3],
        [1, 4],
        [1, 5],
        [0, 6]
    ];
    var period_spots = [
        [0, 5],
        [0, 6]
    ];
    var minus_spots = [
        [0, 4], [1, 4], [2, 4], [3, 4], [4, 4]
    ];
    var plus_spots = [
        [2, 2],
        [2, 3],
        [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
        [2, 5],
        [2, 6]
    ];
    var quote_spots = [
        [0, 0],
        [0, 1]
    ];
    var dquote_spots = [
        [0, 0], [2, 0],
        [0, 1], [2, 1]
    ];
    var comma_spots = [
        [0, 5],
        [0, 6],
        [0, 7]
    ];
    var qmark_spots = [
        [1, 0], [2, 0], [3, 0],
        [0, 1], [4, 1],
        [4, 2],
        [3, 3],
        [2, 4],
        [2, 6]
    ];
    var lparen_spots = [
        [2, 0], [3, 0],
        [1, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 5],
        [2, 6], [3, 6]
    ];
    var rparen_spots = [
        [0, 0], [1, 0],
        [2, 1],
        [3, 2],
        [3, 3],
        [3, 4],
        [2, 5],
        [0, 6], [1, 6]
    ];
    var lbrack_spots = [
        [0, 0], [1, 0], [2, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6], [1, 6], [2, 6]
    ];
    var rbrack_spots = [
        [0, 0], [1, 0], [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [0, 6], [1, 6], [2, 6]
    ];
    var amper_spots = [
        [2, 0],
        [1, 1], [3, 1],
        [2, 2],
        [1, 3], [2, 3], [4, 3],
        [0, 4], [2, 4], [3, 4],
        [0, 5], [3, 5],
        [1, 6], [2, 6], [4, 6]
    ];
    var at_spots = [
        [1, 0], [2, 0], [3, 0], [4, 0],
        [0, 1], [5, 1],
        [0, 2], [2, 2], [3, 2], [5, 2],
        [0, 3], [2, 3], [3, 3], [5, 3],
        [0, 4], [2, 4], [3, 4], [4, 4], [5, 4],
        [0, 5],
        [1, 6], [2, 6], [3, 6], [4, 6], [5, 6]
    ];
    var dollar_spots = [
        [2, 0],
        [1, 1], [2, 1], [3, 1], [4, 1],
        [0, 2],
        [1, 3], [2, 3], [3, 3],
        [4, 4],
        [0, 5], [1, 5], [2, 5], [3, 5],
        [2, 6]
    ];
    var prcnt_spots = [
        [0, 0], [4, 0],
        [0, 1], [3, 1],
        [3, 2],
        [2, 3],
        [1, 4],
        [1, 5], [4, 5],
        [0, 6], [4, 6]
    ];
    var hash_spots = [
        [1, 0], [3, 0],
        [1, 1], [3, 1],
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [1, 3], [3, 3],
        [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
        [1, 5], [3, 5],
        [1, 6], [3, 6]
    ];
    var bang_spots = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 6]
    ];
    var star_spots = [
        [0, 0], [3, 0],
        [1, 1], [2, 1],
        [0, 2], [3, 2]
    ];
    var lt_spots = [
        [3, 0],
        [2, 1],
        [1, 2],
        [0, 3],
        [1, 4],
        [2, 5],
        [3, 6]
    ];
    var eq_spots = [
        [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
        [0, 5], [1, 5], [2, 5], [3, 5], [4, 5]
    ];
    var gt_spots = [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [2, 4],
        [1, 5],
        [0, 6]
    ];
    var pipe_spots = [
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]
    ];
    var obrace_spots = [
        [2, 0], [3, 0],
        [1, 1], [1, 2],
        [0, 3],
        [1, 4], [1, 5],
        [2, 6], [3, 6]
    ];
    var cbrace_spots = [
        [0, 0], [1, 0],
        [2, 1], [2, 2],
        [3, 3],
        [2, 4], [2, 5],
        [0, 6], [1, 6]
    ];
    var ascii_spots = [
        // 0-31
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots, no_spots,
        // 32-63
        no_spots, bang_spots, dquote_spots, hash_spots, dollar_spots, prcnt_spots, amper_spots,
        quote_spots,
        lparen_spots, rparen_spots, star_spots, plus_spots, comma_spots, minus_spots, period_spots,
        slash_spots,
        d0_spots, d1_spots, d2_spots, d3_spots, d4_spots, d5_spots, d6_spots, d7_spots,
        d8_spots, d9_spots, colon_spots, smcolon_spots, lt_spots, eq_spots, gt_spots, qmark_spots,
        // 64-95
        at_spots, A_spots, B_spots, C_spots, D_spots, E_spots, F_spots, G_spots,
        H_spots, I_spots, J_spots, K_spots, L_spots, M_spots, N_spots, O_spots,
        P_spots, Q_spots, R_spots, S_spots, T_spots, U_spots, V_spots, W_spots,
        X_spots, Y_spots, Z_spots, lbrack_spots, no_spots, rbrack_spots, no_spots, no_spots,
        // 96-127
        no_spots, a_spots, b_spots, c_spots, d_spots, e_spots, f_spots, g_spots,
        h_spots, i_spots, j_spots, k_spots, l_spots, m_spots, n_spots, o_spots,
        p_spots, q_spots, r_spots, s_spots, t_spots, u_spots, v_spots, w_spots,
        x_spots, y_spots, z_spots, obrace_spots, pipe_spots, cbrace_spots, no_spots, no_spots,
    ];
    exports.x_weights = [
        // 0-31
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        // 32-63
        5, 1, 3, 5, 5, 5, 5, 1,
        4, 4, 4, 5, 1, 5, 1, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 1, 1, 4, 5, 4, 5,
        // 64-95
        6, 5, 5, 5, 5, 5, 5, 5,
        5, 3, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 3, 5, 3, 5, 5,
        // 96-127
        5, 5, 5, 5, 5, 5, 4, 5,
        5, 1, 5, 4, 2, 5, 5, 5,
        5, 5, 5, 5, 3, 5, 5, 5,
        5, 5, 5, 4, 1, 4, 5, 5,
    ];
    var spaceWeight = getWordXWeight(' ');
    var Atlas = (function () {
        function Atlas() {
            var glyphWidthPixels = 8;
            var glyphHeightPixels = 8;
            var pageWidthGlyphs = 32;
            var pageHeightGlyphs = 1;
            var pageWidthPixels = pageWidthGlyphs * glyphWidthPixels;
            var pageHeightPixels = pageHeightGlyphs * glyphHeightPixels;
            var canvas = document.createElement("canvas");
            canvas.width = pageWidthPixels;
            canvas.height = pageHeightPixels;
            var context = canvas.getContext("2d");
            var imageData = context.createImageData(pageWidthPixels, pageHeightPixels);
            console.log("Width: " + imageData.width);
            var data = imageData.data;
            function writePixel(glyph, x, y, offset) {
                var pixelStride = 4;
                var rowIndex = (pageWidthPixels * pixelStride) * y;
                var index = rowIndex + (glyph * glyphWidthPixels + x) * pixelStride;
                data[index + offset] = 255;
                data[index + 3] = 255;
            }
            var pointStart = 32;
            for (var g = 0; g < pageWidthGlyphs; g++) {
                var point = pointStart + g;
                var spots3 = [ascii_spots[point], ascii_spots[point + pageWidthGlyphs],
                    ascii_spots[point + 2 * pageWidthGlyphs]];
                for (var l = 0; l < 3; l++) {
                    var spots = spots3[l];
                    for (var k = 0; k < spots.length; k++) {
                        var spot = spots[k];
                        var i = spot[0];
                        var j = spot[1];
                        writePixel(g, i, j, l);
                    }
                }
            }
            context.putImageData(imageData, 0, 0);
            var image = document.createElement("img");
            image.src = canvas.toDataURL("image/png");
            this.image = image;
        }
        return Atlas;
    })();
    exports.Atlas = Atlas;
});
//# sourceMappingURL=glyffin-ascii.js.map