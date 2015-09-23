/**
 * @author  wehjin
 * @since   9/22/15
 */
define(["require", "exports", "./glyffin-type", "./glyffin"], function (require, exports, glyffin_type_1, glyffin_1) {
    var descenderAdjustment = 8.0 / 7.0;
    function makeCodePoint(codePoint, color) {
        return glyffin_1.Glyff.create(function (presenter) {
            var bounds = presenter.perimeter;
            var adjusted = bounds.scaleDown(descenderAdjustment);
            var patch = presenter.audience.addPatch(adjusted, color, codePoint);
            presenter.addPresentation(new glyffin_type_1.PatchPresentation(patch));
        }, 0);
    }
    exports.makeCodePoint = makeCodePoint;
});
//# sourceMappingURL=glyffin-image.js.map