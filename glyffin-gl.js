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
            this.vertices = new Vertices(MAX_PATCH_COUNT, gl);
            this.gl = gl;
            var viewMatrix = new Matrix4();
            viewMatrix.setTranslate(-1, 1, 0);
            viewMatrix.scale(2 / canvas.width, -2 / canvas.height, 1);
            var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');
            gl.uniformMatrix4fv(u_ModelMatrix, false, viewMatrix.elements);
            var color = Glyffin.Palette.BEIGE;
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
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.getActiveVertexCount());
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
            this.emptyPatchVertices = new Float32Array(Vertices.FLOATS_PER_PATCH);
            this.gl = gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            var vertices = new Float32Array(maxPatchCount * Vertices.VERTICES_PER_PATCH);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, Vertices.FLOATS_PER_VERTEX, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
        }
        Vertices.prototype.getActiveVertexCount = function () {
            return this.nextPatchIndex * Vertices.VERTICES_PER_PATCH;
        };
        Vertices.prototype.getPatch = function (left, top, right, bottom) {
            var patchIndex = this.nextPatchIndex++;
            var patchVertices = new Float32Array([left, top, right, top, left, bottom, left, bottom, right, top, right, bottom]);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * Vertices.BYTES_PER_PATCH, patchVertices);
            return patchIndex;
        };
        Vertices.prototype.putPatch = function (patchIndex) {
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * Vertices.BYTES_PER_PATCH, this.emptyPatchVertices);
        };
        Vertices.VERTICES_PER_PATCH = 6;
        Vertices.FLOATS_PER_VERTEX = 2;
        Vertices.BYTES_PER_FLOAT = 4;
        Vertices.BYTES_PER_PATCH = Vertices.VERTICES_PER_PATCH * Vertices.FLOATS_PER_VERTEX * Vertices.BYTES_PER_FLOAT;
        Vertices.FLOATS_PER_PATCH = Vertices.VERTICES_PER_PATCH * Vertices.FLOATS_PER_VERTEX;
        return Vertices;
    })();
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-gl.js.map