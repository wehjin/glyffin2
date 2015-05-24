/**
 * Created by wehjin on 5/24/15.
 */

declare
function getWebGLContext(canvas : HTMLCanvasElement, debug? : boolean) : WebGLRenderingContext;

declare
function initShaders(gl : WebGLRenderingContext, vshader : string, fshader : string);