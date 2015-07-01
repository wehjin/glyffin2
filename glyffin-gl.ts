/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />

module Glyffin {

    var MAX_PATCH_COUNT = 10000;

    var VSHADER_SOURCE : string =
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

    var FSHADER_SOURCE : string =
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

    var VERTICES_PER_PATCH = 6;
    var FLOATS_PER_POSITION = 3;
    var FLOATS_PER_COLOR = 4;
    var FLOATS_PER_VERTEX = FLOATS_PER_POSITION + FLOATS_PER_COLOR;
    var FLOATS_PER_PATCH = VERTICES_PER_PATCH * FLOATS_PER_VERTEX;
    var BYTES_PER_FLOAT = 4;
    var BYTES_BEFORE_COLOR = FLOATS_PER_POSITION * BYTES_PER_FLOAT;
    var BYTES_PER_VERTEX = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;
    var BYTES_PER_PATCH = FLOATS_PER_PATCH * BYTES_PER_FLOAT;


    interface JsTouch {
        clientX: number;
        clientY: number;
        pageX: number;
        pageY: number;
    }
    interface JsTouchList {
        length: number;
        item(index : number):JsTouch;
    }
    interface JsTouchEvent extends UIEvent {
        touches:JsTouchList;
    }

    class Interactive {
        constructor(public bounds : Perimeter, public touchProvider : Gesturable) {
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

    interface SpotObserver {
        onStart(spot : Spot):boolean;
        onMove(spot : Spot):boolean;
        onEnd();
        onCancel();
    }

    class SpotObservable {

        ontouchmove : (ev : Event)=>void;
        ontouchcancel : (ev : Event)=>void;
        ontouchend : (ev : Event)=>void;

        constructor(private canvas : HTMLCanvasElement) {
        }

        private addTouchListeners(onMove : (ev : Event)=>void, onCancel : (ev : Event)=>void,
                                  onEnd : (ev : Event)=>void) {
            this.canvas.addEventListener("touchmove", this.ontouchmove = onMove, false);
            this.canvas.addEventListener("touchcancel", this.ontouchcancel = onCancel, false);
            this.canvas.addEventListener("touchend", this.ontouchcancel = onEnd, false);
        }

        private removeTouchListeners() {
            this.canvas.removeEventListener("touchmove", this.ontouchmove, false);
            this.canvas.removeEventListener("touchcancel", this.ontouchcancel, false);
            this.canvas.removeEventListener("touchend", this.ontouchend, false);
            this.ontouchcancel = this.ontouchmove = this.ontouchend = null;
        }

        subscribe(spotObserver : SpotObserver) : ()=>void {
            var started : boolean;
            var stop = ()=> {
                this.removeTouchListeners();
                started = false;
            };
            var ontouchstart : (ev : Event)=>void;
            this.canvas.addEventListener("touchstart", ontouchstart = (ev : Event) => {
                var touches = (<JsTouchEvent>ev).touches;
                if (touches.length > 1) {
                    if (started) {
                        stop();
                        spotObserver.onCancel();
                    }
                    return;
                }
                if (!spotObserver.onStart(this.getTouchSpot(touches))) {
                    return;
                }
                started = true;
                this.addTouchListeners((ev : Event) => {
                    var carryOn = spotObserver.onMove(this.getTouchSpot((<JsTouchEvent>ev).touches));
                    if (!carryOn) {
                        stop();
                    }
                }, ()=> {
                    stop();
                    spotObserver.onCancel();
                }, ()=> {
                    stop();
                    spotObserver.onEnd();
                });
                ev.stopPropagation();
                ev.preventDefault();
            }, false);
            return ()=> {
                if (started) {
                    stop();
                }
                this.canvas.removeEventListener("touchstart", ontouchstart, false);
            }
        }

        private getTouchSpot(touches : JsTouchList) : Spot {
            var jsTouch = touches.item(0);
            var canvasX = jsTouch.pageX - this.canvas.offsetLeft;
            var canvasY = jsTouch.pageY - this.canvas.offsetTop;
            return new Spot(canvasX, canvasY);
        }
    }

    export class GlAudience implements Audience {
        public canvas : HTMLCanvasElement;
        private gl : WebGLBookContext;
        private vertices : VerticesAndColor;
        private interactives : Interactive[] = [];
        private drawCount = 0;
        private editCount = 0;
        private unsubscribeGestures;

        beginGestures() {
            if (this.unsubscribeGestures) {
                this.unsubscribeGestures();
                this.unsubscribeGestures = null;
            }
            var touch;
            this.unsubscribeGestures = new SpotObservable(this.canvas).subscribe({
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
                },
                onEnd: ()=> {
                    touch.release();
                }
            });
        }

        constructor() {
            var canvas = <HTMLCanvasElement>document.getElementById('webgl');
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.canvas = canvas;

            this.beginGestures();

            canvas.onmousedown = (ev : MouseEvent)=> {
                var canvasY = ev.pageY - canvas.offsetTop;
                var hits = Interactive.findHits(this.interactives, ev.pageX, canvasY);
                if (hits.length > 0) {
                    var interactive = hits[0];
                    var touch = interactive.touchProvider.init(new Spot(ev.pageX, canvasY));
                    canvas.onmouseup = ()=> {
                        touch.release();
                        canvas.onmouseout = canvas.onmousemove = canvas.onmouseup = null;
                    };
                    canvas.onmousemove = (ev : MouseEvent)=> {
                        var canvasY = ev.pageY - canvas.offsetTop;
                        touch.move(new Spot(ev.pageX, canvasY), ()=> {
                            canvas.onmouseout = canvas.onmousemove = canvas.onmouseup = null;
                        });
                    };
                    canvas.onmouseout = ()=> {
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
            modelMatrix.scale(2 / canvas.width, -2 / canvas.height,
                1 / Math.min(canvas.height, canvas.width));
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

            // Mvp
            var mvpMatrix = new Matrix4();    // Model view projection matrix
            mvpMatrix.setPerspective(90, 1, .1, 10);
            mvpMatrix.lookAt(0, 0, 0, 0, 0, -1, 0, 1, 0);
            mvpMatrix.multiply(modelMatrix);
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
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

        scheduleRedraw() {
            if (this.editCount > this.drawCount) {
                return;
            }
            this.editCount++;
            requestAnimationFrame(()=> {
                this.vertices.clearFreePatches();
                this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.getActiveVertexCount());
                this.drawCount = this.editCount;
                console.log("Active %i, Free %i, TotalFreed %",
                    this.vertices.getActiveVertexCount(),
                    this.vertices.getFreeVertexCount(), this.vertices.getTotalFreedVertices());
            });
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