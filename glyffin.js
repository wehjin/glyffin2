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
    var GlAudience = (function () {
        function GlAudience() {
            var canvas = document.getElementById('webgl');
            this.canvas = canvas;
            this.perimeter = new RectangleBounds(0, 0, canvas.width, canvas.height);
            this.palette = new Palette();
            var gl = getWebGLContext(canvas);
            initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.vertices = new Vertices(8, gl);
            this.gl = gl;
            var viewMatrix = new Matrix4();
            viewMatrix.setTranslate(-1, 1, 0);
            viewMatrix.scale(2 / canvas.width, -2 / canvas.height, 1);
            var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');
            gl.uniformMatrix4fv(u_ModelMatrix, false, viewMatrix.elements);
            var color = Palette.BEIGE;
            var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
            gl.uniform4f(u_FragColor, color.red, color.green, color.blue, color.alpha);
        }
        GlAudience.prototype.getPerimeter = function () {
            return this.perimeter;
        };
        GlAudience.prototype.getPalette = function () {
            return this.palette;
        };
        GlAudience.prototype.addRectanglePatch = function (bounds) {
            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right, bounds.bottom);
            this.scheduleRedraw();
            return {
                remove: function () {
                    this.vertices.putPatch(patch);
                }
            };
        };
        GlAudience.prototype.scheduleRedraw = function () {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        };
        return GlAudience;
    })();
    Glyffin.GlAudience = GlAudience;
    var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' + 'uniform mat4 u_viewMatrix;\n' + 'void main(){\n' + '  gl_Position = u_viewMatrix * a_Position;\n' + '}\n';
    var FSHADER_SOURCE = 'precision mediump float;' + 'uniform vec4 u_FragColor;\n' + 'void main(){\n' + '  gl_FragColor = u_FragColor;\n' + '}\n';
    var Vertices = (function () {
        function Vertices(maxPatchCount, gl) {
            this.maxPatchCount = maxPatchCount;
            this.nextPatchIndex = 0;
            this.emptyPatchVertices = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
            this.gl = gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            var vertices = new Float32Array(maxPatchCount * Vertices.VERTICES_PER_PATCH);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, Vertices.FLOATS_PER_VERTEX, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
        }
        Vertices.prototype.getPatch = function (left, top, right, bottom) {
            var patchIndex = this.nextPatchIndex++;
            var patchVertices = new Float32Array([left, top, right, top, left, bottom, right, bottom]);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * Vertices.BYTES_PER_PATCH, patchVertices);
            return patchIndex;
        };
        Vertices.prototype.putPatch = function (patchIndex) {
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * Vertices.BYTES_PER_PATCH, this.emptyPatchVertices);
        };
        Vertices.VERTICES_PER_PATCH = 4;
        Vertices.FLOATS_PER_VERTEX = 2;
        Vertices.BYTES_PER_FLOAT = 4;
        Vertices.BYTES_PER_PATCH = Vertices.VERTICES_PER_PATCH * Vertices.FLOATS_PER_VERTEX * Vertices.BYTES_PER_FLOAT;
        return Vertices;
    })();
    var Glyff = (function () {
        function Glyff(onPresent) {
            this.onPresent = onPresent;
        }
        Glyff.create = function (f) {
            return new Glyff(f);
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
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin.js.map