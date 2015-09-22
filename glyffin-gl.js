/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "./glyffin", "./glyffin-html", "./glyffin-touch", "./glyffin-ascii"], function (require, exports, glyffin_1, glyffin_html_1, glyffin_touch_1, glyffin_ascii_1) {
    var STAGE_SIZE = 256;
    var LIGHT_X = 0;
    var LIGHT_Y = STAGE_SIZE / 2;
    var LIGHT_Z = -1;
    var LIGHT = [LIGHT_X, LIGHT_Y, LIGHT_Z, 1.0];
    var AUDIENCE_X = 0;
    var AUDIENCE_Y = 0;
    var AUDIENCE_Z = -STAGE_SIZE;
    var AUDIENCE = [AUDIENCE_X, AUDIENCE_Y, AUDIENCE_Z, 1.0];
    var SHADOWMAP_RES = 128;
    var OFFSCREEN_WIDTH = SHADOWMAP_RES, OFFSCREEN_HEIGHT = SHADOWMAP_RES;
    var UP_X = 0;
    var UP_Y = 1;
    var UP_Z = 0;
    var includeShadow = false;
    var stopAfterShadow = false;
    var redShadow = false;
    var includeDepth = true;
    var MAX_PATCH_COUNT = 10000;
    var VERTICES_PER_PATCH = 6;
    var MAX_VERTEX_COUNT = MAX_PATCH_COUNT * VERTICES_PER_PATCH;
    var FLOATS_PER_POSITION = 3;
    var FLOATS_PER_COLOR = 4;
    var FLOATS_PER_CODEPOINT = 2;
    var FLOATS_PER_VERTEX = FLOATS_PER_POSITION + FLOATS_PER_COLOR + FLOATS_PER_CODEPOINT;
    var FLOATS_PER_PATCH = VERTICES_PER_PATCH * FLOATS_PER_VERTEX;
    var BYTES_PER_FLOAT = 4;
    var BYTES_BEFORE_COLOR = FLOATS_PER_POSITION * BYTES_PER_FLOAT;
    var BYTES_BEFORE_CODEPOINT = BYTES_BEFORE_COLOR + (FLOATS_PER_COLOR) * BYTES_PER_FLOAT;
    var BYTES_BEFORE_CORNER = BYTES_BEFORE_CODEPOINT + BYTES_PER_FLOAT;
    var BYTES_PER_VERTEX = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;
    var BYTES_PER_PATCH = FLOATS_PER_PATCH * BYTES_PER_FLOAT;
    var ATLAS = new glyffin_ascii_1.Atlas();
    function enableColorAttributes(program, gl) {
        // TODO Take a_Color as parameter.
        var a_Color = gl.getAttribLocation(program.glProgram, 'a_Color');
        gl.vertexAttribPointer(a_Color, FLOATS_PER_COLOR, gl.FLOAT, false, BYTES_PER_VERTEX, BYTES_BEFORE_COLOR);
        gl.enableVertexAttribArray(a_Color);
    }
    function enablePositionAttributes(program, gl) {
        // TODO Take a_Position as a parameter.
        var a_Position = gl.getAttribLocation(program.glProgram, 'a_Position');
        gl.vertexAttribPointer(a_Position, FLOATS_PER_POSITION, gl.FLOAT, false, BYTES_PER_VERTEX, 0);
        gl.enableVertexAttribArray(a_Position);
    }
    function enableCornerAttribute(gl, a_Corner) {
        gl.vertexAttribPointer(a_Corner, 1, gl.FLOAT, false, BYTES_PER_VERTEX, BYTES_BEFORE_CORNER);
        gl.enableVertexAttribArray(a_Corner);
    }
    function enableCodePointAttribute(gl, a_CodePoint) {
        gl.vertexAttribPointer(a_CodePoint, 1, gl.FLOAT, false, BYTES_PER_VERTEX, BYTES_BEFORE_CODEPOINT);
        gl.enableVertexAttribArray(a_CodePoint);
    }
    var FrameBuffer = (function () {
        function FrameBuffer(gl) {
            var framebuffer;
            var texture;
            var depthBuffer;
            // Define the error handling function
            function deleteObjects() {
                if (framebuffer)
                    gl.deleteFramebuffer(framebuffer);
                if (texture)
                    gl.deleteTexture(texture);
                if (depthBuffer)
                    gl.deleteRenderbuffer(depthBuffer);
            }
            // Create a texture object and set its size and parameters
            texture = gl.createTexture(); // Create a texture object
            if (!texture) {
                console.log('Failed to create texture object');
                deleteObjects();
                return;
            }
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            // Create a renderbuffer object and set its size and parameters
            depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
            if (!depthBuffer) {
                console.log('Failed to create renderbuffer object');
                deleteObjects();
                return;
            }
            gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
            // Create a framebuffer object (FBO)
            framebuffer = gl.createFramebuffer();
            if (!framebuffer) {
                console.log('Failed to create frame buffer object');
                deleteObjects();
                return;
            }
            // Attach the texture and the renderbuffer object to the FBO
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
            // Check if FBO is configured correctly
            var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            if (gl.FRAMEBUFFER_COMPLETE !== e) {
                console.log('Frame buffer object is incomplete: ' + e.toString());
                deleteObjects();
                return;
            }
            // Unbind the buffer object
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            this.texture = texture;
            this.framebuffer = framebuffer;
        }
        return FrameBuffer;
    })();
    var Patches = (function () {
        function Patches() {
            this.freePatchList = [];
            this.totalFreed = 0;
            this.patch = new Float32Array(FLOATS_PER_PATCH);
            this.emptyPatch = new Float32Array(FLOATS_PER_PATCH);
            this.buffer = new Float32Array(MAX_PATCH_COUNT * FLOATS_PER_PATCH);
            for (var i = 0, count = MAX_PATCH_COUNT - 1; i < count; i++) {
                this.freePatchList[i] = i + 1;
            }
            this.freePatchList[MAX_PATCH_COUNT - 1] = -1;
            this.freePatchHead = 0;
            this.freePatchTail = MAX_PATCH_COUNT - 1;
            this.freePatchCleared = this.freePatchTail;
            this.freePatchCount = MAX_PATCH_COUNT;
        }
        Patches.prototype.setVertexFloats = function (index, x, y, z, red, green, blue, alpha, codePoint, corner) {
            var base = index * FLOATS_PER_VERTEX;
            this.patch[base] = x;
            this.patch[base + 1] = y;
            this.patch[base + 2] = z;
            this.patch[base + 3] = red;
            this.patch[base + 4] = green;
            this.patch[base + 5] = blue;
            this.patch[base + 6] = alpha;
            this.patch[base + 7] = codePoint;
            this.patch[base + 8] = corner;
        };
        Patches.prototype.getPatch = function (left, top, right, bottom, level, color, codePoint, room) {
            var patchIndex;
            if (this.freePatchHead === this.freePatchCleared) {
                if (this.freePatchCleared === this.freePatchTail) {
                    throw "Out of patches";
                }
                patchIndex = this.freePatchHead;
                this.freePatchHead =
                    this.freePatchCleared = this.freePatchList[this.freePatchHead];
            }
            else {
                patchIndex = this.freePatchHead;
                this.freePatchHead = this.freePatchList[this.freePatchHead];
            }
            this.freePatchList[patchIndex] = -2;
            this.freePatchCount--;
            this.setVertexFloats(0, left, top, level, color.red, color.green, color.blue, color.alpha, codePoint, 1);
            this.setVertexFloats(1, right, top, level, color.red, color.green, color.blue, color.alpha, codePoint, 2);
            this.setVertexFloats(2, left, bottom, level, color.red, color.green, color.blue, color.alpha, codePoint, 3);
            this.setVertexFloats(3, right, top, level, color.red, color.green, color.blue, color.alpha, codePoint, 2);
            this.setVertexFloats(4, right, bottom, level, color.red, color.green, color.blue, color.alpha, codePoint, 4);
            this.setVertexFloats(5, left, bottom, level, color.red, color.green, color.blue, color.alpha, codePoint, 3);
            this.buffer.set(this.patch, patchIndex * FLOATS_PER_PATCH);
            return patchIndex;
        };
        Patches.prototype.putPatch = function (patchIndex) {
            if (this.freePatchList[patchIndex] !== -2) {
                throw "Invalid patch index";
            }
            this.freePatchList[this.freePatchTail] = patchIndex;
            this.freePatchTail = patchIndex;
            this.freePatchList[patchIndex] = -1;
            this.freePatchCount++;
            this.totalFreed++;
        };
        Patches.prototype.clearFreedPatches = function (room) {
            var next = this.freePatchCleared;
            var last = this.freePatchTail;
            if (next === last) {
                return;
            }
            var list = this.freePatchList;
            for (;;) {
                this.buffer.set(this.emptyPatch, next * FLOATS_PER_PATCH);
                if (next === last) {
                    break;
                }
                next = list[next];
            }
            this.freePatchCleared = last;
        };
        return Patches;
    })();
    var ShadowProgram = (function () {
        function ShadowProgram(gl, mvpMatrix) {
            this.VSHADER_SOURCE = 'attribute vec4 a_Position;\n' +
                'uniform mat4 u_MvpMatrix;\n' +
                'void main() {\n' +
                '  gl_Position = u_MvpMatrix * a_Position;\n' +
                '}\n';
            this.FSHADER_SOURCE = '#ifdef GL_ES\n' +
                'precision mediump float;\n' +
                '#endif\n' +
                'vec4 pack (float depth) {\n' +
                '  const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);\n' +
                '  const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);\n' +
                '  vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);\n' +
                // stored into each byte
                '  rgbaDepth -= rgbaDepth.gbaa * bitMask;\n' +
                // 8 bits
                '  return rgbaDepth;\n' +
                '}\n' +
                'void main() {\n' +
                (stopAfterShadow ? '  gl_FragColor = vec4(gl_FragCoord.z,0.0,0.0,1.0);\n' :
                    '  gl_FragColor = pack(gl_FragCoord.z);\n') +
                '}\n';
            var program = createProgram(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);
            this.glProgram = program;
            this.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
            this.a_Position = gl.getAttribLocation(program, 'a_Position');
            if (this.a_Position < 0 || !this.u_MvpMatrix) {
                console.log('Failed to get the storage location of attribute or uniform variable from shadowProgram');
                return;
            }
            this.mvpMatrix = mvpMatrix;
            gl.useProgram(program);
            gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements);
        }
        ShadowProgram.prototype.enableVertexAttributes = function (gl) {
            enablePositionAttributes(this, gl);
        };
        return ShadowProgram;
    })();
    var LightProgram = (function () {
        function LightProgram(gl, modelMatrix, mvpMatrix) {
            this.VSHADER_SOURCE = 'const vec3 c_Normal = vec3( 0.0, 0.0, 1.0 );\n' +
                'uniform mat4 u_ModelMatrix;\n' +
                'uniform mat4 u_MvpMatrix;\n' +
                'uniform mat4 u_MvpMatrixFromLight;\n' +
                'attribute vec4 a_Position;\n' +
                'attribute vec4 a_Color;\n' +
                'attribute float a_CodePoint;\n' +
                'attribute float a_Corner;\n' +
                'varying vec4 v_Color;\n' +
                'varying vec3 v_Normal;\n' +
                'varying vec3 v_Position;\n' +
                'varying vec4 v_PositionFromLight;\n' +
                'varying float v_UseTex;\n' +
                'varying vec2 v_TexCoord;\n' +
                'const float spriteWidth = 6.0/256.0;\n' +
                'const float spriteStride = 8.0/256.0;\n' +
                'vec2 texturePoint(in float corner, in float index){\n' +
                '  float s = spriteStride * index;\n' +
                '  float u = s + spriteWidth;\n' +
                '  if (corner == 1.0){\n' +
                '    return vec2(s, 1.0);\n' +
                '  }\n' +
                '  if (corner == 2.0){\n' +
                '    return vec2(u, 1.0);\n' +
                '  }\n' +
                '  if (corner == 3.0){\n' +
                '    return vec2(s, 0.0);\n' +
                '  }\n' +
                '  return vec2(u, 0.0);\n' +
                '}\n' +
                'void main(){\n' +
                '  gl_Position = u_MvpMatrix * a_Position;\n' +
                '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
                '  v_PositionFromLight = u_MvpMatrixFromLight * a_Position;\n' +
                '  v_Normal = c_Normal;\n' +
                '  v_Color = a_Color;\n' +
                '  if (a_CodePoint >= 64.0 && a_CodePoint < 96.0) {\n' +
                '    float index = a_CodePoint - 64.0;\n' +
                '    v_UseTex = 1.0;\n' +
                '    v_TexCoord = texturePoint(a_Corner, index);\n' +
                '  } else {\n' +
                '    v_UseTex = 0.0;\n' +
                '  }\n' +
                '}\n';
            this.FSHADER_SOURCE = '#ifdef GL_ES\n' +
                'precision mediump float;\n' +
                '#endif\n' +
                'uniform vec3 u_LightColor;\n' +
                'uniform vec3 u_LightPosition;\n' +
                'uniform vec3 u_AmbientLight;\n' +
                'uniform sampler2D u_ShadowMap;\n' +
                'uniform sampler2D u_AtlasSampler;\n' +
                'varying vec3 v_Position;\n' +
                'varying vec3 v_Normal;\n' +
                'varying vec4 v_Color;\n' +
                'varying vec4 v_PositionFromLight;\n' +
                'varying vec2 v_TexCoord;\n' +
                'varying float v_UseTex;\n' +
                'float unpack(const in vec4 rgbaDepth) {\n' +
                '  const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));\n' +
                '  float depth = dot(rgbaDepth, bitShift);\n' +
                // same
                '  return depth;\n' +
                '}\n' +
                'void main(){\n' +
                // Normalize the normal because it is interpolated and not 1.0 in length any more
                '  vec3 normal = normalize(v_Normal);\n' +
                '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
                '  float lightIntensity = max(dot(lightDirection, normal), 0.0);\n' +
                '  vec3 diffuse = u_LightColor * v_Color.rgb * lightIntensity;\n' +
                '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
                '  vec4 color = vec4(diffuse + ambient, v_Color.a);\n' +
                '  vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;\n' +
                '  float poissonVisibility = 0.0;\n' +
                '  const float bias = 0.003;\n' +
                '  float depthAcc = 0.0;\n' +
                '  vec2 poissonDisk[4];\n' +
                '  poissonDisk[0] = vec2( -0.94201624, -0.39906216 );\n' +
                '  poissonDisk[1] = vec2( 0.94558609, -0.76890725 );\n' +
                '  poissonDisk[2] = vec2( -0.094184101, -0.92938870 );\n' +
                '  poissonDisk[3] = vec2( 0.34495938, 0.29387760 );\n' +
                '  for (int i=0;i<4;i++) {\n' +
                '    vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy + poissonDisk[i]/700.0*0.0);\n' +
                '    float depth = unpack(rgbaDepth);\n' +
                '    depthAcc += depth;\n' +
                '  }\n' +
                '  float visibility = (shadowCoord.z > depthAcc/4.0 + bias) ? 0.8 : 1.0;\n' +
                '  if (v_UseTex > 0.5){\n' +
                '    color = texture2D(u_AtlasSampler, v_TexCoord);\n' +
                '  }\n' +
                (redShadow ? '  gl_FragColor = (visibility < 1.0) ? vec4(1.0,0.0,0.0,1.0) : color;\n' :
                    '  gl_FragColor = vec4(color.rgb * visibility, color.a);\n') +
                '}\n';
            var program = createProgram(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);
            this.glProgram = program;
            this.u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
            this.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
            this.u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
            this.u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
            this.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
            this.u_MvpMatrixFromLight = gl.getUniformLocation(program, 'u_MvpMatrixFromLight');
            this.u_ShadowMap = gl.getUniformLocation(program, 'u_ShadowMap');
            this.u_AtlasSampler = gl.getUniformLocation(program, 'u_AtlasSampler');
            this.a_Corner = gl.getAttribLocation(program, 'a_Corner');
            this.a_CodePoint = gl.getAttribLocation(program, 'a_CodePoint');
            if (!this.u_ModelMatrix || !this.u_MvpMatrix || !this.u_AmbientLight || !this.u_LightColor ||
                !this.u_LightPosition || !this.u_MvpMatrixFromLight || !this.u_ShadowMap || !this.u_AtlasSampler ||
                this.a_Corner < 0 || this.a_CodePoint < 0) {
                console.log('Failed to get storage location');
            }
            gl.useProgram(program);
            gl.uniform3f(this.u_AmbientLight, 0.2, 0.2, 0.2);
            gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
            gl.uniform3f(this.u_LightPosition, LIGHT_X, LIGHT_Y, LIGHT_Z);
            gl.uniformMatrix4fv(this.u_ModelMatrix, false, modelMatrix.elements);
            gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements);
            var texture = gl.createTexture();
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, ATLAS.image);
            gl.uniform1i(this.u_AtlasSampler, 1);
            this.altasTexture = texture;
        }
        LightProgram.prototype.enableVertexAttributes = function (gl) {
            enablePositionAttributes(this, gl);
            enableColorAttributes(this, gl);
            enableCornerAttribute(gl, this.a_Corner);
            enableCodePointAttribute(gl, this.a_CodePoint);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.altasTexture);
        };
        return LightProgram;
    })();
    var DepthProgram = (function () {
        function DepthProgram(gl, modelMatrix, mvpMatrix) {
            this.gl = gl;
            this.VSHADER_SOURCE = 'uniform mat4 u_MvpMatrix;\n' +
                'attribute vec4 a_Position;\n' +
                'attribute vec4 a_Color;\n' +
                'varying vec4 v_Color;\n' +
                'const vec4 offset = vec4(0,0.5,.5,0);\n' +
                'void main(){\n' +
                '  gl_Position = u_MvpMatrix * a_Position + offset;\n' +
                '  v_Color = a_Color;\n' +
                '}\n';
            this.FSHADER_SOURCE = '#ifdef GL_ES\n' +
                'precision mediump float;\n' +
                '#endif\n' +
                'varying vec4 v_Color;\n' +
                'void main(){\n' +
                '  float amount = 1.0 - (v_Color.r + v_Color.g + v_Color.b)/3.0;\n' +
                '  gl_FragColor = vec4(.9,.9,.9,amount);\n' +
                '}\n';
            gl.lineWidth(2.0);
            var program = createProgram(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);
            this.glProgram = program;
            this.u_MvpMatrix = this.getUniformLocation('u_MvpMatrix');
            this.a_Position = gl.getAttribLocation(program, 'a_Position');
            this.a_Color = gl.getAttribLocation(program, 'a_Color');
            gl.useProgram(program);
            gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements);
        }
        DepthProgram.prototype.getUniformLocation = function (name) {
            var uniformLocation = this.gl.getUniformLocation(this.glProgram, name);
            if (!uniformLocation) {
                console.log('Failed to get uniform storage location: ' + name);
            }
            return uniformLocation;
        };
        DepthProgram.prototype.enableVertexAttributes = function (gl) {
            var stride = BYTES_PER_VERTEX * 3;
            var a_Position = this.a_Position;
            gl.vertexAttribPointer(a_Position, FLOATS_PER_POSITION, gl.FLOAT, false, stride, 0);
            gl.enableVertexAttribArray(a_Position);
            var a_Color = this.a_Color;
            gl.vertexAttribPointer(a_Color, FLOATS_PER_COLOR, gl.FLOAT, false, stride, BYTES_BEFORE_COLOR);
            gl.enableVertexAttribArray(a_Color);
        };
        return DepthProgram;
    })();
    var GlRoom = (function () {
        function GlRoom(canvas) {
            this.canvas = canvas;
            canvas.style.position = "absolute";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.overflow = "hidden";
            canvas.style.touchAction = "none";
            // TODO Respond to size changes.
            this.width = canvas.width = canvas.clientWidth;
            this.height = canvas.height = canvas.clientHeight;
            this.depthMap = new Uint8Array(this.width * this.height * 4);
            this.perimeter = new glyffin_1.Perimeter(0, 0, this.width, this.height, 1, 0, 48, 10, new glyffin_1.Palette());
            var maxDimension = Math.max(canvas.width, canvas.height);
            var modelMatrix = new Matrix4();
            modelMatrix.setScale(STAGE_SIZE / canvas.width, -STAGE_SIZE / canvas.height, STAGE_SIZE / maxDimension);
            modelMatrix.translate(-canvas.width / 2, -canvas.height / 2, -maxDimension);
            var vpMatrix = new Matrix4();
            vpMatrix.setPerspective(53, 1, 200, STAGE_SIZE * 1.25);
            vpMatrix.lookAt(0, 0, 0, AUDIENCE_X, AUDIENCE_Y, AUDIENCE_Z, UP_X, UP_Y, UP_Z);
            var mvpMatrix = new Matrix4(vpMatrix);
            mvpMatrix.multiply(modelMatrix);
            // The earlier setPerspective puts vpMatrix into a left-hand NDC system.  We'll
            // need to recover the right-hand system by scaling.  This also reverses the cycle
            // direction so we'll need to switch the front face when drawing with this matrix.
            var vpMatrixS = new Matrix4();
            vpMatrixS.setScale(-1, -1, 1);
            vpMatrixS.multiply(vpMatrix);
            var postLight = vpMatrixS.multiplyVector4(new Vector4(LIGHT));
            var postAudience = vpMatrixS.multiplyVector4(new Vector4(AUDIENCE));
            var postAudienceZ = postAudience.elements[2] / postAudience.elements[3];
            var postLightY = postLight.elements[1] / postLight.elements[3];
            var postLightZ = postLight.elements[2] / postLight.elements[3];
            var distanceZ = postLightZ;
            var distance = Math.sqrt(postLightY * postLightY + distanceZ * distanceZ);
            var mvpLightMatrix = new Matrix4();
            var spread = Math.abs(postAudienceZ) * 2.5;
            mvpLightMatrix.setPerspective(.15, 1, distance - spread, distance + spread);
            mvpLightMatrix.lookAt(0, postLightY, postLightZ, 0, 0, postAudienceZ, UP_X, UP_Y, UP_Z);
            mvpLightMatrix.multiply(vpMatrixS);
            mvpLightMatrix.multiply(modelMatrix);
            var gl = getWebGLContext(canvas, false);
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(MAX_PATCH_COUNT * FLOATS_PER_PATCH), gl.STREAM_DRAW);
            this.gl = gl;
            this.lightProgram = new LightProgram(gl, modelMatrix, mvpMatrix);
            this.shadowProgram = new ShadowProgram(gl, mvpLightMatrix);
            this.depthProgram = new DepthProgram(gl, modelMatrix, mvpMatrix);
            // Initialize framebuffer object (FBO)
            var fbo = new FrameBuffer(gl);
            if (!fbo.framebuffer) {
                console.log('Failed to initialize frame buffer object');
                return;
            }
            this.frameBuffer = fbo;
            gl.activeTexture(gl.TEXTURE0); // Set a texture object to the texture unit
            gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
        }
        GlRoom.prototype.writePatch = function (offset, bytes) {
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, offset, bytes);
        };
        GlRoom.prototype.redraw = function (vertexCount, vertices) {
            var gl = this.gl;
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);
            gl.depthFunc(gl.LEQUAL);
            gl.disable(gl.BLEND);
            if (includeShadow) {
                if (!stopAfterShadow) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer.framebuffer);
                    gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
                }
                gl.clearColor(1.0, 1.0, 1.0, 1.0);
                gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
                gl.useProgram(this.shadowProgram.glProgram);
                this.shadowProgram.enableVertexAttributes(this.gl);
                gl.frontFace(gl.CCW);
                gl.drawArrays(this.gl.TRIANGLES, 0, vertexCount);
            }
            if (stopAfterShadow) {
                return;
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.frontFace(gl.CW);
            gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            gl.useProgram(this.lightProgram.glProgram);
            gl.uniform1i(this.lightProgram.u_ShadowMap, 0);
            gl.uniformMatrix4fv(this.lightProgram.u_MvpMatrixFromLight, false, this.shadowProgram.mvpMatrix.elements);
            this.lightProgram.enableVertexAttributes(this.gl);
            gl.drawArrays(this.gl.TRIANGLES, 0, vertexCount);
            if (includeDepth) {
                gl.useProgram(this.depthProgram.glProgram);
                this.depthProgram.enableVertexAttributes(this.gl);
                gl.depthFunc(gl.LESS);
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.drawArrays(this.gl.LINES, 0, vertexCount / 3);
            }
        };
        return GlRoom;
    })();
    exports.GlRoom = GlRoom;
    var GlAudience = (function () {
        function GlAudience(room) {
            this.room = room;
            this.interactives = [];
            this.drawCount = 0;
            this.editCount = 0;
            this.vertices = new Patches();
            this.beginGestures(room.canvas);
        }
        GlAudience.prototype.beginGestures = function (element) {
            var _this = this;
            if (this.unsubscribeSpots) {
                this.unsubscribeSpots();
            }
            var gesturings = [];
            this.unsubscribeSpots = new glyffin_html_1.SpotObservable(element).subscribe({
                onStart: function (spot) {
                    console.log("Interactives:", _this.interactives);
                    var hits = glyffin_touch_1.Interactive.findHits(_this.interactives, spot.x, spot.y);
                    if (hits.length < 1) {
                        return false;
                    }
                    console.log("Hits:", hits);
                    gesturings = [];
                    hits.forEach(function (hit) {
                        var gesturing = hit.touchProvider.init(spot);
                        if (!gesturing) {
                            return;
                        }
                        gesturings.push(gesturing);
                    });
                    return gesturings.length != 0;
                },
                onMove: function (spot) {
                    var shouldDrain = false;
                    for (var i = 0, count = gesturings.length; i < count; i++) {
                        var gesturing = gesturings[i];
                        if (gesturing.isDrained()) {
                            continue;
                        }
                        if (shouldDrain) {
                            gesturing.cancel();
                            continue;
                        }
                        var status = gesturing.move(spot);
                        if (status === glyffin_1.GestureStatus.SUPERCHARGED) {
                            shouldDrain = true;
                        }
                    }
                    return true;
                },
                onCancel: function () {
                    for (var i = 0, count = gesturings.length; i < count; i++) {
                        var gesturing = gesturings[i];
                        if (gesturing.isDrained()) {
                            continue;
                        }
                        gesturing.cancel();
                    }
                    _this.beginGestures(element);
                },
                onEnd: function () {
                    var powered;
                    for (var i = 0, count = gesturings.length; i < count; i++) {
                        var gesturing = gesturings[i];
                        if (gesturing.isDrained()) {
                            continue;
                        }
                        if (powered) {
                            gesturing.cancel();
                            continue;
                        }
                        if (gesturing.isPowered()) {
                            powered = gesturing;
                        }
                        else {
                            gesturing.cancel();
                        }
                    }
                    if (powered) {
                        powered.release();
                    }
                    _this.beginGestures(element);
                }
            });
        };
        GlAudience.prototype.scheduleRedraw = function () {
            var _this = this;
            if (this.editCount > this.drawCount) {
                return;
            }
            this.editCount++;
            if (this.redrawTimeout) {
                clearTimeout(this.redrawTimeout);
                this.redrawTime = 0;
            }
            this.redrawTimeout = setTimeout(function () {
                _this.clearAndRedraw();
            }, 0);
        };
        GlAudience.prototype.willDraw = function () {
            return this.editCount > this.drawCount;
        };
        GlAudience.prototype.clearAndRedraw = function () {
            this.vertices.clearFreedPatches(this.room);
            this.room.redraw(MAX_VERTEX_COUNT, this.vertices.buffer);
            this.drawCount = this.editCount;
            this.redrawTime = Date.now();
            /*
             console.log("Active %i, Free %i, TotalFreed %",
             this.vertices.getActiveVertexCount(),
             this.vertices.getFreeVertexCount(), this.vertices.getTotalFreedVertices());
             */
        };
        GlAudience.prototype.addPatch = function (bounds, color, codePoint) {
            var _this = this;
            var left = bounds.left;
            var right = bounds.right;
            var top = bounds.top;
            var bottom = bounds.bottom;
            if (left >= right || top >= bottom || color.alpha == 0) {
                return glyffin_1.EMPTY_PATCH;
            }
            var patch = this.vertices.getPatch(left, top, right, bottom, bounds.level, color, codePoint, this.room);
            this.scheduleRedraw();
            return {
                remove: function () {
                    _this.vertices.putPatch(patch);
                }
            };
        };
        GlAudience.prototype.addZone = function (bounds, touchProvider) {
            var interactive = new glyffin_touch_1.Interactive(bounds, touchProvider);
            this.interactives.push(interactive);
            var interactives = this.interactives;
            return {
                remove: function () {
                    interactives.splice(interactives.indexOf(interactive), 1);
                }
            };
        };
        GlAudience.prototype.present = function (glyff, reactionOrOnResult, onError) {
            return glyffin_1.EMPTY_PRESENTATION;
        };
        return GlAudience;
    })();
    exports.GlAudience = GlAudience;
    var GlHall = (function () {
        function GlHall(canvas) {
            this.canvas = canvas;
            this.audiences = [];
            console.log("Hey");
        }
        GlHall.prototype.present = function (glyff, onResult, onError) {
            var previousAudience = this.audiences.length == 0 ?
                null : this.audiences[this.audiences.length - 1];
            /*
             var nextCanvas = previousAudience ? this.createCanvas(previousAudience.canvas) : this.canvas;
    
             var nextAudience = new GlAudience(nextCanvas);
             this.audiences.push(nextAudience);
             this.audience = nextAudience;
             return {
             end: ()=> {
             var index = this.audiences.indexOf(nextAudience);
             if (index < 0) {
             return;
             }
             var laterAudiences : GlAudience[] = this.audiences.slice(index);
             this.audiences.length = index;
             this.audience = this.audience[index - 1];
             for (var i = 0, count = laterAudiences.length; i < count; i++) {
             laterAudiences[i].disperse();
             }
             this.audience.engage()
             }
             };
             */
            return null;
        };
        GlHall.prototype.createCanvas = function (previousCanvas) {
            var nextCanvas = new HTMLCanvasElement();
            if (previousCanvas) {
                nextCanvas.width = previousCanvas.width;
                nextCanvas.height = previousCanvas.height;
            }
            else {
            }
            return nextCanvas;
        };
        return GlHall;
    })();
    exports.GlHall = GlHall;
});
//# sourceMappingURL=glyffin-gl.js.map