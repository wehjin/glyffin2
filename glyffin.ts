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

    export interface RectanglePatch {
        remove();
    }

    export interface Audience {
        getPerimeter():RectangleBounds;
        addRectanglePatch(bounds : RectangleBounds):RectanglePatch;
    }

    var VSHADER_SOURCE : string =
        'attribute vec4 a_Position;\n' +
        'void main(){\n' +
        '  gl_Position = a_Position;\n' +
        '  gl_PointSize = 10.0;\n' +
        '}\n';

    var FSHADER_SOURCE : string =
        'void main(){\n' +
        '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
        '}\n';

    export class GlAudience implements Audience {
        private canvas : HTMLCanvasElement;
        private gl : WebGLBookContext;
        private vertexCount : number;
        private perimeter : RectangleBounds;
        private vertices : Float32Array;

        constructor() {
            this.canvas = <HTMLCanvasElement>document.getElementById('webgl');
            this.perimeter = new RectangleBounds(0, 0, this.canvas.width, this.canvas.height);

            this.gl = getWebGLContext(this.canvas);
            var gl = this.gl;
            initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);

            var maxPatchCount = 8;
            var verticesPerPatch = 4;
            this.vertices = new Float32Array(maxPatchCount * verticesPerPatch);

            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        }

        getPerimeter() : Glyffin.RectangleBounds {
            return this.perimeter;
        }

        addRectanglePatch(bounds : RectangleBounds) : RectanglePatch {

            var stride = 4 * 2 * 4;
            var patchIndex = 0;
            var vertices = new Float32Array([bounds.left, bounds.top, bounds.right, bounds.top,
                                             bounds.left,
                                             bounds.bottom, bounds.right, bounds.bottom]);
            var bytesBefore = patchIndex * stride;
            var gl = this.gl;
            gl.bufferSubData(gl.ARRAY_BUFFER, bytesBefore, vertices);

            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);

            this.scheduleRedraw();
            return <RectanglePatch>{
                remove() {
                }
            };
        }

        initVertexBuffers(gl : WebGLBookContext) : number {
            var vertices : Float32Array = new Float32Array([-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
                                                            -0.5]);
            var n : number = 4;
            return n;
        }

        scheduleRedraw() {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
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
            var firmReaction = reaction ? reaction : {
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