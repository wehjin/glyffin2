/**
 * Created by wehjin on 5/24/15.
 */
///<reference path="webglbook.d.ts" />
var VSHADER_SOURCE = 'attribute vec4 a_Position;\n' + 'void main(){\n' + '  gl_Position = a_Position;\n' + '  gl_PointSize = 10.0;\n' + '}\n';
var FSHADER_SOURCE = 'void main(){\n' + '  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);\n' + '}\n';
function main() {
    var canvas = document.getElementById('webgl');
    var gl = getWebGLContext(canvas);
    initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
}
//# sourceMappingURL=index.js.map