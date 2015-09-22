/**
 * @author  wehjin
 * @since   9/22/15
 */
define(["require", "exports", "./glyffin-type", "./glyffin"], function (require, exports, glyffin_type_1, glyffin_1) {
    function makeCodePoint(codePoint, color) {
        return glyffin_1.Glyff.create(function (presenter) {
            var patch = presenter.audience.addPatch(presenter.perimeter, color, codePoint);
            presenter.addPresentation(new glyffin_type_1.PatchPresentation(patch));
        }, 0);
    }
    exports.makeCodePoint = makeCodePoint;
});
//# sourceMappingURL=glyffin-image.js.map