/**
 * Created by wehjin on 5/24/15.
 */

interface WebGLBookContext extends WebGLRenderingContext {
    program : WebGLProgram;
}

declare function getWebGLContext(canvas : HTMLCanvasElement, debug? : boolean) : WebGLBookContext;

declare function initShaders(gl : WebGLBookContext, vshader : string, fshader : string);

declare function createProgram(gl : WebGLRenderingContext, vshader : string,
                               fshader : string) : WebGLProgram;

declare class Vector4 {
    elements : Float32Array;

    constructor(array? : number[]);
}

declare class Vector3 {
    elements : Float32Array;

    constructor(array? : number[]);
}

declare class Matrix4 {
    elements : Float32Array;

    constructor(matrix? : Matrix4);

    setTranslate(x : number, y : number, z : number) : Matrix4;

    translate(x : number, y : number, z : number) : Matrix4;

    setScale(x : number, y : number, z : number) : Matrix4;

    scale(x : number, y : number, z : number) : Matrix4;

    setLookAt(eyeX : number, eyeY : number, eyeZ : number, atX : number,
              atY : number, atZ : number, upX : number, upY : number,
              upZ : number);

    lookAt(eyeX : number, eyeY : number, eyeZ : number, atX : number,
           atY : number, atZ : number, upX : number, upY : number,
           upZ : number);

    multiply(matrix : Matrix4) : Matrix4;

    setPerspective(fov : number, aspectRatio : number, near : number, far : number);

    setOrtho(left : number, right : number, bottom : number, top : number, near : number,
             far : number);

    setFrustum(left : number, right : number, bottom : number, top : number, near : number,
               far : number);

    multiplyVector4(vector : Vector4) : Vector4;

    multiplyVector3(vector : Vector3) : Vector3;
}
