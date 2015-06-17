/**
 * Created by wehjin on 5/24/15.
 */
var Glyffin;
(function (Glyffin) {
    var Stage = (function () {
        function Stage(metrics, palette) {
            this.metrics = metrics;
            this.palette = palette;
        }
        return Stage;
    })();
    Glyffin.Stage = Stage;
    var Metrics = (function () {
        function Metrics(perimeter, tapHeight, readHeight) {
            this.perimeter = perimeter;
            this.tapHeight = tapHeight;
            this.readHeight = readHeight;
        }
        Metrics.prototype.withPerimeter = function (perimeter) {
            return new Metrics(perimeter, this.tapHeight, this.readHeight);
        };
        return Metrics;
    })();
    Glyffin.Metrics = Metrics;
    Glyffin.EMPTY_REMOVABLE = {
        remove: function () {
        }
    };
    Glyffin.EMPTY_PATCH = Glyffin.EMPTY_REMOVABLE;
    Glyffin.EMPTY_ACTIVE = Glyffin.EMPTY_REMOVABLE;
    var Insertion = (function () {
        function Insertion(amount, glyff) {
            this.amount = amount;
            this.glyff = glyff;
        }
        return Insertion;
    })();
    Glyffin.Insertion = Insertion;
    var RectangleBounds = (function () {
        function RectangleBounds(left, top, right, bottom) {
            this.left = left;
            this.top = top;
            this.right = right;
            this.bottom = bottom;
        }
        RectangleBounds.prototype.getHeight = function () {
            return this.bottom - this.top;
        };
        RectangleBounds.prototype.getWidth = function () {
            return this.right - this.left;
        };
        RectangleBounds.prototype.inset = function (pixelsX, pixelsY) {
            return new RectangleBounds(this.left + pixelsX, this.top + pixelsY, this.right - pixelsX, this.bottom - pixelsY);
        };
        RectangleBounds.prototype.downFromTop = function (pixelsY, pixelsHigh) {
            var inTop = this.top + pixelsY;
            return new RectangleBounds(this.left, inTop, this.right, inTop + pixelsHigh);
        };
        RectangleBounds.prototype.splitHorizontal = function (pixelsDown) {
            var split = this.top + pixelsDown;
            return [new RectangleBounds(this.left, this.top, this.right, split), new RectangleBounds(this.left, split, this.right, this.bottom)];
        };
        return RectangleBounds;
    })();
    Glyffin.RectangleBounds = RectangleBounds;
    var Color = (function () {
        function Color(red, green, blue, alpha) {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.alpha = alpha;
        }
        return Color;
    })();
    Glyffin.Color = Color;
    var Palette = (function () {
        function Palette() {
        }
        Palette.RED = new Color(1, 0, 0, 1);
        Palette.GREEN = new Color(0, 1, 0, 1);
        Palette.BLUE = new Color(0, 0, 1, 1);
        Palette.BEIGE = new Color(245 / 255, 245 / 255, 220 / 255, 1);
        return Palette;
    })();
    Glyffin.Palette = Palette;
    var Spot = (function () {
        function Spot(x, y) {
            this.x = x;
            this.y = y;
        }
        return Spot;
    })();
    Glyffin.Spot = Spot;
    var Void = (function () {
        function Void() {
        }
        return Void;
    })();
    Glyffin.Void = Void;
})(Glyffin || (Glyffin = {}));
/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin-basic.ts" />
var Glyffin;
(function (Glyffin) {
    var Glyff = (function () {
        function Glyff(onPresent) {
            this.onPresent = onPresent;
        }
        Glyff.prototype.addLefts = function (insertions) {
            var current = this;
            var todo = insertions.slice();
            while (todo.length > 0) {
                var insertion = todo.pop();
                current = current.addLeft(insertion.amount, insertion.glyff);
            }
            return current;
        };
        Glyff.prototype.addLeft = function (insertAmount, insertGlyff) {
            var existingGlyff = this;
            return Glyff.create(function (metrics, audience, presenter) {
                // TODO: Move perimeter computation into RectangleBounds.
                var perimeter = metrics.perimeter;
                var insertRight = perimeter.left + insertAmount;
                var insertPerimeter = new Glyffin.RectangleBounds(perimeter.left, perimeter.top, insertRight, perimeter.bottom);
                var modifiedPerimeter = new Glyffin.RectangleBounds(insertRight, perimeter.top, perimeter.right, perimeter.bottom);
                presenter.addPresentation(insertGlyff.present(metrics.withPerimeter(insertPerimeter), audience, presenter));
                presenter.addPresentation(existingGlyff.present(metrics.withPerimeter(modifiedPerimeter), audience, presenter));
            });
        };
        Glyff.prototype.addTopReact = function (size, addGlyff) {
            var existingGlyff = this;
            // TODO: Fix Presenter type. Should be U.
            return Glyff.create(function (metrics, audience, presenter) {
                var bounds = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(addGlyff.present(metrics.withPerimeter(bounds[0]), audience, presenter));
                presenter.addPresentation(existingGlyff.present(metrics.withPerimeter(bounds[1]), audience, presenter));
            });
        };
        Glyff.prototype.addTop = function (size, addGlyff) {
            var existingGlyff = this;
            // TODO: Fix Presenter type.  Should be T.
            return Glyff.create(function (metrics, audience, presenter) {
                var bounds = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(addGlyff.present(metrics.withPerimeter(bounds[0]), audience, presenter));
                presenter.addPresentation(existingGlyff.present(metrics.withPerimeter(bounds[1]), audience, presenter));
            });
        };
        Glyff.prototype.kaleid = function (columns, rows, spots) {
            var upperGlyff = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var perimeter = metrics.perimeter;
                var rowHeight = perimeter.getHeight() / rows;
                var colWidth = perimeter.getWidth() / columns;
                spots.forEach(function (spot) {
                    var left = perimeter.left + colWidth * spot[0];
                    var top = perimeter.top + rowHeight * spot[1];
                    var spotPerimeter = new Glyffin.RectangleBounds(left, top, left + colWidth, top + rowHeight);
                    presenter.addPresentation(upperGlyff.present(metrics.withPerimeter(spotPerimeter), audience, presenter));
                });
            });
        };
        Glyff.prototype.pad = function (xPixels, yPixels) {
            return this.compose({
                getMetrics: function (metrics, presenter) {
                    var insetPerimeter = metrics.perimeter.inset(xPixels, yPixels);
                    return metrics.withPerimeter(insetPerimeter);
                },
                getUpperAudience: function (audience, presenter) {
                    return audience;
                },
                getUpperReaction: function (audience, presenter) {
                    return presenter;
                }
            });
        };
        Glyff.prototype.compose = function (mogrifier) {
            var upperGlyff = this;
            return Glyff.create(function (metrics, audience, presenter) {
                presenter.addPresentation(upperGlyff.present(mogrifier.getMetrics(metrics, presenter), mogrifier.getUpperAudience(audience, presenter), mogrifier.getUpperReaction(audience, presenter)));
            });
        };
        Glyff.prototype.present = function (metrics, audience, reactionOrOnResult, onError) {
            var presented = [];
            var presenter = {
                addPresentation: function (presentation) {
                    presented.push(presentation);
                    return {
                        remove: function () {
                            var index = presented.indexOf(presentation);
                            if (index >= 0) {
                                presented.splice(index, 1);
                            }
                            presentation.end();
                        }
                    };
                },
                onResult: function (result) {
                    if (typeof reactionOrOnResult === 'object') {
                        reactionOrOnResult.onResult(result);
                    }
                    else if (typeof reactionOrOnResult === 'function') {
                        reactionOrOnResult(result);
                    }
                },
                onError: function (error) {
                    if (typeof reactionOrOnResult === 'object') {
                        reactionOrOnResult.onError(error);
                    }
                    else if (onError) {
                        onError(error);
                    }
                }
            };
            this.onPresent(metrics, audience, presenter);
            return {
                end: function () {
                    while (presented.length > 0) {
                        presented.pop().end();
                    }
                }
            };
        };
        Glyff.fromColor = function (color) {
            return Glyff.create(function (metrics, audience, presenter) {
                var patch = audience.addPatch(metrics.perimeter, color);
                presenter.addPresentation({
                    end: function () {
                        patch.remove();
                    }
                });
            });
        };
        Glyff.create = function (onPresent) {
            return new Glyff(onPresent);
        };
        return Glyff;
    })();
    Glyffin.Glyff = Glyff;
    Glyffin.ClearGlyff = Glyff.create(function () {
    });
    Glyffin.RedGlyff = Glyff.fromColor(Glyffin.Palette.RED);
    Glyffin.GreenGlyff = Glyff.fromColor(Glyffin.Palette.GREEN);
    Glyffin.BlueGlyff = Glyff.fromColor(Glyffin.Palette.BLUE);
    Glyffin.BeigeGlyff = Glyff.fromColor(Glyffin.Palette.BEIGE);
})(Glyffin || (Glyffin = {}));
/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    var LineContent = (function () {
        function LineContent(weight, text) {
            this.weight = weight;
            this.text = text;
        }
        return LineContent;
    })();
    function asciiMultiLine(lines, paragraph) {
        return Glyffin.Glyff.create(function (metrics, audience, presenter) {
            var perimeter = metrics.perimeter;
            var linesAndLeadings = (lines * 2 - 1);
            var ascentPixels = perimeter.getHeight() / linesAndLeadings;
            var lineHeight = ascentPixels * 2;
            var xWeightPixels = ascentPixels / 7;
            var width = perimeter.getWidth();
            var xWeightsPerLine = Math.floor(width / xWeightPixels);
            var lineContents = [];
            var currentLine = null;
            var beginLine = function (wordWeight, word) {
                currentLine = new LineContent(wordWeight, word);
                lineContents.push(currentLine);
                if (wordWeight >= xWeightsPerLine && lineContents.length < lines) {
                    currentLine = null;
                }
            };
            var words = paragraph.trim().split(/\s+/);
            words.forEach(function (word) {
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
            lineContents.forEach(function (lineContent) {
                var lineMetrics = metrics.withPerimeter(perimeter.downFromTop(lineNumber * lineHeight, ascentPixels));
                presenter.addPresentation(asciiEntireWord(lineContent.text).present(lineMetrics, audience, presenter));
                lineNumber++;
            });
        });
    }
    Glyffin.asciiMultiLine = asciiMultiLine;
    function asciiEntireWord(word) {
        var wordXWeight = getWordXWeight(word);
        return Glyffin.Glyff.create(function (metrics, audience, presenter) {
            var perimeter = metrics.perimeter;
            var wordXWeightPixels = perimeter.getWidth() / wordXWeight;
            var preferredWeightPixels = perimeter.getHeight() / 7;
            var fittedWeightPixels = Math.min(preferredWeightPixels, wordXWeightPixels);
            presenter.addPresentation(asciiWord(word, fittedWeightPixels).present(metrics, audience, presenter));
        });
    }
    Glyffin.asciiEntireWord = asciiEntireWord;
    function asciiWord(word, xWeightPixels) {
        var insertions = [];
        for (var i = 0; i < word.length; i++) {
            var code = word.charCodeAt(i);
            var capWidth = xWeightPixels * x_weights[code];
            if (i > 0) {
                insertions.push(new Glyffin.Insertion(xWeightPixels, Glyffin.ClearGlyff));
            }
            insertions.push(new Glyffin.Insertion(capWidth, Glyffin.asciiByCode(code)));
        }
        return Glyffin.GreenGlyff.addLefts(insertions);
    }
    Glyffin.asciiWord = asciiWord;
    function asciiChar(ch) {
        return asciiByCode(ch.charCodeAt(0));
    }
    Glyffin.asciiChar = asciiChar;
    function asciiByCode(code) {
        var spots = ascii_spots[code];
        return Glyffin.BeigeGlyff.kaleid(x_weights[code], 7, spots);
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
    var L_spots = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var M_spots = [
        [0, 0],
        [4, 0],
        [0, 1],
        [1, 1],
        [3, 1],
        [4, 1],
        [0, 2],
        [2, 2],
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
    var N_spots = [
        [0, 0],
        [4, 0],
        [0, 1],
        [1, 1],
        [4, 1],
        [0, 2],
        [2, 2],
        [4, 2],
        [0, 3],
        [3, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var O_spots = [
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
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var P_spots = [
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
        [0, 4],
        [0, 5],
        [0, 6]
    ];
    var Q_spots = [
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
        [3, 5],
        [1, 6],
        [2, 6],
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
    var S_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 1],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 3],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var T_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [2, 6]
    ];
    var U_spots = [
        [0, 0],
        [4, 0],
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
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var V_spots = [
        [0, 0],
        [4, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [1, 4],
        [3, 4],
        [1, 5],
        [3, 5],
        [2, 6]
    ];
    var W_spots = [
        [0, 0],
        [4, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [2, 4],
        [4, 4],
        [0, 5],
        [1, 5],
        [3, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var X_spots = [
        [0, 0],
        [4, 0],
        [1, 1],
        [3, 1],
        [2, 2],
        [1, 3],
        [3, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var Y_spots = [
        [0, 0],
        [4, 0],
        [1, 1],
        [3, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [2, 6],
    ];
    var Z_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [4, 1],
        [3, 2],
        [2, 3],
        [1, 4],
        [0, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var a_spots = [
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 3],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var b_spots = [
        [0, 0],
        [0, 1],
        [0, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [1, 3],
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
    var c_spots = [
        [1, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var d_spots = [
        [4, 0],
        [4, 1],
        [1, 2],
        [2, 2],
        [4, 2],
        [0, 3],
        [3, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var e_spots = [
        [1, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [0, 5],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var f_spots = [
        [2, 0],
        [3, 0],
        [1, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [1, 6]
    ];
    var g_spots = [
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [4, 6],
        [0, 7],
        [1, 7],
        [2, 7],
        [3, 7]
    ];
    var h_spots = [
        [0, 0],
        [0, 1],
        [0, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [1, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
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
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6],
        [1, 7],
        [2, 7],
        [3, 7]
    ];
    var k_spots = [
        [0, 0],
        [0, 1],
        [0, 2],
        [3, 2],
        [0, 3],
        [2, 3],
        [0, 4],
        [1, 4],
        [0, 5],
        [2, 5],
        [0, 6],
        [3, 6]
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
        [0, 2],
        [1, 2],
        [3, 2],
        [0, 3],
        [2, 3],
        [4, 3],
        [0, 4],
        [2, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var n_spots = [
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
    var o_spots = [
        [1, 2],
        [2, 2],
        [3, 2],
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
    var p_spots = [
        [0, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [1, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
        [0, 6],
        [0, 7]
    ];
    var q_spots = [
        [1, 2],
        [2, 2],
        [4, 2],
        [0, 3],
        [3, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [4, 6],
        [4, 7],
    ];
    var r_spots = [
        [0, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [1, 3],
        [4, 3],
        [0, 4],
        [0, 5],
        [0, 6]
    ];
    var s_spots = [
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var t_spots = [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 6]
    ];
    var u_spots = [
        [0, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var v_spots = [
        [0, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [1, 5],
        [3, 5],
        [2, 6]
    ];
    var w_spots = [
        [0, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [2, 4],
        [4, 4],
        [0, 5],
        [2, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var x_spots = [
        [0, 2],
        [4, 2],
        [1, 3],
        [3, 3],
        [2, 4],
        [1, 5],
        [3, 5],
        [0, 6],
        [4, 6]
    ];
    var y_spots = [
        [0, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [4, 6],
        [0, 7],
        [1, 7],
        [2, 7],
        [3, 7]
    ];
    var z_spots = [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [3, 3],
        [2, 4],
        [1, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var d0_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [2, 3],
        [4, 3],
        [0, 4],
        [1, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var d1_spots = [
        [2, 0],
        [1, 1],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
        [2, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var d2_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [4, 2],
        [2, 3],
        [3, 3],
        [1, 4],
        [0, 5],
        [0, 6],
        [1, 6],
        [2, 6],
        [3, 6],
        [4, 6]
    ];
    var d3_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [4, 2],
        [2, 3],
        [3, 3],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var d4_spots = [
        [3, 0],
        [4, 0],
        [2, 1],
        [4, 1],
        [1, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [4, 5],
        [4, 6]
    ];
    var d5_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 3],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var d6_spots = [
        [2, 0],
        [3, 0],
        [1, 1],
        [0, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var d7_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [0, 1],
        [4, 1],
        [4, 2],
        [3, 3],
        [2, 4],
        [2, 5],
        [2, 6]
    ];
    var d8_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [4, 2],
        [1, 3],
        [2, 3],
        [3, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    var d9_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [4, 2],
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
        [4, 4],
        [3, 5],
        [1, 6],
        [2, 6]
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
        d0_spots,
        d1_spots,
        d2_spots,
        d3_spots,
        d4_spots,
        d5_spots,
        d6_spots,
        d7_spots,
        d8_spots,
        d9_spots,
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
        L_spots,
        M_spots,
        N_spots,
        O_spots,
        P_spots,
        Q_spots,
        R_spots,
        S_spots,
        T_spots,
        U_spots,
        V_spots,
        W_spots,
        X_spots,
        Y_spots,
        Z_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        a_spots,
        b_spots,
        c_spots,
        d_spots,
        e_spots,
        f_spots,
        g_spots,
        h_spots,
        i_spots,
        j_spots,
        k_spots,
        l_spots,
        m_spots,
        n_spots,
        o_spots,
        p_spots,
        q_spots,
        r_spots,
        s_spots,
        t_spots,
        u_spots,
        v_spots,
        w_spots,
        x_spots,
        y_spots,
        z_spots,
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
        4,
        5,
        5,
        1,
        5,
        4,
        2,
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
    ];
    function getWordXWeight(word) {
        var spaceWeights = word.length <= 1 ? 0 : (word.length - 1);
        var letterWeights = 0;
        for (var i = 0; i < word.length; i++) {
            var charCode = word.charCodeAt(i);
            letterWeights += x_weights[charCode];
        }
        return letterWeights + spaceWeights;
    }
    var spaceWeight = getWordXWeight(' ');
})(Glyffin || (Glyffin = {}));
/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    var MAX_PATCH_COUNT = 10000;
    var Interactive = (function () {
        function Interactive(bounds, touchProvider) {
            this.bounds = bounds;
            this.touchProvider = touchProvider;
        }
        Interactive.prototype.isHit = function (touchX, touchY) {
            return this.bounds.left <= touchX && this.bounds.right >= touchX && this.bounds.top <= touchY && this.bounds.bottom >= touchY;
        };
        Interactive.findHits = function (all, x, y) {
            var hitInteractives = [];
            all.forEach(function (interactive) {
                if (interactive.isHit(x, y)) {
                    hitInteractives.push(interactive);
                }
            });
            return hitInteractives;
        };
        return Interactive;
    })();
    var GlAudience = (function () {
        function GlAudience() {
            var _this = this;
            this.interactives = [];
            this.drawCount = 0;
            this.editCount = 0;
            var canvas = document.getElementById('webgl');
            this.canvas = canvas;
            canvas.addEventListener("touchstart", function (ev) {
                var jsTouch = ev.touches.item(0);
                var hits = Interactive.findHits(_this.interactives, jsTouch.clientX, jsTouch.clientY);
                if (hits.length > 0) {
                    var interactive = hits[0];
                    var touch = interactive.touchProvider.getTouch(null);
                    var ontouchcancel;
                    var ontouchend = function () {
                        touch.onRelease();
                        canvas.removeEventListener("touchend", ontouchend, false);
                        canvas.removeEventListener("touchcancel", ontouchcancel, false);
                        ontouchcancel = ontouchend = null;
                    };
                    ontouchcancel = function () {
                        touch.onCancel();
                        canvas.removeEventListener("touchend", ontouchend, false);
                        canvas.removeEventListener("touchcancel", ontouchcancel, false);
                        ontouchcancel = ontouchend = null;
                    };
                    canvas.addEventListener("touchend", ontouchend, false);
                    canvas.addEventListener("touchcancel", ontouchcancel, false);
                }
                ev.stopPropagation();
                ev.preventDefault();
            }, false);
            canvas.onmousedown = function (ev) {
                var hits = Interactive.findHits(_this.interactives, ev.clientX, ev.clientY);
                if (hits.length > 0) {
                    var interactive = _this.interactives[0];
                    var touch = interactive.touchProvider.getTouch(null);
                    canvas.onmouseup = function () {
                        touch.onRelease();
                        canvas.onmouseout = canvas.onmouseup = null;
                    };
                    canvas.onmouseout = function () {
                        touch.onCancel();
                        canvas.onmouseout = canvas.onmouseup = null;
                    };
                }
                ev.stopPropagation();
                ev.preventDefault();
            };
            this.perimeter = new Glyffin.RectangleBounds(0, 0, canvas.width, canvas.height);
            this.palette = new Glyffin.Palette();
            var gl = getWebGLContext(canvas);
            initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.vertices = new VerticesAndColor(MAX_PATCH_COUNT, gl);
            this.gl = gl;
            var viewMatrix = new Matrix4();
            viewMatrix.setTranslate(-1, 1, 0);
            viewMatrix.scale(2 / canvas.width, -2 / canvas.height, 1);
            var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');
            gl.uniformMatrix4fv(u_ModelMatrix, false, viewMatrix.elements);
        }
        GlAudience.prototype.getMetrics = function () {
            return new Glyffin.Metrics(this.perimeter, 48, 10);
        };
        GlAudience.prototype.getPerimeter = function () {
            return this.perimeter;
        };
        GlAudience.prototype.getPalette = function () {
            return this.palette;
        };
        GlAudience.prototype.addPatch = function (bounds, color) {
            var _this = this;
            if (bounds.left >= bounds.right || bounds.top >= bounds.bottom || color.alpha == 0) {
                return Glyffin.EMPTY_PATCH;
            }
            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right, bounds.bottom, color);
            this.scheduleRedraw();
            return {
                remove: function () {
                    _this.vertices.putPatch(patch);
                }
            };
        };
        GlAudience.prototype.addZone = function (bounds, touchProvider) {
            var interactive = new Interactive(bounds, touchProvider);
            this.interactives.push(interactive);
            var interactives = this.interactives;
            return {
                remove: function () {
                    interactives.splice(interactives.indexOf(interactive), 1);
                }
            };
        };
        GlAudience.prototype.scheduleRedraw = function () {
            var _this = this;
            if (this.editCount > this.drawCount) {
                return;
            }
            this.editCount++;
            requestAnimationFrame(function () {
                _this.vertices.clearFreePatches();
                _this.gl.clear(_this.gl.COLOR_BUFFER_BIT);
                _this.gl.drawArrays(_this.gl.TRIANGLES, 0, _this.vertices.getActiveVertexCount());
                _this.drawCount = _this.editCount;
                console.log("Active %i, Free %i, TotalFreed %", _this.vertices.getActiveVertexCount(), _this.vertices.getFreeVertexCount(), _this.vertices.getTotalFreedVertices());
            });
        };
        return GlAudience;
    })();
    Glyffin.GlAudience = GlAudience;
    var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' + 'attribute vec4 a_Color;\n' + 'varying vec4 v_Color;\n' + 'uniform mat4 u_viewMatrix;\n' + 'void main(){\n' + '  gl_Position = u_viewMatrix * a_Position;\n' + '  v_Color = a_Color;\n' + '}\n';
    var FSHADER_SOURCE = 'precision mediump float;' + 'varying vec4 v_Color;\n' + 'void main(){\n' + '  gl_FragColor = v_Color;\n' + '}\n';
    var VERTICES_PER_PATCH = 6;
    var FLOATS_PER_POSITION = 2;
    var FLOATS_PER_COLOR = 4;
    var FLOATS_PER_VERTEX = FLOATS_PER_POSITION + FLOATS_PER_COLOR;
    var FLOATS_PER_PATCH = VERTICES_PER_PATCH * FLOATS_PER_VERTEX;
    var BYTES_PER_FLOAT = 4;
    var BYTES_BEFORE_COLOR = FLOATS_PER_POSITION * BYTES_PER_FLOAT;
    var BYTES_PER_VERTEX = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;
    var BYTES_PER_PATCH = FLOATS_PER_PATCH * BYTES_PER_FLOAT;
    var VerticesAndColor = (function () {
        function VerticesAndColor(maxPatchCount, gl) {
            this.maxPatchCount = maxPatchCount;
            this.nextPatchIndex = 0;
            this.freePatchIndices = [];
            this.clearedPatchIndices = [];
            this.totalFreed = 0;
            this.emptyPatchVertices = new Float32Array(FLOATS_PER_PATCH);
            this.patchVertices = new Float32Array(FLOATS_PER_PATCH);
            this.gl = gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            var vertices = new Float32Array(maxPatchCount * FLOATS_PER_PATCH);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, FLOATS_PER_POSITION, gl.FLOAT, false, BYTES_PER_VERTEX, 0);
            gl.enableVertexAttribArray(a_Position);
            var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
            gl.vertexAttribPointer(a_Color, FLOATS_PER_COLOR, gl.FLOAT, false, BYTES_PER_VERTEX, BYTES_BEFORE_COLOR);
            gl.enableVertexAttribArray(a_Color);
        }
        VerticesAndColor.prototype.getActiveVertexCount = function () {
            return this.nextPatchIndex * VERTICES_PER_PATCH;
        };
        VerticesAndColor.prototype.getFreeVertexCount = function () {
            return (this.freePatchIndices.length + this.clearedPatchIndices.length) * VERTICES_PER_PATCH;
        };
        VerticesAndColor.prototype.getTotalFreedVertices = function () {
            return this.totalFreed * VERTICES_PER_PATCH;
        };
        VerticesAndColor.prototype.getPatch = function (left, top, right, bottom, color) {
            var patchIndex;
            if (this.freePatchIndices.length > 0) {
                patchIndex = this.freePatchIndices.pop();
            }
            else if (this.clearedPatchIndices.length > 0) {
                patchIndex = this.clearedPatchIndices.pop();
            }
            else {
                if (this.nextPatchIndex >= MAX_PATCH_COUNT) {
                    throw "Too many patches";
                }
                patchIndex = this.nextPatchIndex++;
            }
            this.patchVertices.set([left, top, color.red, color.green, color.blue, color.alpha, right, top, color.red, color.green, color.blue, color.alpha, left, bottom, color.red, color.green, color.blue, color.alpha, left, bottom, color.red, color.green, color.blue, color.alpha, right, top, color.red, color.green, color.blue, color.alpha, right, bottom, color.red, color.green, color.blue, color.alpha,]);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * BYTES_PER_PATCH, this.patchVertices);
            return patchIndex;
        };
        VerticesAndColor.prototype.putPatch = function (patchIndex) {
            this.freePatchIndices.push(patchIndex);
            this.totalFreed++;
        };
        VerticesAndColor.prototype.clearFreePatches = function () {
            if (this.freePatchIndices.length > 0) {
                for (var i = 0; i < this.freePatchIndices.length; i++) {
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.freePatchIndices[i] * BYTES_PER_PATCH, this.emptyPatchVertices);
                }
                this.clearedPatchIndices = this.clearedPatchIndices.concat(this.freePatchIndices);
                this.freePatchIndices = [];
            }
        };
        return VerticesAndColor;
    })();
})(Glyffin || (Glyffin = {}));
/**
 * Created by wehjin on 6/6/15.
 */
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    function button() {
        return Glyffin.Glyff.create(function (metrics, audience, presenter) {
            var removable = presenter.addPresentation(Glyffin.GreenGlyff.present(metrics, audience));
            var zone = audience.addZone(metrics.perimeter, {
                getTouch: function (spot) {
                    removable.remove();
                    removable = presenter.addPresentation(Glyffin.BlueGlyff.present(metrics, audience));
                    function unpress() {
                        removable.remove();
                        removable = presenter.addPresentation(Glyffin.GreenGlyff.present(metrics, audience));
                    }
                    return {
                        onMove: function (spot) {
                        },
                        onRelease: function () {
                            unpress();
                            // Wait for screen to update with unpress.  Then deliver button press.
                            requestAnimationFrame(function () {
                                setTimeout(function () {
                                    presenter.onResult(Date.now());
                                }, 0);
                            });
                        },
                        onCancel: function () {
                            unpress();
                        }
                    };
                }
            });
            presenter.addPresentation({
                end: function () {
                    zone.remove();
                }
            });
        });
    }
    Glyffin.button = button;
})(Glyffin || (Glyffin = {}));
/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
/// <reference path="glyffin-touch.ts" />
var Insertion = Glyffin.Insertion;
var Glyff = Glyffin.Glyff;
var Void = Glyffin.Void;
var Metrics = Glyffin.Metrics;
function main() {
    var glAudience = new Glyffin.GlAudience();
    var glMetrics = glAudience.getMetrics();
    var headline = "Bidding for the 2026 World Cup is suspended by FIFA as Valcke denies wrongdoing";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789";
    var fingerPixels = glMetrics.tapHeight;
    var readPixels = glMetrics.readHeight;
    var demo = Glyffin.RedGlyff.addTop(100, Glyffin.BlueGlyff.addTop(readPixels * 8, Glyffin.asciiMultiLine(3, alphabet)).pad(10, 10)).addTop(readPixels * 5, Glyffin.BlueGlyff.addTop(readPixels * 3, Glyffin.asciiMultiLine(2, headline)).pad(readPixels, readPixels)).addTop(readPixels * 7, Glyffin.BlueGlyff.addTop(readPixels * 5, Glyffin.asciiMultiLine(3, headline)).pad(readPixels, readPixels)).addTopReact(fingerPixels, Glyffin.button());
    var app = Glyff.create(function (metrics, audience, presenter) {
        var page = Glyffin.BeigeGlyff.addTopReact(fingerPixels, Glyffin.button());
        var presented;
        function setPresented(glyff, next) {
            if (presented) {
                presented.remove();
            }
            presented = presenter.addPresentation(glyff.present(metrics, audience, function () {
                setPresented(next, glyff);
            }));
        }
        setPresented(page, demo);
    });
    app.present(glMetrics, glAudience);
}
//# sourceMappingURL=combined.js.map