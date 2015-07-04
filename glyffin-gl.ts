/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-html.ts" />
/// <reference path="glyffin-touch.ts" />

var STAGE_SIZE = 256;
var LIGHT_X = 0;
var LIGHT_Y = STAGE_SIZE / 2;
var LIGHT_Z = -1;
var LIGHT = [LIGHT_X, LIGHT_Y, LIGHT_Z, 1.0];
var AUDIENCE_X = 0;
var AUDIENCE_Y = 0;
var AUDIENCE_Z = -STAGE_SIZE;
var AUDIENCE = [AUDIENCE_X, AUDIENCE_Y, AUDIENCE_Z, 1.0];
var SHADOWMAP_RES = 2048;
var OFFSCREEN_WIDTH = SHADOWMAP_RES, OFFSCREEN_HEIGHT = SHADOWMAP_RES;
var UP_X = 0;
var UP_Y = 1;
var UP_Z = 0;
var showShadow = false;
var redShadow = true;

class FrameBuffer {

    public framebuffer;
    public texture;

    constructor(gl : WebGLRenderingContext) {
        var framebuffer : WebGLFramebuffer;
        var texture : WebGLTexture;
        var depthBuffer : WebGLRenderbuffer;

        // Define the error handling function
        function deleteObjects() {
            if (framebuffer) gl.deleteFramebuffer(framebuffer);
            if (texture) gl.deleteTexture(texture);
            if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        }

        // Create a texture object and set its size and parameters
        texture = gl.createTexture(); // Create a texture object
        if (!texture) {
            console.log('Failed to create texture object');
            deleteObjects();
            return;
        }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA,
            gl.UNSIGNED_BYTE, null);
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
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH,
            OFFSCREEN_HEIGHT);

        // Create a framebuffer object (FBO)
        framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            console.log('Failed to create frame buffer object');
            deleteObjects();
            return;
        }
        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture,
            0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER,
            depthBuffer);

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
}

module Glyffin {

    var MAX_PATCH_COUNT = 10000;
    var VERTICES_PER_PATCH = 6;
    var FLOATS_PER_POSITION = 3;
    var FLOATS_PER_COLOR = 4;
    var FLOATS_PER_VERTEX = FLOATS_PER_POSITION + FLOATS_PER_COLOR;
    var FLOATS_PER_PATCH = VERTICES_PER_PATCH * FLOATS_PER_VERTEX;
    var BYTES_PER_FLOAT = 4;
    var BYTES_BEFORE_COLOR = FLOATS_PER_POSITION * BYTES_PER_FLOAT;
    var BYTES_PER_VERTEX = FLOATS_PER_VERTEX * BYTES_PER_FLOAT;
    var BYTES_PER_PATCH = FLOATS_PER_PATCH * BYTES_PER_FLOAT;

    class ShadowProgram {
        private VSHADER_SOURCE : string =
            'attribute vec4 a_Position;\n' +
            'uniform mat4 u_MvpMatrix;\n' +
            'void main() {\n' +
            '  gl_Position = u_MvpMatrix * a_Position;\n' +
            '}\n';

        private FSHADER_SOURCE : string =
            '#ifdef GL_ES\n' +
            'precision mediump float;\n' +
            '#endif\n' +
            'vec4 pack (float depth) {\n' +
            '  const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);\n' +
            '  const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);\n' +
            '  vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);\n' + // Calculate the value stored into each byte
            '  rgbaDepth -= rgbaDepth.gbaa * bitMask;\n' + // Cut off the value which do not fit in 8 bits
            '  return rgbaDepth;\n' +
            '}\n' +
            'void main() {\n' +
            (showShadow ? '  gl_FragColor = vec4(gl_FragCoord.z,0.0,0.0,1.0);\n' :
                '  gl_FragColor = pack(gl_FragCoord.z);\n') +
            '}\n';

        public program : WebGLProgram;
        public mvpMatrix : Matrix4;
        private u_MvpMatrix : WebGLUniformLocation;
        private a_Position : number;

