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
    var Show = (function () {
        function Show(onShow) {
            this.onShow = onShow;
        }
        Show.create = function (onShow) {
            return new Show(onShow);
        };
        Show.prototype.open = function (audience, producer) {
            var curtains = [];
            this.onShow.onShow({
                addCurtain: function (curtain) {
                    curtains.push(curtain);
                },
                addRel: function (bounds) {
                    return audience.addRel(bounds);
                },
                onResult: function (result) {
                    if (producer) {
                        producer.onResult(result);
                    }
                }
            });
            return {
                close: function () {
                    while (curtains.length > 0) {
                        curtains.pop().close();
                    }
                }
            };
        };
        return Show;
    })();
    Glyffin.Show = Show;
    Glyffin.RedShow = Show.create({
        onShow: function (director) {
            var rel = director.addRel(null);
            director.addCurtain({
                close: function () {
                    rel.remove();
                }
            });
        }
    });
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin.js.map