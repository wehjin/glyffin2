/**
 * Created by wehjin on 6/6/15.
 */

/// <reference path="glyffin.ts" />

module Glyffin {

    export function button() : Glyff<number> {
        return Glyff.create((metrics : Metrics, audience : Glyffin.Audience,
                             presenter : Glyffin.Presenter<number>) => {
            var removable = presenter.addPresentation(GreenGlyff.present(metrics, audience));
            var zone = audience.addZone(metrics.perimeter, {
                getTouch: (spot : Spot) : Touch => {
                    removable.remove();
                    removable = presenter.addPresentation(BlueGlyff.present(metrics, audience));

                    function unpress() {
                        removable.remove();
                        removable =
                            presenter.addPresentation(GreenGlyff.present(metrics, audience));
                    }

                    return {
                        onMove: (spot : Spot)=> {
                        },
                        onRelease: ()=> {
                            unpress();
                            setTimeout(()=> {
                                presenter.onResult(Date.now());
                            }, 0);
                        },
                        onCancel: ()=> {
                            unpress();
                        }
                    };
                }
            });
            presenter.addPresentation(<Presentation>{
                end: ()=> {
                    zone.remove();
                }
            });
        });
    }
}