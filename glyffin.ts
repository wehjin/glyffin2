/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />

module Glyffin {

    export class Void {
    }

    export class RelBounds {
        left : number;
        right : number;
        top : number;
        bottom : number;
    }

    export interface Rel {
        remove();
    }

    export interface Audience {
        addRel(bounds : RelBounds):Rel;
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
        public gl : WebGLBookContext;
        private vertexCount : number;

        constructor() {
            var canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('webgl');
            var gl = getWebGLContext(canvas);
            initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl = gl;
            this.vertexCount = this.initVertexBuffers(this.gl);
        }

        initVertexBuffers(gl : WebGLBookContext) : number {
            var vertices : Float32Array = new Float32Array([-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5,
                                                            -0.5]);
            var n : number = 4;

            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
            return n;
        }

        scheduleRedraw() {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount);
        }

        addRel(bounds : RelBounds) : Rel {
            this.scheduleRedraw();
            return null;
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

    export var RedShow : Glyff<Void> = Glyff.create<Void>({
        call(audience : Audience, presenter : Presenter<Void>) {
            var rel : Rel = audience.addRel(null);
            presenter.addPresentation({
                end() {
                    rel.remove();
                }
            });
        }
    });
}