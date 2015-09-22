/**
 * @author  wehjin
 * @since   9/22/15
 */

import {Void,TexelRect, Presentation, Patch, PatchPresentation} from "./glyffin-type";
import {Glyff, Presenter, Color, Audience} from "./glyffin";

export function makeCodePoint(codePoint : number, color : Color) : Glyff<Void> {
    return Glyff.create((presenter : Presenter<Void>)=> {
        var patch = presenter.audience.addPatch(presenter.perimeter, color, codePoint);
        presenter.addPresentation(new PatchPresentation(patch));
    }, 0);
}
