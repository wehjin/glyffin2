/**
 * Created by wehjin on 6/6/15.
 */
/// <reference path="glyffin.ts" />
var Glyffin;
(function (Glyffin) {
    function button() {
        return Glyffin.Glyff.create(function (metrics, audience, presenter) {
            var removable = presenter.addPresentation(Glyffin.GreenGlyff.present(metrics, audience));
            var zone = audience.addZone(metrics.perimeter, {
                getTouch: function (spot) {
                    removable.remove();
                    removable = presenter.addPresentation(Glyffin.BlueGlyff.present(metrics, audience));
                    function unpress() {
                        removable.remove();
                        removable = presenter.addPresentation(Glyffin.GreenGlyff.present(metrics, audience));
                    }
                    return {
                        onMove: function (spot) {
                        },
                        onRelease: function () {
                            unpress();
                            // Wait for screen to update with unpress.  Then deliver button press.
                            requestAnimationFrame(function () {
                                setTimeout(function () {
                                    presenter.onResult(Date.now());
                                }, 0);
                            });
                        },
                        onCancel: function () {
                            unpress();
                        }
                    };
                }
            });
            presenter.addPresentation({
                end: function () {
                    zone.remove();
                }
            });
        });
    }
    Glyffin.button = button;
})(Glyffin || (Glyffin = {}));
//# sourceMappingURL=glyffin-touch.js.map