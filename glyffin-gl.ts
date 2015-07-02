/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-html.ts" />
/// <reference path="glyffin-touch.ts" />

module Glyffin {

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

    class LightProgram {
        private VSHADER_SOURCE : string =
            'const vec3 c_Normal = vec3( 0.0, 0.0, 1.0 );\n' +
            'uniform mat4 u_MvpMatrix;\n' +
            'uniform mat4 u_ModelMatrix;\n' +
            'attribute vec4 a_Position;\n' +
            'attribute vec4 a_Color;\n' +
            'varying vec4 v_Color;\n' +
            'varying vec3 v_Normal;\n' +
            'varying vec3 v_Position;\n' +
            'void main(){\n' +
            '  gl_Position = u_MvpMatrix * a_Position;\n' +
            '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
            '  v_Normal = c_Normal;\n' +
            '  v_Color = a_Color;\n' +
            '}\n';

        private FSHADER_SOURCE : string =
            '#ifdef GL_ES\n' +
            'precision mediump float;\n' +
            '#endif\n' +
            'uniform vec3 u_LightColor;\n' +
            'uniform vec3 u_LightPosition;\n' +
            'uniform vec3 u_AmbientLight;\n' +
            'varying vec3 v_Position;\n' +
            'varying vec3 v_Normal;\n' +
            'varying vec4 v_Color;\n' +
            'void main(){\n' +
                // Normalize the normal because it is interpolated and not 1.0 in length any more
            '  vec3 normal = normalize(v_Normal);\n' +
            '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
            '  float lightIntensity = max(dot(lightDirection, normal), 0.0);\n' +
            '  vec3 diffuse = u_LightColor * v_Color.rgb * lightIntensity;\n' +
            '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
            '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
            '}\n';

        public program;
        private u_ModelMatrix;
        private u_MvpMatrix;
        private u_LightColor;
        private u_LightPosition;
        private u_AmbientLight;

        constructor(gl : WebGLRenderingContext, modelMatrix : Matrix4,
                    vertices : VerticesAndColor) {
            var program = createProgram(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);
            this.program = program;
            this.u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
            this.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
            this.u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
            this.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
            this.u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
            if (!this.u_MvpMatrix || !this.u_LightColor || !this.u_LightPosition ||
                !this.u_AmbientLight) {
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
    }

    export class GlAudience implements Audience {
        public canvas : HTMLCanvasElement;
        private gl : WebGLRenderingContext;
        private vertices : VerticesAndColor;
        private interactives : Interactive[] = [];
        private drawCount = 0;
        private editCount = 0;
        private unsubscribeSpots;
        private lightProgram;

        beginGestures() {
            if (this.unsubscribeSpots) {
                this.unsubscribeSpots();
            }
            var touch;
            this.unsubscribeSpots = new SpotObservable(this.canvas).subscribe({
                onStart: (spot : Spot) : boolean => {
                    var hits = Interactive.findHits(this.interactives, spot.x, spot.y);
                    if (hits.length < 1) {
                        return false;
                    }
                    touch = hits[0].touchProvider.init(spot);
                    return true;
                },
                onMove: (spot : Spot) : boolean=> {
                    touch.move(spot, ()=> {
                        this.beginGestures();
                    });
                    return true;
                },
                onCancel: ()=> {
                    touch.cancel();
                    this.beginGestures();
                },
                onEnd: ()=> {
                    touch.release();
                    this.beginGestures();
                }
            });
        }

        constructor() {
            var canvas = <HTMLCanvasElement>document.getElementById('webgl');
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
            modelMatrix.scale(2 / canvas.width, -2 / canvas.height,
                1 / Math.min(canvas.height, canvas.width));

            this.vertices = new VerticesAndColor(MAX_PATCH_COUNT, gl);
            this.lightProgram = new LightProgram(gl, modelMatrix, this.vertices);
        }

        scheduleRedraw() {
            if (this.editCount > this.drawCount) {
                return;
            }
            this.editCount++;
            requestAnimationFrame(()=> {
                this.vertices.clearFreePatches();
                this.gl.useProgram(this.lightProgram.program);
                this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.getActiveVertexCount());
                this.drawCount = this.editCount;
                console.log("Active %i, Free %i, TotalFreed %",
                    this.vertices.getActiveVertexCount(),
                    this.vertices.getFreeVertexCount(), this.vertices.getTotalFreedVertices());
            });
        }

        addPatch(bounds : Perimeter, color : Color) : Patch {
            if (bounds.left >= bounds.right || bounds.top >= bounds.bottom || color.alpha == 0) {
                return EMPTY_PATCH;
            }

            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right,
                bounds.bottom, bounds.level, color);
            this.scheduleRedraw();
            return <Patch>{
                remove: ()=> {
                    this.vertices.putPatch(patch);
                }
            };
        }