        constructor(gl : WebGLRenderingContext, mvpMatrix : Matrix4,
                    private vertices : VerticesAndColor) {
            var program = createProgram(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);
            this.program = program;

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

        public enableVertexAttributes() {
            this.vertices.enablePositionAttributes(this.program);
        }
    }

    class LightProgram {
        private VSHADER_SOURCE : string =
            'const vec3 c_Normal = vec3( 0.0, 0.0, 1.0 );\n' +
            'uniform mat4 u_ModelMatrix;\n' +
            'uniform mat4 u_MvpMatrix;\n' +
            'uniform mat4 u_MvpMatrixFromLight;\n' +
            'attribute vec4 a_Position;\n' +
            'attribute vec4 a_Color;\n' +
            'varying vec4 v_Color;\n' +
            'varying vec3 v_Normal;\n' +
            'varying vec3 v_Position;\n' +
            'varying vec4 v_PositionFromLight;\n' +
            'void main(){\n' +
            '  gl_Position = u_MvpMatrix * a_Position;\n' +
            '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
            '  v_PositionFromLight = u_MvpMatrixFromLight * a_Position;\n' +
            '  v_Normal = c_Normal;\n' +
            '  v_Color = a_Color;\n' +
            '}\n';

        private FSHADER_SOURCE : string =
            '#ifdef GL_ES\n' +
            'precision mediump float;\n' +
            '#endif\n' +
            'uniform vec3 u_LightColor;\n' +
            'uniform vec3 u_LightPosition;\n' +
            'uniform vec3 u_AmbientLight;\n' +
            'uniform sampler2D u_ShadowMap;\n' +
            'varying vec3 v_Position;\n' +
            'varying vec3 v_Normal;\n' +
            'varying vec4 v_Color;\n' +
            'varying vec4 v_PositionFromLight;\n' +
            'float unpack(const in vec4 rgbaDepth) {\n' +
            '  const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));\n' +
            '  float depth = dot(rgbaDepth, bitShift);\n' + // Use dot() since the calculations is same
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
            '  const float bias = 0.0025;\n' +
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
            (redShadow ? '  gl_FragColor = (visibility < 1.0) ? vec4(1.0,0.0,0.0,1.0) : color;\n' :
                '  gl_FragColor = vec4(color.rgb * visibility, color.a);\n') +
            '}\n';

        public program : WebGLProgram;
        private u_ModelMatrix : WebGLUniformLocation;
        private u_MvpMatrix : WebGLUniformLocation;
        private u_LightColor : WebGLUniformLocation;
        private u_LightPosition : WebGLUniformLocation;
        private u_AmbientLight : WebGLUniformLocation;
        public u_MvpMatrixFromLight : WebGLUniformLocation;
        public u_ShadowMap : WebGLUniformLocation;

        constructor(gl : WebGLRenderingContext, modelMatrix : Matrix4, mvpMatrix : Matrix4,
                    private vertices : VerticesAndColor) {
            var program = createProgram(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE);
            this.program = program;

            this.u_ModelMatrix = gl.getUniformLocation(program, 'u_ModelMatrix');
            this.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
            this.u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');
            this.u_LightColor = gl.getUniformLocation(program, 'u_LightColor');
            this.u_LightPosition = gl.getUniformLocation(program, 'u_LightPosition');
            this.u_MvpMatrixFromLight = gl.getUniformLocation(program, 'u_MvpMatrixFromLight');
            this.u_ShadowMap = gl.getUniformLocation(program, 'u_ShadowMap');

            if (!this.u_ModelMatrix || !this.u_MvpMatrix || !this.u_AmbientLight ||
                !this.u_LightColor || !this.u_LightPosition || !this.u_MvpMatrixFromLight ||
                !this.u_ShadowMap) {
                console.log('Failed to get uniform storage location');
            }

            gl.useProgram(program);
            gl.uniform3f(this.u_AmbientLight, 0.2, 0.2, 0.2);
            gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
            gl.uniform3f(this.u_LightPosition, LIGHT_X, LIGHT_Y, LIGHT_Z);
            gl.uniformMatrix4fv(this.u_ModelMatrix, false, modelMatrix.elements);
            gl.uniformMatrix4fv(this.u_MvpMatrix, false, mvpMatrix.elements);
        }

