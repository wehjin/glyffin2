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
        PerimeterAudience.prototype.addRectanglePatch = function (bounds, color) {
            return this.audience.addRectanglePatch(bounds, color);
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
    Glyffin.EMPTY_PATCH = {
        remove: function () {
        }
    };
    var Insertion = (function () {
        function Insertion(amount, glyff) {
            this.amount = amount;
            this.glyff = glyff;
        }
        return Insertion;
    })();
    Glyffin.Insertion = Insertion;
    var Glyff = (function () {
        function Glyff(onPresent) {
            this.onPresent = onPresent;
        }
        Glyff.prototype.insertLefts = function (insertions) {
            var current = this;
            var todo = insertions.slice();
            while (todo.length > 0) {
                var insertion = todo.pop();
                current = current.insertLeft(insertion.amount, insertion.glyff);
            }
            return current;
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
        Glyff.fromColor = function (color) {
            return Glyff.create({
                call: function (audience, presenter) {
                    var patch = audience.addRectanglePatch(audience.getPerimeter(), color);
                    presenter.addPresentation({
                        end: function () {
                            patch.remove();
                        }
                    });
                }
            });
        };
        Glyff.create = function (f) {
            return new Glyff(f);
        };
        return Glyff;
    })();
    Glyffin.Glyff = Glyff;
    Glyffin.RedGlyff = Glyff.fromColor(Palette.RED);
    Glyffin.GreenGlyff = Glyff.fromColor(Palette.GREEN);
    Glyffin.BeigeGlyff = Glyff.fromColor(Palette.BEIGE);
    Glyffin.ClearGlyff = Glyff.create({
        call: function (audience, presenter) {
        }
    });
})(Glyffin || (Glyffin = {}));
/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    function asciiString(str) {
        var insertions = [];
        var xWeightWidth = 5;
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i);
            var capWidth = xWeightWidth * x_weights[code];
            insertions.push(new Glyffin.Insertion(capWidth, Glyffin.asciiByCode(code)));
            insertions.push(new Glyffin.Insertion(xWeightWidth, Glyffin.ClearGlyff));
        }
        return Glyffin.GreenGlyff.insertLefts(insertions);
    }
    Glyffin.asciiString = asciiString;
    function asciiChar(ch) {
        return asciiByCode(ch.charCodeAt(0));
    }
    Glyffin.asciiChar = asciiChar;
    function asciiByCode(code) {
        var spots = ascii_spots[code];
        return Glyffin.BeigeGlyff.kaleido(x_weights[code], 7, spots);
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
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        no_spots,
        R_spots,
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
    ];
})(Glyffin || (Glyffin = {}));
/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    var MAX_PATCH_COUNT = 1000;
    var GlAudience = (function () {
        function GlAudience() {
            var canvas = document.getElementById('webgl');
            this.canvas = canvas;
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
        GlAudience.prototype.getPerimeter = function () {
            return this.perimeter;
        };
        GlAudience.prototype.getPalette = function () {
            return this.palette;
        };
        GlAudience.prototype.addRectanglePatch = function (bounds, color) {
            if (bounds.left >= bounds.right || bounds.top >= bounds.bottom || color.alpha == 0) {
                return Glyffin.EMPTY_PATCH;
            }
            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right, bounds.bottom, color);
            this.scheduleRedraw();
            return {
                remove: function () {
                    this.vertices.putPatch(patch);
                }
            };
        };
        GlAudience.prototype.scheduleRedraw = function () {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.getActiveVertexCount());
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
            this.emptyPatchVertices = new Float32Array(FLOATS_PER_PATCH);
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
        VerticesAndColor.prototype.getPatch = function (left, top, right, bottom, color) {
            var patchIndex = this.nextPatchIndex++;
            var patchVertices = new Float32Array([left, top, color.red, color.green, color.blue, color.alpha, right, top, color.red, color.green, color.blue, color.alpha, left, bottom, color.red, color.green, color.blue, color.alpha, left, bottom, color.red, color.green, color.blue, color.alpha, right, top, color.red, color.green, color.blue, color.alpha, right, bottom, color.red, color.green, color.blue, color.alpha,]);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * BYTES_PER_PATCH, patchVertices);
            return patchIndex;
        };
        VerticesAndColor.prototype.putPatch = function (patchIndex) {
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * BYTES_PER_PATCH, this.emptyPatchVertices);
        };
        return VerticesAndColor;
    })();
})(Glyffin || (Glyffin = {}));
/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
var Insertion = Glyffin.Insertion;
function main() {
    var glAudience = new Glyffin.GlAudience();
    var spaceWidth = 5;
    var lineHeight = 35;
    var topGlyff = Glyffin.asciiString("ABCDEFGHIJK").inset(spaceWidth);
    Glyffin.RedGlyff.insertTop(lineHeight, topGlyff).present(glAudience);
}
//# sourceMappingURL=combined.js.map