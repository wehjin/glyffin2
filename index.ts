/**
 * Created by wehjin on 5/24/15.
 */

///<reference path="webglbook.d.ts" />

var VSHADER_SOURCE : string =
    'void main(){\n' +
    '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' +
    '  gl_PointSize = 10.0;\n' +
    '}\n';

var FSHADER_SOURCE : string =
    'void main(){\n' +
    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

function main() {
    var canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('webgl');
    var gl = getWebGLContext(canvas);

    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
}