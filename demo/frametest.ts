/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="../webglbook.d.ts" />
/// <reference path="../glyffin.ts" />
/// <reference path="../glyffin-ascii.ts" />
/// <reference path="../glyffin-gl.ts" />
/// <reference path="../glyffin-touch.ts" />


function main() {
    var canvas = <HTMLCanvasElement> document.getElementById('webgl');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    console.log(canvas.clientWidth + " " + canvas.clientHeight);
    var gl = getWebGLContext(canvas, false);
    var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    console.log("Max texture size: %d", maxTextureSize);
    var textureFloatExtension = gl.getExtension("OES_texture_float");
    if (!textureFloatExtension) {
        throw "Need texture float extension";
    }

    var drawBuffersExtension = gl.getExtension("WEBGL_draw_buffers");
    if (!drawBuffersExtension) {
        console.log("No WEBGL_draw_buffers");
    }

    var supportedExtensions = gl.getSupportedExtensions();
    console.log("Supported extensions: ", supportedExtensions);

    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    var identity = [1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1];
    var fractionAndAlignment = [.5, .5, .5, .5];

    var vertexShader = "" +
        "precision mediump float;\n" +
        "uniform sampler2D u_parentMatrixA;\n" +
        "uniform sampler2D u_parentMatrixB;\n" +
        "uniform sampler2D u_parentMatrixC;\n" +
        "uniform sampler2D u_parentMatrixD;\n" +
        "uniform sampler2D u_fractionAndAlignment;\n" +
        "attribute vec2 a_TexCoord;\n" +
        "attribute vec2 a_Position;\n" +
        "varying vec2 v_TexCoord;\n" +
        "varying mat4 v_modelToWorld;\n" +
        "const mat4 ident = mat4(1.0);\n" +
        "void main(void) {\n" +
        "  vec4 parentMatrixA = texture2D(u_parentMatrixA, a_TexCoord);\n" +
        "  vec4 parentMatrixB = texture2D(u_parentMatrixB, a_TexCoord);\n" +
        "  vec4 parentMatrixC = texture2D(u_parentMatrixC, a_TexCoord);\n" +
        "  vec4 parentMatrixD = texture2D(u_parentMatrixD, a_TexCoord);\n" +
        "  mat4 parentMatrix = mat4(parentMatrixA, parentMatrixB, parentMatrixC, parentMatrixD);\n" +
        "  vec4 fractionAndAlignment = texture2D(u_fractionAndAlignment, a_TexCoord);\n" +
        "  vec2 fraction = fractionAndAlignment.xy;\n" +
        "  vec2 alignment = fractionAndAlignment.zw;\n" +
        "  vec4 col3 = vec4((1.0-fraction.x)*alignment.x, (1.0-fraction.y)*alignment.y, 0.0, 1.0);\n" +
        "  v_modelToWorld = parentMatrix * mat4(ident[0]*fraction.x,ident[1]*fraction.y, ident[2], col3);\n" +
        "  gl_PointSize = 2.0;\n" +
        "  gl_Position = vec4(a_Position, 0.0, 1.0);\n" +
        "}\n";

    var fragmentShader = "" +
        "precision mediump float;\n" +
        "varying mat4 v_modelToWorld;\n" +
        "void main(void) {\n" +
        "  if (gl_PointCoord.x < 0.5) {\n" +
        "    if (gl_PointCoord.y >0.5) {\n" +
        "      gl_FragColor = v_modelToWorld[0];\n" +
        "    } else {\n" +
        "      gl_FragColor = v_modelToWorld[2];\n" +
        "    }\n" +
        "  } else {\n" +
        "    if (gl_PointCoord.y > 0.5) {\n" +
        "      gl_FragColor = v_modelToWorld[1];\n" +
        "    } else {\n" +
        "      gl_FragColor = v_modelToWorld[3];\n" +
        "    }\n" +
        "  }\n" +
        "}\n";

    var shaderProgram = createProgram(gl, vertexShader, fragmentShader);

    function setupTexture(width : number, height : number, values : Float32Array) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, values);
        return texture;
    }

    gl.activeTexture(gl.TEXTURE0);
    setupTexture(1, 1, new Float32Array([
        1.0, 0.0, 0.0, 0.0,
    ]));
    gl.activeTexture(gl.TEXTURE1);
    setupTexture(1, 1, new Float32Array([
        0.0, 1.0, 0.0, 0.0,
    ]));
    gl.activeTexture(gl.TEXTURE2);
    setupTexture(1, 1, new Float32Array([
        0.0, 0.0, 1.0, 0.0
    ]));
    gl.activeTexture(gl.TEXTURE3);
    setupTexture(1, 1, new Float32Array([
        0.0, 0.0, 0.0, 1.0,
    ]));
    gl.activeTexture(gl.TEXTURE4);
    setupTexture(1, 1, new Float32Array([
        .5, .25, 0.0, 1.0,
    ]));

    gl.useProgram(shaderProgram);

    var ANSWER_WIDTH = 2;
    var ANSWER_HEIGHT = 2;
    var perPixelX = 2.0 / ANSWER_WIDTH;

    var positionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1 + perPixelX, 0]), gl.STATIC_DRAW);
    var vertexCount = 1;
    var a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    var texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
    var a_TexCoord = gl.getAttribLocation(shaderProgram, "a_TexCoord");
    gl.enableVertexAttribArray(a_TexCoord);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_parentMatrixA"), 0);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_parentMatrixB"), 1);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_parentMatrixC"), 2);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_parentMatrixD"), 3);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "u_fractionAndAlignment"), 4);

    var framebuffer = gl.createFramebuffer();
    gl.activeTexture(gl.TEXTURE5);
    var answerTexture = setupTexture(ANSWER_WIDTH, ANSWER_HEIGHT, null);
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, ANSWER_WIDTH, ANSWER_HEIGHT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, answerTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (e !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Framebuffer object is incomplete: " + e.toString());
        return;
    }
    gl.viewport(0, 0, ANSWER_WIDTH, ANSWER_HEIGHT);

    function drawScene() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var start = Date.now();
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0]),
            gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, vertexCount);
        var end = Date.now();
        console.log("Time: %d", (end - start));

        var answers = new Float32Array(ANSWER_WIDTH * ANSWER_HEIGHT * 4);
        gl.readPixels(0, 0, ANSWER_WIDTH, ANSWER_HEIGHT, gl.RGBA, gl.FLOAT, answers);
        console.log("Answers: ", answers);
// TODO Replace drawArrays with drawElements
//        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ib);
//        gl.drawElements(gl.TRIANGLES, obj.i.length, gl.UNSIGNED_SHORT, 0);
    }

    console.log('error: ' + gl.getError());
    requestAnimationFrame(drawScene);
}

