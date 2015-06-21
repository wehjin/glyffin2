/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    var MAX_PATCH_COUNT = 10000;
    var Interactive = (function () {
        function Interactive(bounds, touchProvider) {
            this.bounds = bounds;
            this.touchProvider = touchProvider;
        }
        Interactive.prototype.isHit = function (touchX, touchY) {
            return this.bounds.left <= touchX && this.bounds.right >= touchX && this.bounds.top <= touchY && this.bounds.bottom >= touchY;
        };
        Interactive.findHits = function (all, x, y) {
            var hitInteractives = [];
            all.forEach(function (interactive) {
                if (interactive.isHit(x, y)) {
                    hitInteractives.push(interactive);
                }
            });
            return hitInteractives;
        };
        return Interactive;
    })();
    var GlAudience = (function () {
        function GlAudience() {
            var _this = this;
            this.interactives = [];
            this.drawCount = 0;
            this.editCount = 0;
            var canvas = document.getElementById('webgl');
            canvas.width = canvas.clientWidth;
            this.canvas = canvas;
            canvas.addEventListener("touchstart", function (ev) {
                var jsTouch = ev.touches.item(0);
                var hits = Interactive.findHits(_this.interactives, jsTouch.clientX, jsTouch.clientY);
                if (hits.length > 0) {
                    var interactive = hits[0];
                    var touch = interactive.touchProvider.getTouch(null);
                    var ontouchcancel;
                    var ontouchend = function () {
                        touch.onRelease();
                        canvas.removeEventListener("touchend", ontouchend, false);
                        canvas.removeEventListener("touchcancel", ontouchcancel, false);
                        ontouchcancel = ontouchend = null;
                    };
                    ontouchcancel = function () {
                        touch.onCancel();
                        canvas.removeEventListener("touchend", ontouchend, false);
                        canvas.removeEventListener("touchcancel", ontouchcancel, false);
                        ontouchcancel = ontouchend = null;
                    };
                    canvas.addEventListener("touchend", ontouchend, false);
                    canvas.addEventListener("touchcancel", ontouchcancel, false);
                }
                ev.stopPropagation();
                ev.preventDefault();
            }, false);
            canvas.onmousedown = function (ev) {
                var hits = Interactive.findHits(_this.interactives, ev.clientX, ev.clientY);
                if (hits.length > 0) {
                    var interactive = _this.interactives[0];
                    var touch = interactive.touchProvider.getTouch(null);
                    canvas.onmouseup = function () {
                        touch.onRelease();
                        canvas.onmouseout = canvas.onmouseup = null;
                    };
                    canvas.onmouseout = function () {
                        touch.onCancel();
                        canvas.onmouseout = canvas.onmouseup = null;
                    };
                }
                ev.stopPropagation();
                ev.preventDefault();
            };
            var gl = getWebGLContext(canvas, false);
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
        GlAudience.prototype.addPatch = function (bounds, color) {
            var _this = this;
            if (bounds.left >= bounds.right || bounds.top >= bounds.bottom || color.alpha == 0) {
                return Glyffin.EMPTY_PATCH;
            }
            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right, bounds.bottom, color);
            this.scheduleRedraw();
            return {
                remove: function () {
                    _this.vertices.putPatch(patch);
                }
            };
        };
        GlAudience.prototype.addZone = function (bounds, touchProvider) {
            var interactive = new Interactive(bounds, touchProvider);
            this.interactives.push(interactive);
            var interactives = this.interactives;
            return {
                remove: function () {
                    interactives.splice(interactives.indexOf(interactive), 1);
                }
            };
        };
        GlAudience.prototype.scheduleRedraw = function () {
            var _this = this;
            if (this.editCount > this.drawCount) {
                return;
            }
            this.editCount++;
            requestAnimationFrame(function () {
                _this.vertices.clearFreePatches();
                _this.gl.clear(_this.gl.COLOR_BUFFER_BIT);
                _this.gl.drawArrays(_this.gl.TRIANGLES, 0, _this.vertices.getActiveVertexCount());
                _this.drawCount = _this.editCount;
                console.log("Active %i, Free %i, TotalFreed %", _this.vertices.getActiveVertexCount(), _this.vertices.getFreeVertexCount(), _this.vertices.getTotalFreedVertices());
            });
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
            this.freePatchIndices = [];
            this.clearedPatchIndices = [];
            this.totalFreed = 0;
            this.emptyPatchVertices = new Float32Array(FLOATS_PER_PATCH);
            this.patchVertices = new Float32Array(FLOATS_PER_PATCH);
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
        VerticesAndColor.prototype.getFreeVertexCount = function () {
            return (this.freePatchIndices.length + this.clearedPatchIndices.length) * VERTICES_PER_PATCH;
        };
        VerticesAndColor.prototype.getTotalFreedVertices = function () {
            return this.totalFreed * VERTICES_PER_PATCH;
        };
        VerticesAndColor.prototype.getPatch = function (left, top, right, bottom, color) {
            var patchIndex;
            if (this.freePatchIndices.length > 0) {
                patchIndex = this.freePatchIndices.pop();
            }
            else if (this.clearedPatchIndices.length > 0) {
                patchIndex = this.clearedPatchIndices.pop();
            }
            else {
                if (this.nextPatchIndex >= MAX_PATCH_COUNT) {
                    throw "Too many patches";
                }
                patchIndex = this.nextPatchIndex++;
            }
            this.patchVertices.set([left, top, color.red, color.green, color.blue, color.alpha, right, top, color.red, color.green, color.blue, color.alpha, left, bottom, color.red, color.green, color.blue, color.alpha, left, bottom, color.red, color.green, color.blue, color.alpha, right, top, color.red, color.green, color.blue, color.alpha, right, bottom, color.red, color.green, color.blue, color.alpha,]);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * BYTES_PER_PATCH, this.patchVertices);
            return patchIndex;
        };
        VerticesAndColor.prototype.putPatch = function (patchIndex) {
            this.freePatchIndices.push(patchIndex);
            this.totalFreed++;
        };
        VerticesAndColor.prototype.clearFreePatches = function () {
            if (this.freePatchIndices.length > 0) {
                for (var i = 0; i < this.freePatchIndices.length; i++) {
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, this.freePatchIndices[i] * BYTES_PER_PATCH, this.emptyPatchVertices);
                }
                this.clearedPatchIndices = this.clearedPatchIndices.concat(this.freePatchIndices);
                this.freePatchIndices = [];
            }
        };
        return VerticesAndColor;
    })();
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-gl.js.map