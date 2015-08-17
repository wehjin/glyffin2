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

    var identity = [[1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0]];

    var questions = [
        [identity[0], identity[1], identity[2], identity[3], [.5, .25, 0, 1]],
        [identity[0], identity[1], identity[2], identity[3], [.4, .25, 1, 0]],
        [identity[0], identity[1], identity[2], identity[3], [.5, .5, .5, .5]],
    ];
    for (var i = 0; i < 8; i++) {
        questions = questions.concat(questions);
    }
    console.log("Question count: %d", questions.length);
    console.log("Answer size: %d", questions.length * 4);

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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, values);
        return texture;
    }

    var QUESTIONS_WIDTH = questions.length;

    function questionData(columnIndex : number) : Float32Array {
        var textureDataIndex : number = 0;
        var textureData = new Float32Array(questions.length * 4);
        for (var qIndex = 0, qCount = questions.length; qIndex < qCount; qIndex++) {
            var question = questions[qIndex];
            var column = question[columnIndex];
            textureData.set(column, textureDataIndex);
            textureDataIndex += 4;
        }
        return textureData;
    }

    function setupQuestionTexture(width : number, values : Float32Array) {
        return setupTexture(width, 1, values);
    }

    gl.activeTexture(gl.TEXTURE0);
    setupQuestionTexture(QUESTIONS_WIDTH, questionData(0));
    gl.activeTexture(gl.TEXTURE1);
    setupQuestionTexture(QUESTIONS_WIDTH, questionData(1));
    gl.activeTexture(gl.TEXTURE2);
    setupQuestionTexture(QUESTIONS_WIDTH, questionData(2));
    gl.activeTexture(gl.TEXTURE3);
    setupQuestionTexture(QUESTIONS_WIDTH, questionData(3));
    gl.activeTexture(gl.TEXTURE4);
    setupQuestionTexture(QUESTIONS_WIDTH, questionData(4));

    gl.useProgram(shaderProgram);

    var ANSWER_WIDTH = QUESTIONS_WIDTH * 2;
    var ANSWER_HEIGHT = 2;
    var perPixelX = 2.0 / ANSWER_WIDTH;

    var start = Date.now();

    var positionsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    var positions = [];
    var positionsStep = perPixelX * 2;
    var positionsLeft = -1 + perPixelX;
    for (var i = 0, count = questions.length; i < count; i++) {
        positions.push(positionsLeft);
        positions.push(0);
        positionsLeft += positionsStep;
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    var a_Position = gl.getAttribLocation(shaderProgram, "a_Position");
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    var texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
    var texCoords = [];
    var texCoordsStep = 1.0 / QUESTIONS_WIDTH;
    var texCoordsLeft = 0;
    for (var i = 0, count = questions.length; i < count; i++) {
        texCoords.push(texCoordsLeft);
        texCoords.push(0);
        texCoordsLeft += texCoordsStep;
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
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
        gl.drawArrays(gl.POINTS, 0, questions.length);

        var answers = new Float32Array(ANSWER_WIDTH * ANSWER_HEIGHT * 4);
        gl.readPixels(0, 0, ANSWER_WIDTH, ANSWER_HEIGHT, gl.RGBA, gl.FLOAT, answers);
        var end = Date.now();
        console.log("Time: %d", (end - start));
        console.log("Answers: ", answers);

// TODO Replace drawArrays with drawElements
//        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ib);
//        gl.drawElements(gl.TRIANGLES, obj.i.length, gl.UNSIGNED_SHORT, 0);
    }

    console.log('error: ' + gl.getError());
    drawScene();
}

