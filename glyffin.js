/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
var Glyffin;
(function (Glyffin) {
    var Void = (function () {
        function Void() {
        }
        return Void;
    })();
    Glyffin.Void = Void;
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
        RectangleBounds.prototype.inset = function (pixels) {
            return new RectangleBounds(this.left + pixels, this.top + pixels, this.right - pixels, this.bottom - pixels);
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
    var PerimeterAudience = (function () {
        function PerimeterAudience(perimeter, audience) {
            this.perimeter = perimeter;
            this.audience = audience;
        }
        PerimeterAudience.prototype.getPerimeter = function () {
            return this.perimeter;
        };
        PerimeterAudience.prototype.getPalette = function () {
            return this.audience.getPalette();
        };
        PerimeterAudience.prototype.addRectanglePatch = function (bounds) {
            return this.audience.addRectanglePatch(bounds);
        };
        return PerimeterAudience;
    })();
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
    var Glyff = (function () {
        function Glyff(onPresent) {
            this.onPresent = onPresent;
        }
        Glyff.create = function (f) {
            return new Glyff(f);
        };
        Glyff.prototype.insertLeft = function (insertAmount, insertGlyff) {
            var existingGlyff = this;
            return Glyff.create({
                call: function (audience, presenter) {
                    var perimeter = audience.getPerimeter();
                    var insertRight = perimeter.left + insertAmount;
                    var insertPerimeter = new RectangleBounds(perimeter.left, perimeter.top, insertRight, perimeter.bottom);
                    var modifiedPerimeter = new RectangleBounds(insertRight, perimeter.top, perimeter.right, perimeter.bottom);
                    presenter.addPresentation(insertGlyff.present(new PerimeterAudience(insertPerimeter, audience), presenter));
                    presenter.addPresentation(existingGlyff.present(new PerimeterAudience(modifiedPerimeter, audience), presenter));
                }
            });
        };
        Glyff.prototype.insertTop = function (insertAmount, insertGlyff) {
            var existingGlyff = this;
            return Glyff.create({
                call: function (audience, presenter) {
                    var perimeter = audience.getPerimeter();
                    var insertBottom = perimeter.top + insertAmount;
                    var insertPerimeter = new RectangleBounds(perimeter.left, perimeter.top, perimeter.right, insertBottom);
                    var modifiedPerimeter = new RectangleBounds(perimeter.left, insertBottom, perimeter.right, perimeter.bottom);
                    presenter.addPresentation(insertGlyff.present(new PerimeterAudience(insertPerimeter, audience), presenter));
                    presenter.addPresentation(existingGlyff.present(new PerimeterAudience(modifiedPerimeter, audience), presenter));
                }
            });
        };
        Glyff.prototype.kaleido = function (columns, rows, spots) {
            var upperGlyff = this;
            return Glyff.create({
                call: function (audience, presenter) {
                    var perimeter = audience.getPerimeter();
                    var rowHeight = perimeter.getHeight() / rows;
                    var colWidth = perimeter.getWidth() / columns;
                    spots.forEach(function (spot) {
                        var left = perimeter.left + colWidth * spot[0];
                        var top = perimeter.top + rowHeight * spot[1];
                        var spotPerimeter = new RectangleBounds(left, top, left + colWidth, top + rowHeight);
                        presenter.addPresentation(upperGlyff.present(new PerimeterAudience(spotPerimeter, audience), presenter));
                    });
                }
            });
        };
        Glyff.prototype.inset = function (pixels) {
            return this.compose({
                getUpperAudience: function (audience, presenter) {
                    var insetPerimeter = audience.getPerimeter().inset(pixels);
                    return new PerimeterAudience(insetPerimeter, audience);
                },
                getUpperReaction: function (audience, presenter) {
                    return presenter;
                }
            });
        };
        Glyff.prototype.compose = function (operation) {
            var upperGlyff = this;
            return Glyff.create({
                call: function (audience, presenter) {
                    presenter.addPresentation(upperGlyff.present(operation.getUpperAudience(audience, presenter), operation.getUpperReaction(audience, presenter)));
                }
            });
        };
        Glyff.prototype.present = function (audience, reaction) {
            //noinspection JSUnusedLocalSymbols
            var firmReaction = reaction ? reaction : {
                onResult: function (result) {
                },
                onError: function (error) {
                }
            };
            var presented = [];
            var presenter = {
                addPresentation: function (presentation) {
                    presented.push(presentation);
                },
                onResult: function (result) {
                    firmReaction.onResult(result);
                },
                onError: function (error) {
                    firmReaction.onError(error);
                }
            };
            this.onPresent.call(audience, presenter);
            return {
                end: function () {
                    while (presented.length > 0) {
                        presented.pop().end();
                    }
                }
            };
        };
        return Glyff;
    })();
    Glyffin.Glyff = Glyff;
    Glyffin.RedGlyff = Glyff.create({
        call: function (audience, presenter) {
            var perimeter = audience.getPerimeter();
            var patch = audience.addRectanglePatch(perimeter);
            presenter.addPresentation({
                end: function () {
                    patch.remove();
                }
            });
        }
    });
    Glyffin.ClearGlyff = Glyff.create({
        call: function (audience, presenter) {
        }
    });
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin.js.map