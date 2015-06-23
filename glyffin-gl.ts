/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />

module Glyffin {

    var MAX_PATCH_COUNT = 10000;

    interface JsTouch {
        clientX: number;
        clientY: number;
    }
    interface JsTouchList {
        length: number;
        item(index : number):JsTouch;
    }
    interface JsTouchEvent extends UIEvent {
        touches:JsTouchList;
    }

    class Interactive {
        constructor(public bounds : RectangleBounds, public touchProvider : TouchProvider) {
        }

        isHit(touchX : number, touchY : number) : boolean {
            return this.bounds.left <= touchX &&
                this.bounds.right >= touchX &&
                this.bounds.top <= touchY &&
                this.bounds.bottom >= touchY;
        }

        static findHits(all : Interactive[], x : number, y : number) : Interactive[] {
            var hitInteractives : Interactive[] = [];
            all.forEach((interactive : Interactive)=> {
                if (interactive.isHit(x, y)) {
                    hitInteractives.push(interactive);
                }
            });
            return hitInteractives;
        }
    }

    export class GlAudience implements Audience {
        public canvas : HTMLCanvasElement;
        private gl : WebGLBookContext;
        private vertices : VerticesAndColor;
        private interactives : Interactive[] = [];
        private drawCount = 0;
        private editCount = 0;

        constructor() {
            var canvas = <HTMLCanvasElement>document.getElementById('webgl');
            canvas.width = canvas.clientWidth;
            this.canvas = canvas;

            canvas.addEventListener("touchstart", (ev : Event) => {
                var jsTouch = (<JsTouchEvent>ev).touches.item(0);
                var hits = Interactive.findHits(this.interactives, jsTouch.clientX,
                    jsTouch.clientY);
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

            canvas.onmousedown = (ev : MouseEvent)=> {
                var hits = Interactive.findHits(this.interactives, ev.clientX, ev.clientY);
                if (hits.length > 0) {
                    var interactive = hits[0];
                    var touch = interactive.touchProvider.getTouch(null);
                    canvas.onmouseup = ()=> {
                        touch.onRelease();
                        canvas.onmouseout = canvas.onmouseup = null;
                    };
                    canvas.onmouseout = ()=> {
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

        addPatch(bounds : RectangleBounds, color : Color) : Patch {
            if (bounds.left >= bounds.right || bounds.top >= bounds.bottom || color.alpha == 0) {
                return EMPTY_PATCH;
            }

            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right,
                bounds.bottom, color);
            this.scheduleRedraw();
            return <Patch>{
                remove: ()=> {
                    this.vertices.putPatch(patch);
                }
            };
        }

        addZone(bounds : Glyffin.RectangleBounds,
                touchProvider : Glyffin.TouchProvider) : Glyffin.Zone {
            var interactive = new Interactive(bounds, touchProvider);
            this.interactives.push(interactive);
            var interactives = this.interactives;
            return {
                remove: ()=> {
                    interactives.splice(interactives.indexOf(interactive), 1);
                }
            };
        }

        scheduleRedraw() {
            if (this.editCount > this.drawCount) {
                return;
            }
            this.editCount++;
            requestAnimationFrame(()=> {
                this.vertices.clearFreePatches();
                this.gl.clear(this.gl.COLOR_BUFFER_BIT);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.getActiveVertexCount());
                this.drawCount = this.editCount;
                console.log("Active %i, Free %i, TotalFreed %",
                    this.vertices.getActiveVertexCount(),
                    this.vertices.getFreeVertexCount(), this.vertices.getTotalFreedVertices());
            });
        }

    }

    var VSHADER_SOURCE : string =
        'attribute vec4 a_Position;\n' +
        'attribute vec4 a_Color;\n' +
        'varying vec4 v_Color;\n' +
        'uniform mat4 u_viewMatrix;\n' +
        'void main(){\n' +
        '  gl_Position = u_viewMatrix * a_Position;\n' +
        '  v_Color = a_Color;\n' +
        '}\n';

    var FSHADER_SOURCE : string =
        'precision mediump float;' +
        'varying vec4 v_Color;\n' +
        'void main(){\n' +
        '  gl_FragColor = v_Color;\n' +
        '}\n';

    var VERTICES_PER_PATCH = 6;
    var FLOATS_PER_POSITION = 2;
    var FLOATS_PER_COLOR = 4;
    var FLOATS_PER_VERTEX = FLOATS_PER_POSITION + FLOATS_PER_COLOR;
    var FLOATS_PER_PATCH = VERTICES_PER_PATCH * FLOATS_PER_VERTEX;
    var BYTES_PER_FLOAT = 4;
    var BYTES_BEFORE_COLOR = FLOATS_PER_POSITION * BYTES_PER_FLOAT;
    var BYTES_PER_VERTEX = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;
    var BYTES_PER_PATCH = FLOATS_PER_PATCH * BYTES_PER_FLOAT;

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

            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, FLOATS_PER_POSITION, gl.FLOAT, false,
                BYTES_PER_VERTEX, 0);
            gl.enableVertexAttribArray(a_Position);

            var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
            gl.vertexAttribPointer(a_Color, FLOATS_PER_COLOR, gl.FLOAT, false, BYTES_PER_VERTEX,
                BYTES_BEFORE_COLOR);
            gl.enableVertexAttribArray(a_Color);
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

        getPatch(left : number, top : number, right : number, bottom : number,
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
            this.patchVertices.set([left, top,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, top,
                                    color.red, color.green, color.blue, color.alpha,
                                    left, bottom,
                                    color.red, color.green, color.blue, color.alpha,
                                    left, bottom,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, top,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, bottom,
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