        public enableVertexAttributes() {
            this.vertices.enablePositionAttributes(this.program);
            this.vertices.enableColorAttributes(this.program);
        }
    }

    export class GlAudience implements Audience {
        public canvas : HTMLCanvasElement;
        private gl : WebGLRenderingContext;
        private vertices : VerticesAndColor;
        private interactives : Interactive[] = [];
        private drawCount : number = 0;
        private editCount : number = 0;
        private unsubscribeSpots : ()=>void;
        private lightProgram : LightProgram;
        private shadowProgram : ShadowProgram;
        private frameBuffer : FrameBuffer;

        beginGestures() {
            if (this.unsubscribeSpots) {
                this.unsubscribeSpots();
            }
            var touch;
            this.unsubscribeSpots = new SpotObservable(this.canvas).subscribe({
                onStart: (spot : Spot) : boolean => {
                    var hits = Interactive.findHits(this.interactives, spot.x, spot.y);
                    if (hits.length < 1) {
                        return false;
                    }
                    touch = hits[0].touchProvider.init(spot);
                    return true;
                },
                onMove: (spot : Spot) : boolean=> {
                    touch.move(spot, ()=> {
                        this.beginGestures();
                    });
                    return true;
                },
                onCancel: ()=> {
                    touch.cancel();
                    this.beginGestures();
                },
                onEnd: ()=> {
                    touch.release();
                    this.beginGestures();
                }
            });
        }

        constructor() {
            var canvas = <HTMLCanvasElement>document.getElementById('webgl');
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            this.canvas = canvas;
            var maxDimension = Math.max(canvas.width, canvas.height);

            var gl = getWebGLContext(canvas, false);
            this.gl = gl;

            var modelMatrix = new Matrix4();
            modelMatrix.setScale(STAGE_SIZE / canvas.width, -STAGE_SIZE / canvas.height,
                STAGE_SIZE / maxDimension);
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

            this.vertices = new VerticesAndColor(MAX_PATCH_COUNT, gl);
            this.lightProgram = new LightProgram(gl, modelMatrix, mvpMatrix, this.vertices);
            this.shadowProgram = new ShadowProgram(gl, mvpLightMatrix, this.vertices);

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

            this.beginGestures();
        }

        scheduleRedraw() {
            if (this.editCount > this.drawCount) {
                return;
            }
            this.editCount++;
            requestAnimationFrame(()=> {
                this.vertices.clearFreePatches();

                var gl = this.gl;
                if (!showShadow) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer.framebuffer);
                    gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
                }
                gl.clearColor(1.0, 1.0, 1.0, 1.0);
                gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

                gl.useProgram(this.shadowProgram.program);
                this.shadowProgram.enableVertexAttributes();
                gl.frontFace(gl.CCW);
                gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.getActiveVertexCount());

                if (!showShadow) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

                    gl.useProgram(this.lightProgram.program);
                    gl.uniform1i(this.lightProgram.u_ShadowMap, 0);
                    gl.uniformMatrix4fv(this.lightProgram.u_MvpMatrixFromLight, false,
                        this.shadowProgram.mvpMatrix.elements);
                    this.lightProgram.enableVertexAttributes();
                    gl.frontFace(gl.CW);
                    gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.getActiveVertexCount());
                }

