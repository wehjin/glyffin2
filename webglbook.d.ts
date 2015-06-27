/**
 * Created by wehjin on 5/24/15.
 */

interface WebGLBookContext extends WebGLRenderingContext {
    program : WebGLRenderingContext;
}

declare function getWebGLContext(canvas : HTMLCanvasElement, debug? : boolean) : WebGLBookContext;

declare function initShaders(gl : WebGLBookContext, vshader : string, fshader : string);

declare class Matrix4 {
    elements : Float32Array;

    setTranslate(x : number, y : number, z : number) : Matrix4;

    translate(x : number, y : number, z : number) : Matrix4;

    setScale(x : number, y : number, z : number) : Matrix4;

    scale(x : number, y : number, z : number) : Matrix4;

    setLookAt(eyeX : number, eyeY : number, eyeZ : number, atX : number,
              atY : number, atZ : number, upX : number, upY : number,
              upZ : number);

    multiply(matrix : Matrix4) : Matrix4;

    setPerspective(fov : number, aspectRatio : number, near : number, far : number);
}
