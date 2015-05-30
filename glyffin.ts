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

        getHeight() : number {
            return this.bottom - this.top;
        }

        getWidth() : number {
            return this.right - this.left;
        }

        inset(pixels : number) : RectangleBounds {
            return new RectangleBounds(this.left + pixels,
                this.top + pixels, this.right - pixels,
                this.bottom - pixels);
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

            this.vertices = new Vertices(1000, gl);
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

        getPerimeter() : RectangleBounds {
            return this.perimeter;
        }

        getPalette() : Palette {
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
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.getActiveVertexCount());
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

        private static VERTICES_PER_PATCH : number = 6;
        private static FLOATS_PER_VERTEX : number = 2;
        private static BYTES_PER_FLOAT : number = 4;
        private static BYTES_PER_PATCH = Vertices.VERTICES_PER_PATCH * Vertices.FLOATS_PER_VERTEX *
            Vertices.BYTES_PER_FLOAT;
        private static FLOATS_PER_PATCH = Vertices.VERTICES_PER_PATCH * Vertices.FLOATS_PER_VERTEX;

        private nextPatchIndex = 0;
        private gl;
        private emptyPatchVertices = new Float32Array(Vertices.FLOATS_PER_PATCH);

        constructor(private maxPatchCount : number, gl : WebGLBookContext) {
            this.gl = gl;

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

            var vertices = new Float32Array(maxPatchCount * Vertices.VERTICES_PER_PATCH);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
            gl.vertexAttribPointer(a_Position, Vertices.FLOATS_PER_VERTEX, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
        }

        getActiveVertexCount() : number {
            return this.nextPatchIndex * Vertices.VERTICES_PER_PATCH;
        }

        getPatch(left : number, top : number, right : number, bottom : number) : number {
            var patchIndex = this.nextPatchIndex++;
            var patchVertices = new Float32Array([left, top, right, top, left, bottom,
                                                  left, bottom, right, top, right, bottom]);
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

    export interface Mogrifier<T,U> {
        getUpperAudience(audience : Audience, presenter : Presenter<U>):Audience;
        getUpperReaction(audience : Audience, presenter : Presenter<U>):Reaction<T>;
    }

    export class Glyff<T> {

        static create<U>(f : OnPresent<U>) : Glyff<U> {
            return new Glyff<U>(f);
        }

        constructor(private onPresent : OnPresent<T>) {
        }

        insertTop(insertHeight : number, insertGlyff : Glyff<Void>) : Glyff<T> {
            var existingGlyff = this;
            return Glyff.create({
                call(audience : Audience, presenter : Presenter<Void>) {
                    var perimeter = audience.getPerimeter();
                    var insertBottom = perimeter.top + insertHeight;
                    presenter.addPresentation(insertGlyff.present({
                        getPerimeter() : RectangleBounds {
                            return new RectangleBounds(perimeter.left, perimeter.top,
                                perimeter.right, insertBottom);
                        },
                        getPalette() : Palette {
                            return audience.getPalette();
                        },
                        addRectanglePatch(bounds : RectangleBounds) : RectanglePatch {
                            return audience.addRectanglePatch(bounds);
                        }
                    }));
                    presenter.addPresentation(existingGlyff.present({
                        getPerimeter() : RectangleBounds {
                            return new RectangleBounds(perimeter.left, insertBottom,
                                perimeter.right, perimeter.bottom);
                        },
                        getPalette() : Palette {
                            return audience.getPalette();
                        },
                        addRectanglePatch(bounds : RectangleBounds) : RectanglePatch {
                            return audience.addRectanglePatch(bounds);
                        }
                    }));
                }
            });
        }

        kaleido(columns : number, rows : number, spots : number[][]) : Glyff<Void> {
            var upperGlyff = this;
            return Glyff.create({
                call(audience : Audience, presenter : Presenter<Void>) {
                    var perimeter = audience.getPerimeter();
                    var rowHeight = perimeter.getHeight() / rows;
                    var colWidth = perimeter.getWidth() / columns;
                    spots.forEach(spot=> {
                        presenter.addPresentation(upperGlyff.present({
                            getPerimeter() : RectangleBounds {
                                var left = perimeter.left + colWidth * spot[0];
                                var top = perimeter.top + rowHeight * spot[1];
                                return new RectangleBounds(left,
                                    top, left + colWidth, top + rowHeight
                                );
                            },
                            getPalette() : Palette {
                                return audience.getPalette();
                            },
                            addRectanglePatch(bounds : RectangleBounds) : RectanglePatch {
                                return audience.addRectanglePatch(bounds);
                            }
                        }, presenter));
                    });
                }
            });
        }

        inset(pixels : number) : Glyff<T> {
            return this.compose({
                getUpperAudience(audience : Audience, presenter : Presenter<T>) : Audience {
                    return {
                        getPerimeter() : RectangleBounds {
                            return audience.getPerimeter().inset(pixels);
                        },
                        getPalette() : Palette {
                            return audience.getPalette();
                        },
                        addRectanglePatch(bounds : RectangleBounds) : RectanglePatch {
                            return audience.addRectanglePatch(bounds);
                        }
                    };
                },
                getUpperReaction(audience : Audience, presenter : Presenter<T>) : Reaction<T> {
                    return presenter;
                }
            });
        }

        compose<U>(operation : Mogrifier<T,U>) {
            var upperGlyff = this;
            return Glyff.create<U>({
                call(audience : Audience, presenter : Presenter<U>) {
                    presenter.addPresentation(upperGlyff.present(operation.getUpperAudience(audience,
                            presenter),
                        operation.getUpperReaction(audience, presenter)
                    ));
                }
            });
        }

        present(audience : Audience, reaction ? : Reaction<T>) : Presentation {
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