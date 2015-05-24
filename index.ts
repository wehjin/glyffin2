/**
 * Created by wehjin on 5/24/15.
 */

///<reference path="webglbook.d.ts" />

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

function main() {
    var canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('webgl');
    var gl : WebGLBookContext = getWebGLContext(canvas);

    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    var n = initVertexBuffers(gl);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl : WebGLBookContext) : number {
    var vertices : Float32Array = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
    var n : number = 3;

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    return n;
}