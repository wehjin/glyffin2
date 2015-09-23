/**
 * @author  wehjin
 * @since   9/22/15
 */

import {Void, TexelRect, Presentation, Patch, PatchPresentation} from "./glyffin-type";
import {Glyff, Presenter, Color, Audience, Perimeter} from "./glyffin";

const descenderAdjustment = 8.0 / 7.0;

export function makeCodePoint(codePoint : number, color : Color) : Glyff<Void> {
    return Glyff.create((presenter : Presenter<Void>)=> {
        var bounds = presenter.perimeter;
        var adjusted : Perimeter = bounds.scaleDown(descenderAdjustment);
        var patch = presenter.audience.addPatch(adjusted, color, codePoint);
        presenter.addPresentation(new PatchPresentation(patch));
    }, 0);
}
