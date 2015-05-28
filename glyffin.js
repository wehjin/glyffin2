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
    var RelBounds = (function () {
        function RelBounds() {
        }
        return RelBounds;
    })();
    Glyffin.RelBounds = RelBounds;
    var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' + 'void main(){\n' + '  gl_Position = a_Position;\n' + '  gl_PointSize = 10.0;\n' + '}\n';
    var FSHADER_SOURCE = 'void main(){\n' + '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + '}\n';
    var GlAudience = (function () {
        function GlAudience() {
            var canvas = document.getElementById('webgl');
            var gl = getWebGLContext(canvas);
            initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl = gl;
            this.vertexCount = this.initVertexBuffers(this.gl);
        }
        GlAudience.prototype.initVertexBuffers = function (gl) {
            var vertices = new Float32Array([-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5]);
            var n = 4;
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
            return n;
        };
        GlAudience.prototype.scheduleRedraw = function () {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount);
        };
        GlAudience.prototype.addRel = function (bounds) {
            this.scheduleRedraw();
            return null;
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
    Glyffin.RedShow = Glyff.create({
        call: function (audience, presenter) {
            var rel = audience.addRel(null);
            presenter.addPresentation({
                end: function () {
                    rel.remove();
                }
            });
        }
    });
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin.js.map