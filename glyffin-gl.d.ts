/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.d.ts" />
/// <reference path="glyffin-html.d.ts" />
/// <reference path="glyffin-touch.d.ts" />
/// <reference path="glyffin-gl-basic.d.ts" />
/// <reference path="glyffin-gl-depth.d.ts" />
/**
 * Created by wehjin on 5/24/15.
 */
import Program = Glu.Program;
declare var STAGE_SIZE: number;
declare var LIGHT_X: number;
declare var LIGHT_Y: number;
declare var LIGHT_Z: number;
declare var LIGHT: number[];
declare var AUDIENCE_X: number;
declare var AUDIENCE_Y: number;
declare var AUDIENCE_Z: number;
declare var AUDIENCE: number[];
declare var SHADOWMAP_RES: number;
declare var OFFSCREEN_WIDTH: number, OFFSCREEN_HEIGHT: number;
declare var UP_X: number;
declare var UP_Y: number;
declare var UP_Z: number;
declare var includeShadow: boolean;
declare var stopAfterShadow: boolean;
declare var redShadow: boolean;
declare var includeDepth: boolean;
declare var MAX_PATCH_COUNT: number;
declare var VERTICES_PER_PATCH: number;
declare var MAX_VERTEX_COUNT: number;
declare var FLOATS_PER_POSITION: number;
declare var FLOATS_PER_COLOR: number;
declare var FLOATS_PER_VERTEX: number;
declare var FLOATS_PER_PATCH: number;
declare var BYTES_PER_FLOAT: number;
declare var BYTES_BEFORE_COLOR: number;
declare var BYTES_PER_VERTEX: number;
declare var BYTES_PER_PATCH: number;
declare function enableColorAttributes(program: Program, gl: WebGLRenderingContext): void;
declare function enablePositionAttributes(program: Program, gl: WebGLRenderingContext): void;
declare class FrameBuffer {
    framebuffer: any;
    texture: any;
    constructor(gl: WebGLRenderingContext);
}
declare class Patches {
    private freePatchList;
    private freePatchHead;
    private freePatchTail;
    private freePatchCleared;
    private freePatchCount;
    totalFreed: number;
    private patch;
    private emptyPatch;
    buffer: Float32Array;
    constructor();
    setVertex(n: number, values: number[]): void;
    getPatch(left: number, top: number, right: number, bottom: number, level: number, color: Glyffin.Color, room: MyRoom): number;
    putPatch(patchIndex: number): void;
    clearFreedPatches(room: MyRoom): void;
}
declare class ShadowProgram implements Program {
    private VSHADER_SOURCE;
    private FSHADER_SOURCE;
    glProgram: WebGLProgram;
    mvpMatrix: Matrix4;
    private u_MvpMatrix;
    private a_Position;
    constructor(gl: WebGLRenderingContext, mvpMatrix: Matrix4);
    enableVertexAttributes(gl: WebGLRenderingContext): void;
}
declare class LightProgram implements Program {
    private VSHADER_SOURCE;
    private FSHADER_SOURCE;
    glProgram: WebGLProgram;
    private u_ModelMatrix;
    private u_MvpMatrix;
    private u_LightColor;
    private u_LightPosition;
    private u_AmbientLight;
    u_MvpMatrixFromLight: WebGLUniformLocation;
    u_ShadowMap: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext, modelMatrix: Matrix4, mvpMatrix: Matrix4);
    enableVertexAttributes(gl: WebGLRenderingContext): void;
}
declare class MyRoom {
    canvas: HTMLCanvasElement;
    private gl;
    private lightProgram;
    private shadowProgram;
    private depthProgram;
    private frameBuffer;
    width: number;
    height: number;
    perimeter: Glyffin.Perimeter;
    depthMap: Uint8Array;
    constructor(canvas: HTMLCanvasElement);
    writePatch(offset: number, bytes: Float32Array): void;
    redraw(vertexCount: number, vertices: Float32Array): void;
}
declare module Glyffin {
    class GlRoom extends MyRoom {
    }
    class GlAudience implements Audience {
        private room;
        private vertices;
        private interactives;
        private drawCount;
        private editCount;
        private unsubscribeSpots;
        private redrawTime;
        constructor(room: GlRoom);
        beginGestures(element: HTMLElement): void;
        scheduleRedraw(): void;
        clearAndRedraw(): void;
        addPatch(bounds: Perimeter, color: Color): Patch;
        addZone(bounds: Glyffin.Perimeter, touchProvider: Glyffin.Gesturable): Glyffin.Zone;
        present<U>(glyff: Glyff<U>, reactionOrOnResult: Reaction<U> | OnResult<U>, onError: OnError): Presentation;
    }
    class GlHall implements Hall {
        private canvas;
        audience: GlAudience;
        audiences: GlAudience[];
        constructor(canvas: HTMLCanvasElement);
        present<U>(glyff: Glyff<U>, onResult?: OnResult<U>, onError?: OnError): Presentation;
        private createCanvas(previousCanvas);
    }
}
