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
    function fromColorPath(colorPath) {
        return Glyff.create(function (metrics, audience, presenter) {
            var colorGlyff = Glyff.fromColor(metrics.palette.get(colorPath));
            presenter.addPresentation(colorGlyff.present(metrics, audience, null, null));
        });
    }
    Glyffin.fromColorPath = fromColorPath;
    Glyffin.RedGlyff = Glyff.fromColor(Glyffin.Color.RED);
    Glyffin.GreenGlyff = Glyff.fromColor(Glyffin.Color.GREEN);
    Glyffin.BlueGlyff = Glyff.fromColor(Glyffin.Color.BLUE);
    Glyffin.BeigeGlyff = Glyff.fromColor(Glyffin.Color.BEIGE);
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin.js.map