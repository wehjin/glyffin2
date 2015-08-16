/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="../webglbook.d.ts" />
/// <reference path="../glyffin.ts" />
/// <reference path="../glyffin-ascii.ts" />
/// <reference path="../glyffin-gl.ts" />
/// <reference path="../glyffin-touch.ts" />
function main() {
    var canvas = document.getElementById('webgl');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    console.log(canvas.clientWidth + " " + canvas.clientHeight);
    var gl = getWebGLContext(canvas, false);
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    var textureFloatExtension = gl.getExtension("OES_texture_float");
    if (!textureFloatExtension) {
        throw "Need texture float extension";
    }
    var vertexShader = "" + "attribute vec2 a_TexCoord;\n" + "attribute vec2 a_Position;\n" + "varying vec2 v_TexCoord;\n" + "void main(void) {\n" + "  gl_Position = vec4(a_Position, 0.0, 1.0);\n" + "  v_TexCoord = a_TexCoord;\n" + "}\n";
    var fragmentShader = "" + "precision mediump float;\n" + "uniform sampler2D u_Sampler;\n" + "varying vec2 v_TexCoord;\n" + "void main(void) {\n" + "  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n" + "}\n";
    var shaderProgram = createProgram(gl, vertexShader, fragmentShader);
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    var data = new Float32Array([
        1.0,
        0.0,
        0.0,
        1.0,
        1.0,
        1.0,
        0.0,
        1.0,
        0.0,
        1.0,
        1.0,
        1.0,
        1.0,
        0.0,
        1.0,
        1.0
    ]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.FLOAT, data);
    gl.useProgram(shaderProgram);
    var vertexCount = 6;
    var a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
    gl.enableVertexAttribArray(a_Position);
    var positionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    var a_TexCoord = gl.getAttribLocation(shaderProgram, "a_TexCoord");
    gl.enableVertexAttribArray(a_TexCoord);
    var texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    var u_Sampler = gl.getUniformLocation(shaderProgram, "u_Sampler");
    gl.uniform1i(u_Sampler, 0);
    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
        // TODO Replace drawArrays with drawElements
        //        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ib);
        //        gl.drawElements(gl.TRIANGLES, obj.i.length, gl.UNSIGNED_SHORT, 0);
    }
    console.log('error: ' + gl.getError());
    requestAnimationFrame(drawScene);
}
//# sourceMappingURL=frametest.js.map