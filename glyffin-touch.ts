/**
 * Created by wehjin on 6/6/15.
 */

/// <reference path="glyffin.ts" />

module Glyffin {

    export function button() : Glyff<number> {
        return Glyff.create((audience : Glyffin.Audience,
                             presenter : Glyffin.Presenter<number>) => {
            var removable = presenter.addPresentation(GreenGlyff.present(audience));
            audience.addRectangleActive(audience.getPerimeter(), {
                getTouch: (spot : Spot) : Touch => {
                    removable.remove();
                    removable = presenter.addPresentation(BlueGlyff.present(audience));

                    function unpress() {
                        removable.remove();
                        removable = presenter.addPresentation(GreenGlyff.present(audience));
                    }

                    return {
                        onMove: (spot : Spot)=> {
                        },
                        onRelease: ()=> {
                            unpress();
                            presenter.onResult(Date.now());
                        },
                        onCancel: ()=> {
                            unpress();
                        }
                    };
                }
            });
        });
    }
}