/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-html.ts" />
/// <reference path="glyffin-touch.ts" />
var Glyffin;
(function (Glyffin) {
    var MAX_PATCH_COUNT = 10000;
    var VERTICES_PER_PATCH = 6;
    var FLOATS_PER_POSITION = 3;
    var FLOATS_PER_COLOR = 4;
    var FLOATS_PER_VERTEX = FLOATS_PER_POSITION + FLOATS_PER_COLOR;
    var FLOATS_PER_PATCH = VERTICES_PER_PATCH * FLOATS_PER_VERTEX;
    var BYTES_PER_FLOAT = 4;
    var BYTES_BEFORE_COLOR = FLOATS_PER_POSITION * BYTES_PER_FLOAT;
    var BYTES_PER_VERTEX = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;
    var BYTES_PER_PATCH = FLOATS_PER_PATCH * BYTES_PER_FLOAT;
    var LightProgram = (function () {
        function LightProgram(gl, modelMatrix, vertices) {
            this.VSHADER_SOURCE = 'const vec3 c_Normal = vec3( 0.0, 0.0, 1.0 );\n' + 'uniform mat4 u_MvpMatrix;\n' + 'uniform mat4 u_ModelMatrix;\n' + 'attribute vec4 a_Position;\n' + 'attribute vec4 a_Color;\n' + 'varying vec4 v_Color;\n' + 'varying vec3 v_Normal;\n' + 'varying vec3 v_Position;\n' + 'void main(){\n' + '  gl_Position = u_MvpMatrix * a_Position;\n' + '  v_Position = vec3(u_ModelMatrix * a_Position);\n' + '  v_Normal = c_Normal;\n' + '  v_Color = a_Color;\n' + '}\n';
            this.FSHADER_SOURCE = '#ifdef GL_ES\n' + 'precision mediump float;\n' + '#endif\n' + 'uniform vec3 u_LightColor;\n' + 'uniform vec3 u_LightPosition;\n' + 'uniform vec3 u_AmbientLight;\n' + 'varying vec3 v_Position;\n' + 'varying vec3 v_Normal;\n' + 'varying vec4 v_Color;\n' + 'void main(){\n' + '  vec3 normal = normalize(v_Normal);\n' + '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' + '  float lightIntensity = max(dot(lightDirection, normal), 0.0);\n' + '  vec3 diffuse = u_LightColor * v_Color.rgb * lightIntensity;\n' + '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' + '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' + '}\n';
            var program = createProgram(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);
            this.program = program;
            this.u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
            this.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
            this.u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
            this.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
            this.u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
            if (!this.u_MvpMatrix || !this.u_LightColor || !this.u_LightPosition || !this.u_AmbientLight) {
                console.log('Failed to get uniform storage location');
            }
            var mvpMatrix = new Matrix4();
            mvpMatrix.setPerspective(90, 1, .1, 10);
            mvpMatrix.lookAt(0, 0, 0, 0, 0, -1, 0, 1, 0);
            mvpMatrix.multiply(modelMatrix);
            gl.useProgram(program);
            gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
            gl.uniform3f(this.u_LightPosition, 0.0, 0.5, 0.0);
            gl.uniform3f(this.u_AmbientLight, 0.2, 0.2, 0.2);
            gl.uniformMatrix4fv(this.u_ModelMatrix, false, modelMatrix.elements);
            gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements);
            vertices.enableInProgram(program);
        }
        return LightProgram;
    })();
    var GlAudience = (function () {
        function GlAudience() {
            this.interactives = [];
            this.drawCount = 0;
            this.editCount = 0;
            var canvas = document.getElementById('webgl');
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.canvas = canvas;
            this.beginGestures();
            var gl = getWebGLContext(canvas, false);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.frontFace(gl.CW);
            this.gl = gl;
            var modelMatrix = new Matrix4();
            modelMatrix.setTranslate(-1, 1, -1);
            modelMatrix.scale(2 / canvas.width, -2 / canvas.height, 1 / Math.min(canvas.height, canvas.width));
            this.vertices = new VerticesAndColor(MAX_PATCH_COUNT, gl);
            this.lightProgram = new LightProgram(gl, modelMatrix, this.vertices);
        }
        GlAudience.prototype.beginGestures = function () {
            var _this = this;
            if (this.unsubscribeSpots) {
                this.unsubscribeSpots();
            }
            var touch;
            this.unsubscribeSpots = new Glyffin.SpotObservable(this.canvas).subscribe({
                onStart: function (spot) {
                    var hits = Glyffin.Interactive.findHits(_this.interactives, spot.x, spot.y);
                    if (hits.length < 1) {
                        return false;
                    }
                    touch = hits[0].touchProvider.init(spot);
                    return true;
                },
                onMove: function (spot) {
                    touch.move(spot, function () {
                        _this.beginGestures();
                    });
                    return true;
                },
                onCancel: function () {
                    touch.cancel();
                    _this.beginGestures();
                },
                onEnd: function () {
                    touch.release();
                    _this.beginGestures();
                }
            });
        };
        GlAudience.prototype.scheduleRedraw = function () {
            var _this = this;
            if (this.editCount > this.drawCount) {
                return;
            }
            this.editCount++;
            requestAnimationFrame(function () {
                _this.vertices.clearFreePatches();
                _this.gl.useProgram(_this.lightProgram.program);
                _this.gl.clear(_this.gl.COLOR_BUFFER_BIT | _this.gl.DEPTH_BUFFER_BIT);
                _this.gl.drawArrays(_this.gl.TRIANGLES, 0, _this.vertices.getActiveVertexCount());
                _this.drawCount = _this.editCount;
                console.log("Active %i, Free %i, TotalFreed %", _this.vertices.getActiveVertexCount(), _this.vertices.getFreeVertexCount(), _this.vertices.getTotalFreedVertices());
            });
        };
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
            var interactive = new Glyffin.Interactive(bounds, touchProvider);
            this.interactives.push(interactive);
            var interactives = this.interactives;
            return {
                remove: function () {
                    interactives.splice(interactives.indexOf(interactive), 1);
                }
            };
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
        }
        VerticesAndColor.prototype.enableInProgram = function (program) {
            var a_Position = this.gl.getAttribLocation(program, 'a_Position');
            this.gl.vertexAttribPointer(a_Position, FLOATS_PER_POSITION, this.gl.FLOAT, false, BYTES_PER_VERTEX, 0);
            this.gl.enableVertexAttribArray(a_Position);
            var a_Color = this.gl.getAttribLocation(program, 'a_Color');
            this.gl.vertexAttribPointer(a_Color, FLOATS_PER_COLOR, this.gl.FLOAT, false, BYTES_PER_VERTEX, BYTES_BEFORE_COLOR);
            this.gl.enableVertexAttribArray(a_Color);
        };
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