/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />

module Glyffin {

    var MAX_PATCH_COUNT = 1000;

    export class GlAudience implements Audience {
        private canvas : HTMLCanvasElement;
        private gl : WebGLBookContext;
        private perimeter : RectangleBounds;
        private vertices : VerticesAndColor;
        private palette;

        constructor() {
            var canvas = <HTMLCanvasElement>document.getElementById('webgl');
            this.canvas = canvas;

            this.perimeter = new RectangleBounds(0, 0, canvas.width, canvas.height);

            this.palette = new Palette();

            var gl = getWebGLContext(canvas);
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

        getPerimeter() : RectangleBounds {
            return this.perimeter;
        }

        getPalette() : Palette {
            return this.palette;
        }

        addRectanglePatch(bounds : RectangleBounds, color : Color) : RectanglePatch {
            if (bounds.left >= bounds.right || bounds.top >= bounds.bottom || color.alpha == 0) {
                return EMPTY_PATCH;
            }

            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right,
                bounds.bottom, color);
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
        private gl;
        private emptyPatchVertices = new Float32Array(FLOATS_PER_PATCH);

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

        getPatch(left : number, top : number, right : number, bottom : number,
                 color : Glyffin.Color) : number {
            var patchIndex = this.nextPatchIndex++;
            var patchVertices = new Float32Array([left, top,
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
                patchVertices);
            return patchIndex;
        }

        putPatch(patchIndex : number) {
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * BYTES_PER_PATCH,
                this.emptyPatchVertices);
        }
    }
}