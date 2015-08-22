/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-html.ts" />
/// <reference path="glyffin-touch.ts" />
/// <reference path="glyffin-basic.ts" />
/// <reference path="glyffin-gl.ts" />

class DepthProgram implements Program {
    private VSHADER_SOURCE : string =
        'uniform mat4 u_MvpMatrix;\n' +
        'attribute vec4 a_Position;\n' +
        'attribute vec4 a_Color;\n' +
        'varying vec4 v_Color;\n' +
        'const vec4 offset = vec4(0,0.5,.5,0);\n' +
        'void main(){\n' +
        '  gl_Position = u_MvpMatrix * a_Position + offset;\n' +
        '  v_Color = a_Color;\n' +
        '}\n';

    private FSHADER_SOURCE : string =
        '#ifdef GL_ES\n' +
        'precision mediump float;\n' +
        '#endif\n' +
        'varying vec4 v_Color;\n' +
        'const vec4 white = vec4(1,1,1,1);\n' +
        'void main(){\n' +
        '  gl_FragColor = mix(v_Color, white, 0.85);\n' +
        '}\n';

    public glProgram : WebGLProgram;
    private u_MvpMatrix : WebGLUniformLocation;
    private a_Position : number;
    private a_Color : number;

    constructor(private gl : WebGLRenderingContext, modelMatrix : Matrix4, mvpMatrix : Matrix4) {
        gl.lineWidth(2.0);
        var program = createProgram(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);
        this.glProgram = program;

        this.u_MvpMatrix = this.getUniformLocation('u_MvpMatrix');
        this.a_Position = gl.getAttribLocation(program, 'a_Position');
        this.a_Color = gl.getAttribLocation(program, 'a_Color');

        gl.useProgram(program);
        gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements);
    }

    public getUniformLocation(name : string) : WebGLUniformLocation {
        var uniformLocation = this.gl.getUniformLocation(this.glProgram, name);
        if (!uniformLocation) {
            console.log('Failed to get uniform storage location: ' + name);
        }
        return uniformLocation;
    }

    public enableVertexAttributes(gl : WebGLRenderingContext) {
        var stride = BYTES_PER_VERTEX * 3;

        var a_Position = this.a_Position;
        gl.vertexAttribPointer(a_Position, FLOATS_PER_POSITION, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(a_Position);

        var a_Color = this.a_Color;
        gl.vertexAttribPointer(a_Color, FLOATS_PER_COLOR, gl.FLOAT, false, stride,
            BYTES_BEFORE_COLOR);
        gl.enableVertexAttribArray(a_Color);
    }
}

