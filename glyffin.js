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
    var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' + 'void main(){\n' + '  gl_Position = a_Position;\n' + '  gl_PointSize = 10.0;\n' + '}\n';
    var FSHADER_SOURCE = 'void main(){\n' + '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + '}\n';
    var GlAudience = (function () {
        function GlAudience() {
            this.canvas = document.getElementById('webgl');
            this.perimeter = new RectangleBounds(0, 0, this.canvas.width, this.canvas.height);
            this.gl = getWebGLContext(this.canvas);
            var gl = this.gl;
            initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            var maxPatchCount = 8;
            var verticesPerPatch = 4;
            this.vertices = new Float32Array(maxPatchCount * verticesPerPatch);
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        }
        GlAudience.prototype.getPerimeter = function () {
            return this.perimeter;
        };
        GlAudience.prototype.addRectanglePatch = function (bounds) {
            var stride = 4 * 2 * 4;
            var patchIndex = 0;
            var vertices = new Float32Array([bounds.left, bounds.top, bounds.right, bounds.top, bounds.left, bounds.bottom, bounds.right, bounds.bottom]);
            var bytesBefore = patchIndex * stride;
            var gl = this.gl;
            gl.bufferSubData(gl.ARRAY_BUFFER, bytesBefore, vertices);
            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
            this.scheduleRedraw();
            return {
                remove: function () {
                }
            };
        };
        GlAudience.prototype.initVertexBuffers = function (gl) {
            var vertices = new Float32Array([-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5]);
            var n = 4;
            return n;
        };
        GlAudience.prototype.scheduleRedraw = function () {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        };
        return GlAudience;
    })();
    Glyffin.GlAudience = GlAudience;
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