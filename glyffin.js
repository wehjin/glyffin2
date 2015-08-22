/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin-basic.ts" />
var Glyffin;
(function (Glyffin) {
    var Insertion = (function () {
        function Insertion(amount, glyff) {
            this.amount = amount;
            this.glyff = glyff;
        }
        return Insertion;
    })();
    Glyffin.Insertion = Insertion;
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
        ClickGesturing.prototype.isDrained = function () {
            return this.isEnded;
        };
        ClickGesturing.prototype.isPowered = function () {
            return !this.isEnded;
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
        ClickGesturing.prototype.move = function (spot) {
            if (this.isEnded) {
                return 3 /* DRAINED */;
            }
            if (spot.gridDistance(this.startSpot) > this.threshold) {
                this.doEnd();
                return 3 /* DRAINED */;
            }
            return 1 /* CHARGED */;
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
    var LinearAnimationPath = (function () {
        function LinearAnimationPath(duration, reverse) {
            this.duration = duration;
            this.reverse = reverse;
        }
        LinearAnimationPath.prototype.start = function (now) {
            this.startTime = now;
            this.endTime = this.startTime + this.duration;
        };
        LinearAnimationPath.prototype.getAge = function (now) {
            if (now >= this.endTime) {
                return this.reverse ? 0 : 1;
            }
            if (now <= this.startTime) {
                return this.reverse ? 1 : 0;
            }
            var age = (now - this.startTime) / this.duration;
            return this.reverse ? (1 - age) : age;
        };
        LinearAnimationPath.prototype.hasMore = function (now) {
            return now < this.endTime;
        };
        return LinearAnimationPath;
    })();
    var CycleAnimationPath = (function () {
        function CycleAnimationPath(duration, count) {
            this.duration = duration;
            this.reversed = false;
            this.innerPath = new LinearAnimationPath(duration, this.reversed);
            this.lives = count * 2 - 1;
        }
        CycleAnimationPath.prototype.start = function (now) {
            this.started = true;
            this.innerPath.start(now);
        };
        CycleAnimationPath.prototype.getAge = function (now) {
            return this.innerPath.getAge(now);
        };
        CycleAnimationPath.prototype.hasMore = function (now) {
            var hasMore = this.innerPath.hasMore(now);
            if (!hasMore) {
                if (this.started && this.lives > 0) {
                    this.lives--;
                    this.reversed = !this.reversed;
                    this.innerPath = new LinearAnimationPath(this.duration, this.reversed);
                    this.innerPath.start(now);
                    hasMore = this.innerPath.hasMore(now);
                }
            }
            return hasMore;
        };
        return CycleAnimationPath;
    })();
    var BasePresenter = (function () {
        function BasePresenter(perimeter, audience, reactionOrOnResult, onError) {
            this.presentations = [];
            this.ended = false;
            this.perimeter = perimeter;
            this.audience = audience;
            this.reactionOrOnResult = reactionOrOnResult;
            this._onError = onError;
        }
        BasePresenter.prototype.addPresentation = function (presentation) {
            var _this = this;
            if (this.ended) {
                throw "addPresentation called after end";
            }
            var index = this.presentations.length;
            this.presentations.push(presentation);
            return {
                remove: function () {
                    var presentation = _this.presentations[index];
                    if (presentation) {
                        _this.presentations[index] = null;
                        presentation.end();
                    }
                }
            };
        };
        BasePresenter.prototype.onResult = function (result) {
            if (typeof this.reactionOrOnResult === 'object') {
                this.reactionOrOnResult.onResult(result);
            }
            else if (typeof this.reactionOrOnResult === 'function') {
                this.reactionOrOnResult(result);
            }
        };
        BasePresenter.prototype.onError = function (error) {
            if (typeof this.reactionOrOnResult === 'object') {
                this.reactionOrOnResult.onError(error);
            }
            else if (this.onError) {
                this.onError(error);
            }
        };
        BasePresenter.prototype.end = function () {
            this.ended = true;
            for (var i = 0; i < this.presentations.length; i++) {
                var presentation = this.presentations[i];
                if (presentation) {
                    this.presentations[i] = null;
                    presentation.end();
                }
            }
        };
        return BasePresenter;
    })();
    var Glyff = (function () {
        function Glyff(onPresent) {
            this.onPresent = onPresent;
            this.depth = 0;
        }
        Glyff.create = function (onPresent, depth) {
            var glyff = new Glyff(onPresent);
            glyff.depth = depth || 0;
            return glyff;
        };
        Glyff.prototype.present = function (perimeter, audience, reactionOrOnResult, onError) {
            var presenter = new BasePresenter(perimeter, audience, reactionOrOnResult, onError);
            this.onPresent(presenter);
            return presenter;
        };
        Glyff.prototype.lift = function (lifter, depth) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var lifted = lifter(presenter);
                presenter.addPresentation(_this.present(lifted.perimeter, lifted.audience, lifted));
            }, depth || 0);
        };
        Glyff.prototype.rebuild = function (builder) {
            var rebuilt = builder(this);
            return Glyff.create(function (presenter) {
                presenter.addPresentation(rebuilt.present(presenter.perimeter, presenter.audience, presenter));
            }, rebuilt.depth);
        };
        Glyff.prototype.compose = function (mogrifier, depth) {
            var upperGlyff = this;
            return Glyff.create(function (presenter) {
                var perimeter = mogrifier.getPerimeter(presenter);
                var audience = mogrifier.getUpperAudience(presenter);
                var reaction = mogrifier.getUpperReaction(presenter);
                presenter.addPresentation(upperGlyff.present(perimeter, audience, reaction));
            }, depth || 0);
        };
        Glyff.prototype.disappear = function (disappeared) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = disappeared ? {
                    addPatch: function (bounds, color) {
                        return Glyffin.EMPTY_REMOVABLE;
                    },
                    addZone: function (bounds, touchProvider) {
                        return presenter.audience.addZone(bounds, touchProvider);
                    },
                    present: function (glyff, reactionOrOnResult, onError) {
                        return presenter.audience.present(glyff, reactionOrOnResult, onError);
                    }
                } : presenter.audience;
                presenter.addPresentation(_this.present(presenter.perimeter, audience, presenter));
            }, this.depth);
        };
        Glyff.prototype.isolate = function (isolated) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = isolated ? {
                    addPatch: function (bounds, color) {
                        return presenter.audience.addPatch(bounds, color);
                    },
                    addZone: function (bounds, touchProvider) {
                        return Glyffin.EMPTY_REMOVABLE;
                    },
                    present: function (glyff, reactionOrOnResult, onError) {
                        return presenter.audience.present(glyff, reactionOrOnResult, onError);
                    }
                } : presenter.audience;
                presenter.addPresentation(_this.present(presenter.perimeter, audience, presenter));
            }, this.depth);
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
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitWidth(size);
                presenter.addPresentation(glyff.present(split[0], audience, presenter));
                presenter.addPresentation(_this.present(split[1], audience, presenter));
            }, Math.max(this.depth, glyff.depth));
        };
        Glyff.prototype.splitHeight = function (size, topGlyff) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(split[0], audience, presenter));
                presenter.addPresentation(_this.present(split[1], audience, presenter));
            }, Math.max(this.depth, topGlyff.depth));
        };
        Glyff.prototype.splitHeightYield = function (size, topGlyff) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(split[0], audience, presenter));
                presenter.addPresentation(_this.present(split[1], audience, new Glyffin.NoResultReaction(presenter)));
            }, Math.max(this.depth, topGlyff.depth));
        };
        Glyff.prototype.splitHeightRetain = function (size, addGlyff) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(addGlyff.present(split[0], audience, new Glyffin.NoResultReaction(presenter)));
                presenter.addPresentation(_this.present(split[1], audience, presenter));
            }, Math.max(this.depth, addGlyff.depth));
        };
        Glyff.prototype.over = function (farGlyph, dz) {
            var nearGlyff = this;
            var gapToNear = farGlyph.depth + (1 + (dz ? dz : 0));
            function onPresent(presenter) {
                var audience = presenter.audience;
                var farPerimeter = presenter.perimeter;
                var nearPerimeter = farPerimeter.withLevel(farPerimeter.level + gapToNear);
                presenter.addPresentation(farGlyph.present(farPerimeter, audience, presenter));
                presenter.addPresentation(nearGlyff.present(nearPerimeter, audience, presenter));
            }
            return Glyff.create(onPresent, gapToNear + nearGlyff.depth);
        };
        Glyff.prototype.addNearMajor = function (level, nearGlyff) {
            var farGlyff = this;
            var gapToNear = farGlyff.depth + level;
            function onPresent(presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                presenter.addPresentation(farGlyff.present(perimeter, audience, new Glyffin.NoResultReaction(presenter)));
                var nearPerimeter = perimeter.addLevel(gapToNear);
                presenter.addPresentation(nearGlyff.present(nearPerimeter, audience, presenter));
            }
            return Glyff.create(onPresent, gapToNear + nearGlyff.depth);
        };
        Glyff.prototype.revealDown = function (inset, revelation) {
            var _this = this;
            var gapToCover = revelation.depth + 1;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var perimeterHeight = perimeter.getHeight();
                var maxRevelationHeight = inset.getPixels(perimeterHeight);
                var revelationPerimeter = perimeter.resizeFromTop(maxRevelationHeight);
                var revelationHeight;
                var unpresent = null;
                var cover = _this;
                function setRevelationHeight(height) {
                    revelationHeight = Math.max(0, Math.min(height, maxRevelationHeight));
                    var coverPerimeter = perimeter.downFromTop(revelationHeight, perimeterHeight).addLevel(gapToCover);
                    if (unpresent) {
                        unpresent();
                    }
                    var revelationRemovable = presenter.addPresentation(revelation.isolate(revelationHeight < maxRevelationHeight).disappear(revelationHeight <= 0).present(revelationPerimeter, audience, presenter));
                    var coverRemovable = presenter.addPresentation(cover.present(coverPerimeter, audience, presenter));
                    unpresent = function () {
                        coverRemovable.remove();
                        revelationRemovable.remove();
                    };
                }
                var anchorHeight;
                var zone;
                var zonePerimeter = perimeter.addLevel(gapToCover);
                function setAnchorHeight(height) {
                    if (zone) {
                        zone.remove();
                    }
                    setRevelationHeight(height);
                    anchorHeight = height;
                    zone = audience.addZone(zonePerimeter, {
                        init: function (spot) {
                            return new Glyffin.VerticalGesturing(spot, perimeter.tapHeight / 2 * (anchorHeight <= 0 ? 1 : -1), function (moved) {
                                setRevelationHeight(anchorHeight + moved);
                            }, function () {
                                setRevelationHeight(anchorHeight);
                            }, function () {
                                var target = anchorHeight <= 0 ? maxRevelationHeight : 0;
                                var distanceFromTarget = Math.abs(revelationHeight - target);
                                if (distanceFromTarget < maxRevelationHeight / 2) {
                                    setAnchorHeight(target);
                                }
                                else {
                                    setRevelationHeight(anchorHeight);
                                }
                            });
                        }
                    });
                }
                setAnchorHeight(0);
                presenter.addPresentation({
                    end: function () {
                        if (zone) {
                            zone.remove();
                        }
                    }
                });
            }, gapToCover + this.depth);
        };
        Glyff.prototype.limitWidth = function (maxWidth, align) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var width = perimeter.getWidth();
                if (width <= maxWidth) {
                    presenter.addPresentation(_this.present(perimeter, audience, presenter));
                }
                else {
                    var narrowPerimeter = perimeter.limitWidth(maxWidth, align);
                    presenter.addPresentation(_this.present(narrowPerimeter, audience, presenter));
                }
            }, this.depth);
        };
        Glyff.prototype.limitHeight = function (maxHeight, align) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var height = perimeter.getHeight();
                if (height <= maxHeight) {
                    presenter.addPresentation(_this.present(perimeter, audience, presenter));
                }
                else {
                    var shortPerimeter = perimeter.limitHeight(maxHeight, align);
                    presenter.addPresentation(_this.present(shortPerimeter, audience, presenter));
                }
            }, this.depth);
        };
        Glyff.prototype.kaleid = function (columns, rows, spots) {
            var upperGlyff = this;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var rowHeight = perimeter.getHeight() / rows;
                var colWidth = perimeter.getWidth() / columns;
                for (var i = 0, count = spots.length; i < count; i++) {
                    var spot = spots[i];
                    var left = perimeter.left + colWidth * spot[0];
                    var top = perimeter.top + rowHeight * spot[1];
                    var spotPerimeter = perimeter.at(left, top, left + colWidth, top + rowHeight);
                    new Glyffin.Perimeter(left, top, left + colWidth, top + rowHeight, perimeter.age, perimeter.level, perimeter.tapHeight, perimeter.readHeight, perimeter.palette);
                    presenter.addPresentation(upperGlyff.present(spotPerimeter, audience, presenter));
                }
            }, this.depth);
        };
        // TODO: Integrate with pad2.
        Glyff.prototype.pad = function (xPixels, yPixels) {
            return this.compose({
                getPerimeter: function (presenter) {
                    return presenter.perimeter.inset(xPixels, yPixels);
                },
                getUpperAudience: function (presenter) {
                    return presenter.audience;
                },
                getUpperReaction: function (presenter) {
                    return presenter;
                }
            });
        };
        Glyff.prototype.pad2 = function (inset) {
            return this.lift(function (lowerPresenter) {
                var perimeter = lowerPresenter.perimeter;
                var insetPerimeter = perimeter.inset2(inset);
                return {
                    perimeter: insetPerimeter,
                    audience: lowerPresenter.audience,
                    addPresentation: function (presentation) {
                        return lowerPresenter.addPresentation(presentation);
                    },
                    onResult: function (result) {
                        lowerPresenter.onResult(result);
                    },
                    onError: function (err) {
                        lowerPresenter.onError(err);
                    },
                    end: function () {
                        lowerPresenter.end();
                    }
                };
            });
        };
        Glyff.prototype.move = function (x) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var perimeter = presenter.perimeter.translate(x);
                presenter.addPresentation(_this.present(perimeter, audience, presenter));
            }, this.depth);
        };
        Glyff.prototype.clicken = function (symbol, pressed) {
            var unpressed = this;
            var gapToUnpressed = 4; // No need to add pressed.depth.  The two are never draw at
            // the same time.
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var unpressedPerimeter = presenter.perimeter;
                var unpressedPerimeter = unpressedPerimeter.addLevel(gapToUnpressed);
                var removable = presenter.addPresentation(unpressed.present(unpressedPerimeter, audience));
                var zone = audience.addZone(unpressedPerimeter, new ClickGesturable(unpressedPerimeter.tapHeight / 2, function () {
                    if (!pressed) {
                        return;
                    }
                    removable.remove();
                    removable = presenter.addPresentation(pressed.present(unpressedPerimeter, audience));
                }, function () {
                    if (!pressed) {
                        return;
                    }
                    removable.remove();
                    removable = presenter.addPresentation(unpressed.present(unpressedPerimeter, audience));
                }, function () {
                    presenter.onResult(symbol);
                }));
                presenter.addPresentation({
                    end: function () {
                        zone.remove();
                    }
                });
            }, gapToUnpressed + unpressed.depth);
        };
        Glyff.prototype.pagen = function (index, next, prev) {
            var _this = this;
            var gapToCenter = (next ? next.depth + 1 : 0);
            var gapToLeft = gapToCenter + this.depth + 1;
            var newDepth = gapToLeft + (prev ? prev.depth : 0);
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var current = _this;
                var centerPerimeter = perimeter.addLevel(gapToCenter);
                var leftPerimeter = perimeter.addLevel(gapToLeft);
                var noResultReaction = new Glyffin.NoResultReaction(presenter);
                var slideRange = perimeter.right;
                var centerAdded, rightAdded, leftAdded;
                function setCenter(glyff) {
                    if (centerAdded) {
                        centerAdded.remove();
                    }
                    centerAdded = presenter.addPresentation(glyff.present(centerPerimeter, audience, presenter));
                }
                var centerSlide;
                function setCenterSlide(newSlide) {
                    if (newSlide !== centerSlide) {
                        centerSlide = newSlide;
                        setCenter(newSlide === 0 ? current : current.move(newSlide));
                    }
                }
                function showRight(show) {
                    if (show && !rightAdded && next) {
                        rightAdded = presenter.addPresentation(next.present(perimeter, audience, noResultReaction));
                    }
                    else if (!show && rightAdded) {
                        rightAdded.remove();
                        rightAdded = null;
                    }
                }
                var leftSlide;
                function setLeftSlide(newSlide) {
                    if (newSlide <= -slideRange) {
                        newSlide = -slideRange;
                    }
                    if (newSlide >= 0) {
                        newSlide = 0;
                    }
                    if (newSlide !== leftSlide) {
                        leftSlide = newSlide;
                        setLeft((newSlide <= -slideRange || !prev) ? null : prev.move(newSlide));
                    }
                }
                function setLeft(glyff) {
                    if (leftAdded) {
                        leftAdded.remove();
                    }
                    if (glyff) {
                        leftAdded = presenter.addPresentation(glyff.present(leftPerimeter, audience, noResultReaction));
                    }
                }
                var triggerAge = (perimeter.tapHeight * 1.5) / slideRange;
                var age = 0.0;
                function setAge(newAge) {
                    setCenterSlide(newAge <= 0 ? 0 : (newAge * -slideRange));
                    showRight(newAge > 0);
                    setLeftSlide(newAge >= 0 ? -slideRange : (newAge + 1) * -slideRange);
                    age = newAge;
                }
                var stopAnimation;
                function animateAge(newAge, ageVelocity, onEnd) {
                    if (stopAnimation) {
                        stopAnimation();
                    }
                    var startAge = age;
                    var ageRange = newAge - startAge;
                    var startTime = Date.now();
                    var duration = 200;
                    if (ageVelocity * ageRange > 0) {
                        // Velocity and range are in same direction and both non-zero.
                        // Continue to see if we should shorten the duration.
                        var minVelocity = ageRange / duration;
                        if (ageVelocity / minVelocity > 1) {
                            // Moving faster than minimum.  Get new duration.
                            duration = ageRange / ageVelocity;
                        }
                    }
                    var frame;
                    stopAnimation = function () {
                        if (frame) {
                            window.cancelAnimationFrame(frame);
                            frame = 0;
                        }
                        stopAnimation = null;
                    };
                    function animate() {
                        if (age == newAge) {
                            stopAnimation = null;
                            setTimeout(function () {
                                if (onEnd) {
                                    onEnd();
                                }
                            }, 1);
                            return;
                        }
                        frame = window.requestAnimationFrame(function () {
                            frame = 0;
                            var elapsed = (Date.now() - startTime);
                            var progress = (elapsed / duration) + .001; // Bias ensures we get there
                            setAge(elapsed >= duration ? newAge : startAge + ageRange * progress);
                            animate();
                        });
                    }
                    // Animate only after initializing stopAnimation so that animate can set
                    // it to null if needed.
                    animate();
                }
                setAge(0);
                var zone = audience.addZone(perimeter, {
                    init: function (startSpot) {
                        if (stopAnimation) {
                            return null;
                        }
                        var moveFrame;
                        var targetAge = age;
                        return new Glyffin.PagenGesturing(startSpot, perimeter.tapHeight * .75, function (pixelsMoved) {
                            targetAge = -pixelsMoved / slideRange * 1.2;
                            if ((targetAge < 0 && !prev) || (targetAge > 0 && !next)) {
                                targetAge = 0;
                            }
                            if (!moveFrame) {
                                moveFrame = setTimeout(function () {
                                    if (!moveFrame) {
                                        return;
                                    }
                                    moveFrame = 0;
                                    setAge(targetAge);
                                }, 3);
                            }
                        }, function () {
                            moveFrame = 0;
                            setAge(0);
                        }, function (velocity) {
                            moveFrame = 0;
                            var ageVelocity = -velocity / slideRange;
                            if (Math.abs(targetAge) < triggerAge) {
                                animateAge(0, ageVelocity, null);
                            }
                            else if (targetAge > 0) {
                                animateAge(1, ageVelocity, function () {
                                    presenter.onResult("next");
                                });
                            }
                            else {
                                animateAge(-1, ageVelocity, function () {
                                    presenter.onResult("back");
                                });
                            }
                        });
                    }
                });
                presenter.addPresentation({
                    end: function () {
                        zone.remove();
                    }
                });
            }, newDepth);
        };
        Glyff.prototype.animateWithPath = function (path) {
            var _this = this;
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                path.start(Date.now());
                var presentation;
                var frame;
                var present = function () {
                    var now = Date.now();
                    var agedPerimeter = perimeter.withAge(path.getAge(now));
                    presentation = _this.present(agedPerimeter, audience, presenter);
                    if (path.hasMore(now)) {
                        frame = requestAnimationFrame(function () {
                            presentation.end();
                            present();
                        });
                    }
                };
                present();
                presenter.addPresentation({
                    end: function () {
                        if (frame) {
                            cancelAnimationFrame(frame);
                        }
                        presentation.end();
                    }
                });
            }, this.depth);
        };
        Glyff.prototype.animate = function (duration) {
            return this.animateWithPath(new LinearAnimationPath(duration, true));
        };
        Glyff.prototype.pulseAnimate = function (duration, count) {
            return this.animateWithPath(new CycleAnimationPath(duration, count));
        };
        Glyff.color = function (color) {
            return Glyff.create(function (presenter) {
                var audience = presenter.audience;
                var patch = audience.addPatch(presenter.perimeter, color);
                presenter.addPresentation({
                    end: function () {
                        patch.remove();
                    }
                });
            }, 0);
        };
        Glyff.colorAnimation = function (first, last) {
            return Glyff.create(function (presenter) {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var colorGlyff = Glyff.color(first.mix(perimeter.age, last));
                presenter.addPresentation(colorGlyff.present(perimeter, audience, presenter));
            }, 0);
        };
        return Glyff;
    })();
    Glyffin.Glyff = Glyff;
    Glyffin.ClearGlyff = Glyff.create(function () {
    }, 0);
    function colorPath(colorPath, mix, colorPath2) {
        return Glyff.create(function (presenter) {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var color = perimeter.palette.get(colorPath);
            if (mix) {
                color = color.mix(mix, perimeter.palette.get(colorPath2));
            }
            var colorGlyff = Glyff.color(color);
            presenter.addPresentation(colorGlyff.present(perimeter, audience, null, null));
        }, 0);
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