        addZone(bounds : Glyffin.Perimeter,
                touchProvider : Glyffin.Gesturable) : Glyffin.Zone {
            var interactive = new Interactive(bounds, touchProvider);
            this.interactives.push(interactive);
            var interactives = this.interactives;
            return {
                remove: ()=> {
                    interactives.splice(interactives.indexOf(interactive), 1);
                }
            };
        }

    }

    class VerticesAndColor {

        private nextPatchIndex = 0;
        private freePatchIndices : number[] = [];
        private clearedPatchIndices : number[] = [];
        public totalFreed = 0;
        private gl;
        private emptyPatchVertices = new Float32Array(FLOATS_PER_PATCH);
        private patchVertices = new Float32Array(FLOATS_PER_PATCH);

        constructor(private maxPatchCount : number, gl : WebGLBookContext) {
            this.gl = gl;

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

            var vertices = new Float32Array(maxPatchCount * FLOATS_PER_PATCH);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        }

        enableInProgram(program) {
            var a_Position = this.gl.getAttribLocation(program, 'a_Position');
            this.gl.vertexAttribPointer(a_Position, FLOATS_PER_POSITION, this.gl.FLOAT, false,
                BYTES_PER_VERTEX, 0);
            this.gl.enableVertexAttribArray(a_Position);

            var a_Color = this.gl.getAttribLocation(program, 'a_Color');
            this.gl.vertexAttribPointer(a_Color, FLOATS_PER_COLOR, this.gl.FLOAT, false,
                BYTES_PER_VERTEX,
                BYTES_BEFORE_COLOR);
            this.gl.enableVertexAttribArray(a_Color);
        }

        getActiveVertexCount() : number {
            return this.nextPatchIndex * VERTICES_PER_PATCH;
        }

        getFreeVertexCount() : number {
            return (this.freePatchIndices.length + this.clearedPatchIndices.length) *
                VERTICES_PER_PATCH;
        }

        getTotalFreedVertices() : number {
            return this.totalFreed * VERTICES_PER_PATCH;
        }

        getPatch(left : number, top : number, right : number, bottom : number, level : number,
                 color : Glyffin.Color) : number {
            var patchIndex;
            if (this.freePatchIndices.length > 0) {
                patchIndex = this.freePatchIndices.pop();
            } else if (this.clearedPatchIndices.length > 0) {
                patchIndex = this.clearedPatchIndices.pop();
            } else {
                if (this.nextPatchIndex >= MAX_PATCH_COUNT) {
                    throw "Too many patches";
                }
                patchIndex = this.nextPatchIndex++;
            }
            this.patchVertices.set([left, top, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, top, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    left, bottom, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    left, bottom, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, top, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, bottom, level,
                                    color.red, color.green, color.blue, color.alpha,
            ]);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * BYTES_PER_PATCH,
                this.patchVertices);
            return patchIndex;
        }

        putPatch(patchIndex : number) {
            this.freePatchIndices.push(patchIndex);
            this.totalFreed++;
        }

        clearFreePatches() {
            if (this.freePatchIndices.length > 0) {
                for (var i = 0; i < this.freePatchIndices.length; i++) {
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER,
                        this.freePatchIndices[i] * BYTES_PER_PATCH,
                        this.emptyPatchVertices);
                }
                this.clearedPatchIndices = this.clearedPatchIndices.concat(this.freePatchIndices);
                this.freePatchIndices = [];
            }
        }
    }
}