                this.drawCount = this.editCount;
                console.log("Active %i, Free %i, TotalFreed %",
                    this.vertices.getActiveVertexCount(),
                    this.vertices.getFreeVertexCount(), this.vertices.getTotalFreedVertices());
            });
        }

        addPatch(bounds : Perimeter, color : Color) : Patch {
            if (bounds.left >= bounds.right || bounds.top >= bounds.bottom || color.alpha == 0) {
                return EMPTY_PATCH;
            }

            var patch = this.vertices.getPatch(bounds.left, bounds.top, bounds.right,
                bounds.bottom, bounds.level, color);
            this.scheduleRedraw();
            return <Patch>{
                remove: ()=> {
                    this.vertices.putPatch(patch);
                }
            };
        }

        addZone(bounds : Glyffin.Perimeter,
                touchProvider : Glyffin.Gesturable) : Glyffin.Zone {
            var interactive = new Interactive(bounds, touchProvider);
            this.interactives.push(interactive);
            var interactives = this.interactives;
            return {
                remove: ()=> {
                    interactives.splice(interactives.indexOf(interactive), 1);
                }
            };
        }


    }

    class VerticesAndColor {

        private nextPatchIndex = 0;
        private freePatchIndices : number[] = [];
        private clearedPatchIndices : number[] = [];
        public totalFreed = 0;
        private gl;
        private emptyPatchVertices = new Float32Array(FLOATS_PER_PATCH);
        private patchVertices = new Float32Array(FLOATS_PER_PATCH);

        constructor(private maxPatchCount : number, gl : WebGLBookContext) {
            this.gl = gl;

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

            var vertices = new Float32Array(maxPatchCount * FLOATS_PER_PATCH);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        }

        enableColorAttributes(program) {
            // TODO Take a_Color as parameter.
            var a_Color = this.gl.getAttribLocation(program, 'a_Color');
            this.gl.vertexAttribPointer(a_Color, FLOATS_PER_COLOR, this.gl.FLOAT, false,
                BYTES_PER_VERTEX,
                BYTES_BEFORE_COLOR);
            this.gl.enableVertexAttribArray(a_Color);
        }

        enablePositionAttributes(program) {
            // TODO Take a_Position as a parameter.
            var a_Position = this.gl.getAttribLocation(program, 'a_Position');
            this.gl.vertexAttribPointer(a_Position, FLOATS_PER_POSITION, this.gl.FLOAT, false,
                BYTES_PER_VERTEX, 0);
            this.gl.enableVertexAttribArray(a_Position);
        }

        getActiveVertexCount() : number {
            return this.nextPatchIndex * VERTICES_PER_PATCH;
        }

        getFreeVertexCount() : number {
            return (this.freePatchIndices.length + this.clearedPatchIndices.length) *
                VERTICES_PER_PATCH;
        }

        getTotalFreedVertices() : number {
            return this.totalFreed * VERTICES_PER_PATCH;
        }

        getPatch(left : number, top : number, right : number, bottom : number, level : number,
                 color : Glyffin.Color) : number {
            var patchIndex;
            if (this.freePatchIndices.length > 0) {
                patchIndex = this.freePatchIndices.pop();
            } else if (this.clearedPatchIndices.length > 0) {
                patchIndex = this.clearedPatchIndices.pop();
            } else {
                if (this.nextPatchIndex >= MAX_PATCH_COUNT) {
                    throw "Too many patches";
                }
                patchIndex = this.nextPatchIndex++;
            }
            this.patchVertices.set([left, top, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, top, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    left, bottom, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    left, bottom, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, top, level,
                                    color.red, color.green, color.blue, color.alpha,
                                    right, bottom, level,
                                    color.red, color.green, color.blue, color.alpha,
            ]);
            this.gl.bufferSubData(this.gl.ARRAY_BUFFER, patchIndex * BYTES_PER_PATCH,
                this.patchVertices);
            return patchIndex;
        }

        putPatch(patchIndex : number) {
            this.freePatchIndices.push(patchIndex);
            this.totalFreed++;
        }

        clearFreePatches() {
            if (this.freePatchIndices.length > 0) {
                for (var i = 0; i < this.freePatchIndices.length; i++) {
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER,
                        this.freePatchIndices[i] * BYTES_PER_PATCH,
                        this.emptyPatchVertices);
                }
                this.clearedPatchIndices = this.clearedPatchIndices.concat(this.freePatchIndices);
                this.freePatchIndices = [];
            }
        }
    }
}