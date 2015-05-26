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

    export interface Producer<T> {
        onResult(result : T);
    }

    export interface Curtain {
        close();
    }

    export interface Director<T> extends Audience, Producer<T> {
        addCurtain(curtain : Curtain);
    }

    export interface OnShow<T> {
        onShow(director : Director<T>);
    }


    export class Show<T> {
        static create<U>(onShow : OnShow<U>) : Show<U> {
            return new Show<U>(onShow);
        }

        constructor(private onShow : OnShow<T>) {
        }

        open(audience : Audience, producer? : Producer<T>) : Curtain {
            var curtains : Curtain[] = [];
            this.onShow.onShow({
                    addCurtain(curtain : Curtain) {
                        curtains.push(curtain);
                    },
                    addRel(bounds : RelBounds) : Rel {
                        return audience.addRel(bounds);
                    },
                    onResult(result : T) {
                        if (producer) {
                            producer.onResult(result);
                        }
                    }
                }
            );
            return {
                close() {
                    while (curtains.length > 0) {
                        curtains.pop().close();
                    }
                }
            }
        }
    }

    export var RedShow : Show<Void> = Show.create<Void>({
        onShow(director : Director<Void>) {
            var rel : Rel = director.addRel(null);
            director.addCurtain({
                close() {
                    rel.remove();
                }
            });
        }
    });
}