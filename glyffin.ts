/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />

module Glyffin {

    export class Void {
    }

    export class RectangleBounds {
        constructor(public left : number, public top : number, public right : number,
                    public bottom : number) {
        }
    }

    export class Color {

        constructor(public red : number, public green : number, public blue : number,
                    public alpha : number) {
        }
    }

    export interface Audience {
        getPerimeter():RectangleBounds;
        getPalette():Palette;
        addRectanglePatch(bounds : RectangleBounds):RectanglePatch;
    }

    export class Palette {
        public static RED = new Color(1, 0, 0, 1);
        public static GREEN = new Color(0, 1, 0, 1);
        public static BLUE = new Color(0, 0, 1, 1);
        public static BEIGE = new Color(245 / 255, 245 / 255, 220 / 255, 1);
    }

    export interface RectanglePatch {
        remove();
    }

    export class GlAudience implements Audience {
        private canvas : HTMLCanvasElement;
        private gl : WebGLBookContext;
        private perimeter : RectangleBounds;
        private vertices : Vertices;
        private palette;

        constructor() {
            var canvas = <HTMLCanvasElement>document.getElementById('webgl');
            this.canvas = canvas;

            this.perimeter = new RectangleBounds(0, 0, canvas.width, canvas.height);

            this.palette = new Palette();

            var gl = getWebGLContext(canvas);
            initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            this.vertices = new Vertices(8, gl);
            this.gl = gl;

            var viewMatrix = new Matrix4();
            viewMatrix.setTranslate(-1, 1, 0);
            viewMatrix.scale(2 / canvas.width, -2 / canvas.height, 1);
            var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');
            gl.uniformMatrix4fv(u_ModelMatrix, false, viewMatrix.elements);

            var color = Palette.BEIGE;
            var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
            gl.uniform4f(u_FragColor, color.red, color.green, color.blue,
                color.alpha);
        }

        getPerimeter() : Glyffin.RectangleBounds {
            return this.perimeter;
        }

        getPalette() : Glyffin.Palette {
            return this.palette;
        }

        addRectanglePatch(bounds : RectangleBounds) : RectanglePatch {
            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right,
                bounds.bottom);
            this.scheduleRedraw();
            return <RectanglePatch>{
                remove() {
                    this.vertices.putPatch(patch);
                }
            };
        }

        scheduleRedraw() {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        }

    }

    var VSHADER_SOURCE : string =
        'attribute vec4 a_Position;\n' +
        'uniform mat4 u_viewMatrix;\n' +
        'void main(){\n' +
        '  gl_Position = u_viewMatrix * a_Position;\n' +
        '}\n';

    var FSHADER_SOURCE : string =
        'precision mediump float;' +
        'uniform vec4 u_FragColor;\n' +
        'void main(){\n' +
        '  gl_FragColor = u_FragColor;\n' +
        '}\n';

    class Vertices {

        private static VERTICES_PER_PATCH : number = 4;
        private static FLOATS_PER_VERTEX : number = 2;
        private static BYTES_PER_FLOAT : number = 4;
        private static BYTES_PER_PATCH = Vertices.VERTICES_PER_PATCH * Vertices.FLOATS_PER_VERTEX *
            Vertices.BYTES_PER_FLOAT;

        private nextPatchIndex = 0;
        private gl;
        private emptyPatchVertices = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);

        constructor(private maxPatchCount : number, gl : WebGLBookContext) {
            this.gl = gl;

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

            var vertices = new Float32Array(maxPatchCount * Vertices.VERTICES_PER_PATCH);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, Vertices.FLOATS_PER_VERTEX, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
        }

        getPatch(left : number, top : number, right : number, bottom : number) : number {
            var patchIndex = this.nextPatchIndex++;
            var patchVertices = new Float32Array([left, top, right, top, left, bottom, right,
                                                  bottom]);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * Vertices.BYTES_PER_PATCH,
                patchVertices);
            return patchIndex;
        }

        putPatch(patchIndex : number) {
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * Vertices.BYTES_PER_PATCH,
                this.emptyPatchVertices);
        }
    }

    export interface Reaction<T> {
        onResult(result : T);
        onError(error : Error);
    }

    export interface Presentation {
        end();
    }

    export interface Presenter<T> extends Reaction<T> {
        addPresentation(presentation : Presentation);
    }

    export interface OnPresent<T> {
        call(audience : Audience, presenter : Presenter<T>);
    }


    export class Glyff<T> {

        static create<U>(f : OnPresent<U>) : Glyff<U> {
            return new Glyff<U>(f);
        }

        constructor(private onPresent : OnPresent<T>) {
        }

        present(audience : Audience, reaction? : Reaction<T>) : Presentation {
            //noinspection JSUnusedLocalSymbols
            var firmReaction : Reaction<T> = reaction ? reaction : {
                onResult(result : T) {
                },
                onError(error : Error) {
                }
            };
            var presented : Presentation[] = [];
            var presenter = {
                addPresentation(presentation : Presentation) {
                    presented.push(presentation);
                },
                onResult(result : T) {
                    firmReaction.onResult(result);
                },
                onError(error : Error) {
                    firmReaction.onError(error);
                }
            };
            this.onPresent.call(audience, presenter);
            return <Presentation>{
                end() {
                    while (presented.length > 0) {
                        presented.pop().end();
                    }
                }
            }
        }
    }

    export var RedGlyff : Glyff<Void> = Glyff.create<Void>({
        call(audience : Audience, presenter : Presenter<Void>) {
            var perimeter = audience.getPerimeter();
            var patch : RectanglePatch = audience.addRectanglePatch(perimeter);
            presenter.addPresentation({
                end() {
                    patch.remove();
                }
            });
        }
    });
}