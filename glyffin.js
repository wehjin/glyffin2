/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin-basic.ts" />
var Glyffin;
(function (Glyffin) {
    var NoResultPresenter = (function () {
        function NoResultPresenter(outerPresenter) {
            this.outerPresenter = outerPresenter;
        }
        NoResultPresenter.prototype.addPresentation = function (presentation) {
            return this.outerPresenter.addPresentation(presentation);
        };
        NoResultPresenter.prototype.onResult = function (result) {
            // Do nothing.  Send to null.
        };
        NoResultPresenter.prototype.onError = function (error) {
            this.outerPresenter.onError(error);
        };
        return NoResultPresenter;
    })();
    var Glyff = (function () {
        function Glyff(onPresent) {
            this.onPresent = onPresent;
        }
        Glyff.create = function (onPresent) {
            return new Glyff(onPresent);
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
        Glyff.prototype.compose = function (mogrifier) {
            var upperGlyff = this;
            return Glyff.create(function (metrics, audience, presenter) {
                presenter.addPresentation(upperGlyff.present(mogrifier.getMetrics(metrics, presenter), mogrifier.getUpperAudience(audience, presenter), mogrifier.getUpperReaction(audience, presenter)));
            });
        };
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
        Glyff.prototype.combineTop = function (size, topGlyff) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var split = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(topGlyff.present(metrics.withPerimeter(split[0]), audience, presenter));
                presenter.addPresentation(_this.present(metrics.withPerimeter(split[1]), audience, presenter));
            });
        };
        Glyff.prototype.majorTop = function (size, topGlyff) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var split = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(topGlyff.present(metrics.withPerimeter(split[0]), audience, presenter));
                presenter.addPresentation(_this.present(metrics.withPerimeter(split[1]), audience, new NoResultPresenter(presenter)));
            });
        };
        Glyff.prototype.minorTop = function (size, addGlyff) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var split = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(addGlyff.present(metrics.withPerimeter(split[0]), audience, new NoResultPresenter(presenter)));
                presenter.addPresentation(_this.present(metrics.withPerimeter(split[1]), audience, presenter));
            });
        };
        Glyff.prototype.addNearMajor = function (distance, nearGlyff) {
            var farGlyff = this;
            return Glyff.create(function (metrics, audience, presenter) {
                // TODO: Enable z-level in bounds, support distance.
                presenter.addPresentation(farGlyff.present(metrics, audience, new NoResultPresenter(presenter)));
                presenter.addPresentation(nearGlyff.present(metrics, audience, presenter));
            });
        };
        Glyff.prototype.limitHeight = function (maxHeight, align) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var perimeter = metrics.perimeter;
                var height = perimeter.getHeight();
                if (height <= maxHeight) {
                    presenter.addPresentation(_this.present(metrics, audience, presenter));
                }
                else {
                    var shortPerimeter = perimeter.limitHeight(maxHeight, align);
                    var shortMetrics = metrics.withPerimeter(shortPerimeter);
                    presenter.addPresentation(_this.present(shortMetrics, audience, presenter));
                }
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
        Glyff.prototype.clicken = function (symbol, pressed) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var unpressed = _this;
                var removable = presenter.addPresentation(unpressed.present(metrics, audience));
                var zone = audience.addZone(metrics.perimeter, {
                    getTouch: function (spot) {
                        removable.remove();
                        removable = presenter.addPresentation(pressed.present(metrics, audience));
                        var pressTime = Date.now();
                        function unpress() {
                            removable.remove();
                            removable = presenter.addPresentation(unpressed.present(metrics, audience));
                        }
                        return {
                            onMove: function (spot) {
                            },
                            onRelease: function () {
                                var delay = (pressTime + 100) - Date.now();
                                // Stayed pressed until minimum duration ends then un-press.
                                setTimeout(function () {
                                    unpress();
                                    // Wait for screen to update with unpress.  Then deliver button press.
                                    requestAnimationFrame(function () {
                                        setTimeout(function () {
                                            presenter.onResult(symbol);
                                        }, 0);
                                    });
                                }, (delay > 0) ? delay : 0);
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
        };
        Glyff.color = function (color) {
            return Glyff.create(function (metrics, audience, presenter) {
                var patch = audience.addPatch(metrics.perimeter, color);
                presenter.addPresentation({
                    end: function () {
                        patch.remove();
                    }
                });
            });
        };
        return Glyff;
    })();
    Glyffin.Glyff = Glyff;
    Glyffin.ClearGlyff = Glyff.create(function () {
    });
    function colorPath(colorPath, mix, colorPath2) {
        return Glyff.create(function (metrics, audience, presenter) {
            var color = metrics.palette.get(colorPath);
            if (mix) {
                color = color.mix(mix, metrics.palette.get(colorPath2));
            }
            var colorGlyff = Glyff.color(color);
            presenter.addPresentation(colorGlyff.present(metrics, audience, null, null));
        });
    }
    Glyffin.colorPath = colorPath;
    Glyffin.RedGlyff = Glyff.color(Glyffin.Color.RED);
    Glyffin.GreenGlyff = Glyff.color(Glyffin.Color.GREEN);
    Glyffin.BlueGlyff = Glyff.color(Glyffin.Color.BLUE);
    Glyffin.BeigeGlyff = Glyff.color(Glyffin.Color.BEIGE);
    Glyffin.WhiteGlyff = Glyff.color(Glyffin.Color.WHITE);
    Glyffin.BlackGlyff = Glyff.color(Glyffin.Color.BLACK);
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin.js.map