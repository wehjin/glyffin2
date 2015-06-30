/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    var MAX_PATCH_COUNT = 10000;
    var VSHADER_SOURCE = 'const vec3 c_Normal = vec3( 0.0, 0.0, 1.0 );\n' + 'uniform mat4 u_MvpMatrix;\n' + 'uniform mat4 u_ModelMatrix;\n' + 'attribute vec4 a_Position;\n' + 'attribute vec4 a_Color;\n' + 'varying vec4 v_Color;\n' + 'varying vec3 v_Normal;\n' + 'varying vec3 v_Position;\n' + 'void main(){\n' + '  gl_Position = u_MvpMatrix * a_Position;\n' + '  v_Position = vec3(u_ModelMatrix * a_Position);\n' + '  v_Normal = c_Normal;\n' + '  v_Color = a_Color;\n' + '}\n';
    var FSHADER_SOURCE = '#ifdef GL_ES\n' + 'precision mediump float;\n' + '#endif\n' + 'uniform vec3 u_LightColor;\n' + 'uniform vec3 u_LightPosition;\n' + 'uniform vec3 u_AmbientLight;\n' + 'varying vec3 v_Position;\n' + 'varying vec3 v_Normal;\n' + 'varying vec4 v_Color;\n' + 'void main(){\n' + '  vec3 normal = normalize(v_Normal);\n' + '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' + '  float lightIntensity = max(dot(lightDirection, normal), 0.0);\n' + '  vec3 diffuse = u_LightColor * v_Color.rgb * lightIntensity;\n' + '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' + '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' + '}\n';
    var VERTICES_PER_PATCH = 6;
    var FLOATS_PER_POSITION = 3;
    var FLOATS_PER_COLOR = 4;
    var FLOATS_PER_VERTEX = FLOATS_PER_POSITION + FLOATS_PER_COLOR;
    var FLOATS_PER_PATCH = VERTICES_PER_PATCH * FLOATS_PER_VERTEX;
    var BYTES_PER_FLOAT = 4;
    var BYTES_BEFORE_COLOR = FLOATS_PER_POSITION * BYTES_PER_FLOAT;
    var BYTES_PER_VERTEX = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;
    var BYTES_PER_PATCH = FLOATS_PER_PATCH * BYTES_PER_FLOAT;
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
            canvas.height = canvas.clientHeight;
            this.canvas = canvas;
            canvas.addEventListener("touchstart", function (ev) {
                var cancel;
                var touches = ev.touches;
                if (touches.length > 1) {
                    if (cancel) {
                        cancel();
                    }
                    return;
                }
                var jsTouch = touches.item(0);
                var canvasY = jsTouch.clientY - canvas.getBoundingClientRect().top;
                var hits = Interactive.findHits(_this.interactives, jsTouch.pageX, canvasY);
                if (hits.length > 0) {
                    var interactive = hits[0];
                    var touch = interactive.touchProvider.init(new Glyffin.Spot(jsTouch.pageX, canvasY));
                    var ontouchcancel;
                    var ontouchmove;
                    var ontouchend;
                    function removeListeners() {
                        canvas.removeEventListener("touchend", ontouchend, false);
                        canvas.removeEventListener("touchmove", ontouchmove, false);
                        canvas.removeEventListener("touchcancel", ontouchcancel, false);
                        cancel = ontouchcancel = ontouchmove = ontouchend = null;
                    }
                    ontouchend = function () {
                        touch.release();
                        removeListeners();
                    };
                    ontouchmove = function (ev) {
                        var jsTouch = ev.touches.item(0);
                        var canvasY = jsTouch.clientY - canvas.getBoundingClientRect().top;
                        touch.move(new Glyffin.Spot(jsTouch.pageX, canvasY), function () {
                            removeListeners();
                        });
                    };
                    ontouchcancel = function () {
                        touch.cancel();
                        removeListeners();
                    };
                    canvas.addEventListener("touchend", ontouchend, false);
                    canvas.addEventListener("touchmove", ontouchmove, false);
                    canvas.addEventListener("touchcancel", ontouchcancel, false);
                    cancel = ontouchcancel;
                }
                ev.stopPropagation();
                ev.preventDefault();
            }, false);
            canvas.onmousedown = function (ev) {
                var canvasY = ev.clientY - canvas.getBoundingClientRect().top;
                var hits = Interactive.findHits(_this.interactives, ev.pageX, canvasY);
                if (hits.length > 0) {
                    var interactive = hits[0];
                    var touch = interactive.touchProvider.init(new Glyffin.Spot(ev.pageX, canvasY));
                    canvas.onmouseup = function () {
                        touch.release();
                        canvas.onmouseout = canvas.onmousemove = canvas.onmouseup = null;
                    };
                    canvas.onmousemove = function (ev) {
                        var canvasY = ev.clientY - canvas.getBoundingClientRect().top;
                        touch.move(new Glyffin.Spot(ev.pageX, canvasY), function () {
                            canvas.onmouseout = canvas.onmousemove = canvas.onmouseup = null;
                        });
                    };
                    canvas.onmouseout = function () {
                        touch.cancel();
                        canvas.onmouseout = canvas.onmousemove = canvas.onmouseup = null;
                    };
                }
                ev.stopPropagation();
                ev.preventDefault();
            };
            var gl = getWebGLContext(canvas, false);
            initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.frontFace(gl.CW);
            this.vertices = new VerticesAndColor(MAX_PATCH_COUNT, gl);
            this.gl = gl;
            var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
            var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
            var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
            var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
            var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
            if (!u_MvpMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
                console.log('Failed to get uniform storage location');
                return;
            }
            // White light.
            gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
            // Overhead light in world coordinates
            gl.uniform3f(u_LightPosition, 0.0, 0.5, 0.0);
            // Ambient light
            gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
            // Model
            var modelMatrix = new Matrix4();
            modelMatrix.setTranslate(-1, 1, -1);
            modelMatrix.scale(2 / canvas.width, -2 / canvas.height, 1 / Math.min(canvas.height, canvas.width));
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
            // Mvp
            var mvpMatrix = new Matrix4(); // Model view projection matrix
            mvpMatrix.setPerspective(90, 1, .1, 10);
            mvpMatrix.lookAt(0, 0, 0, 0, 0, -1, 0, 1, 0);
            mvpMatrix.multiply(modelMatrix);
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        }
        GlAudience.prototype.addPatch = function (bounds, color) {
            var _this = this;
            if (bounds.left >= bounds.right || bounds.top >= bounds.bottom || color.alpha == 0) {
                return Glyffin.EMPTY_PATCH;
            }
            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right, bounds.bottom, bounds.level, color);
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
                _this.gl.clear(_this.gl.COLOR_BUFFER_BIT | _this.gl.DEPTH_BUFFER_BIT);
                _this.gl.drawArrays(_this.gl.TRIANGLES, 0, _this.vertices.getActiveVertexCount());
                _this.drawCount = _this.editCount;
                console.log("Active %i, Free %i, TotalFreed %", _this.vertices.getActiveVertexCount(), _this.vertices.getFreeVertexCount(), _this.vertices.getTotalFreedVertices());
            });
        };
        return GlAudience;
    })();
    Glyffin.GlAudience = GlAudience;
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
        VerticesAndColor.prototype.getPatch = function (left, top, right, bottom, level, color) {
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
            this.patchVertices.set([left, top, level, color.red, color.green, color.blue, color.alpha, right, top, level, color.red, color.green, color.blue, color.alpha, left, bottom, level, color.red, color.green, color.blue, color.alpha, left, bottom, level, color.red, color.green, color.blue, color.alpha, right, top, level, color.red, color.green, color.blue, color.alpha, right, bottom, level, color.red, color.green, color.blue, color.alpha,]);
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