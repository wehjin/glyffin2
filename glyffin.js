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
    var ClickGesturing = (function () {
        function ClickGesturing(startSpot, threshold, onPress, onUnpress, onClick) {
            var _this = this;
            this.startSpot = startSpot;
            this.threshold = threshold;
            this.onPress = onPress;
            this.onUnpress = onUnpress;
            this.onClick = onClick;
            this.isEnded = false;
            this.pressTime = 0;
            this.willPress = 0;
            this.willPress = setTimeout(function () {
                _this.doPress();
            }, 200);
        }
        ClickGesturing.prototype.clearWillPress = function () {
            if (this.willPress) {
                clearTimeout(this.willPress);
                this.willPress = 0;
            }
        };
        ClickGesturing.prototype.doPress = function () {
            if (this.isEnded) {
                return;
            }
            this.clearWillPress();
            this.pressTime = Date.now();
            this.onPress();
        };
        ClickGesturing.prototype.doEnd = function () {
            this.isEnded = true;
            this.clearWillPress();
            if (this.pressTime) {
                this.onUnpress();
            }
        };
        ClickGesturing.prototype.release = function () {
            var _this = this;
            if (this.isEnded) {
                return;
            }
            if (this.pressTime == 0) {
                this.doPress();
            }
            var delay = (this.pressTime + 200) - Date.now();
            // Stayed pressed until minimum duration ends then un-press.
            setTimeout(function () {
                _this.doEnd();
                // Wait for screen to show the un-press before delivering click.
                setTimeout(_this.onClick, 100);
            }, (delay > 0) ? delay : 0);
        };
        ClickGesturing.prototype.move = function (spot, onAbort) {
            if (this.isEnded) {
                return;
            }
            if (spot.gridDistance(this.startSpot) > this.threshold) {
                this.doEnd();
                onAbort();
            }
        };
        ClickGesturing.prototype.cancel = function () {
            if (this.isEnded) {
                return;
            }
            this.doEnd();
        };
        return ClickGesturing;
    })();
    var ClickGesturable = (function () {
        function ClickGesturable(threshold, press, unpress, click) {
            this.threshold = threshold;
            this.press = press;
            this.unpress = unpress;
            this.click = click;
        }
        ClickGesturable.prototype.init = function (spot) {
            return new ClickGesturing(spot, this.threshold, this.press, this.unpress, this.click);
        };
        return ClickGesturable;
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
        Glyff.prototype.rebuild = function (builder) {
            var rebuilt = builder(this);
            return Glyff.create(function (metrics, audience, presenter) {
                presenter.addPresentation(rebuilt.present(metrics, audience, presenter));
            });
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
                current = current.splitWidthCombine(insertion.amount, insertion.glyff);
            }
            return current;
        };
        Glyff.prototype.splitWidthCombine = function (size, glyff) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var split = metrics.perimeter.splitWidth(size);
                presenter.addPresentation(glyff.present(metrics.withPerimeter(split[0]), audience, presenter));
                presenter.addPresentation(_this.present(metrics.withPerimeter(split[1]), audience, presenter));
            });
        };
        Glyff.prototype.splitHeightCombine = function (size, topGlyff) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var split = metrics.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(metrics.withPerimeter(split[0]), audience, presenter));
                presenter.addPresentation(_this.present(metrics.withPerimeter(split[1]), audience, presenter));
            });
        };
        Glyff.prototype.splitHeightRetain = function (size, topGlyff) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var split = metrics.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(metrics.withPerimeter(split[0]), audience, presenter));
                presenter.addPresentation(_this.present(metrics.withPerimeter(split[1]), audience, new NoResultPresenter(presenter)));
            });
        };
        Glyff.prototype.splitHeightYield = function (size, addGlyff) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var split = metrics.perimeter.splitHeight(size);
                presenter.addPresentation(addGlyff.present(metrics.withPerimeter(split[0]), audience, new NoResultPresenter(presenter)));
                presenter.addPresentation(_this.present(metrics.withPerimeter(split[1]), audience, presenter));
            });
        };
        Glyff.prototype.addNearMajor = function (level, nearGlyff) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                presenter.addPresentation(_this.present(metrics, audience, new NoResultPresenter(presenter)));
                // TODO: Think through relative versus absolute level.
                var nearPerimeter = metrics.perimeter.withLevel(metrics.perimeter.level + level);
                presenter.addPresentation(nearGlyff.present(metrics.withPerimeter(nearPerimeter), audience, presenter));
            });
        };
        Glyff.prototype.limitWidth = function (maxWidth, align) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var perimeter = metrics.perimeter;
                var width = perimeter.getWidth();
                if (width <= maxWidth) {
                    presenter.addPresentation(_this.present(metrics, audience, presenter));
                }
                else {
                    var narrowPerimeter = perimeter.limitWidth(maxWidth, align);
                    var narrowMetrics = metrics.withPerimeter(narrowPerimeter);
                    presenter.addPresentation(_this.present(narrowMetrics, audience, presenter));
                }
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
                    var spotPerimeter = new Glyffin.Perimeter(left, top, left + colWidth, top + rowHeight, perimeter.age, perimeter.level);
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
                var perimeter = metrics.perimeter;
                var unpressed = _this;
                var unpressedMetrics = metrics.withPerimeter(perimeter.withLevel(perimeter.level + 4));
                var removable = presenter.addPresentation(unpressed.present(unpressedMetrics, audience));
                var zone = audience.addZone(perimeter, new ClickGesturable(metrics.tapHeight / 2, function () {
                    removable.remove();
                    removable = presenter.addPresentation(pressed.present(metrics, audience));
                }, function () {
                    removable.remove();
                    removable = presenter.addPresentation(unpressed.present(unpressedMetrics, audience));
                }, function () {
                    presenter.onResult(symbol);
                }));
                presenter.addPresentation({
                    end: function () {
                        zone.remove();
                    }
                });
            });
        };
        Glyff.prototype.animate = function (duration) {
            var _this = this;
            return Glyff.create(function (metrics, audience, presenter) {
                var startTime = Date.now();
                var endTime = startTime + duration;
                var glyff = _this;
                var presentation;
                var frame;
                function present() {
                    if (presentation) {
                        presentation.end();
                    }
                    var now = Date.now();
                    function currentAge() {
                        if (now >= endTime) {
                            return 1;
                        }
                        else if (now <= startTime) {
                            return 0;
                        }
                        else {
                            return (now - startTime) / duration;
                        }
                    }
                    var perimeter = metrics.perimeter.withAge(currentAge());
                    presentation = glyff.present(metrics.withPerimeter(perimeter), audience, presenter);
                    if (now < endTime) {
                        frame = requestAnimationFrame(function () {
                            present();
                        });
                    }
                }
                present();
                presenter.addPresentation({
                    end: function () {
                        if (frame) {
                            cancelAnimationFrame(frame);
                        }
                        presentation.end();
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
        Glyff.colorAnimation = function (first, last) {
            return Glyff.create(function (metrics, audience, presenter) {
                var colorGlyff = Glyff.color(first.mix(metrics.perimeter.age, last));
                presenter.addPresentation(colorGlyff.present(metrics, audience, presenter));
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