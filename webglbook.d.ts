/**
 * Created by wehjin on 5/24/15.
 */

interface WebGLBookContext extends WebGLRenderingContext {
    program : WebGLRenderingContext;
}

declare
function getWebGLContext(canvas : HTMLCanvasElement, debug? : boolean) : WebGLBookContext;

declare
function initShaders(gl : WebGLBookContext, vshader : string, fshader : string);