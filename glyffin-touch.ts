/**
 * Created by wehjin on 6/6/15.
 */

/// <reference path="glyffin.ts" />

module Glyffin {

    export class Start {
        constructor(public time : number) {
        }
    }

    export function button() : Glyff<Start> {
        return Glyff.create({
            call(audience : Glyffin.Audience, presenter : Glyffin.Presenter<Glyffin.Start>) {
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
                            },
                            onCancel: ()=> {
                                unpress();
                            }
                        };
                    }
                });
            }
        });
    }
}