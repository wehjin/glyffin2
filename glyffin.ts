/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin-basic.ts" />

module Glyffin {

    export class Glyff<T> {

        constructor(private onPresent : OnPresent<T>) {
        }

        addLefts<U>(insertions : Insertion<U>[]) : Glyff<T> {
            var current : Glyff<T> = this;
            var todo = insertions.slice();
            while (todo.length > 0) {
                var insertion : Insertion<U> = todo.pop();
                current = current.addLeft(insertion.amount, insertion.glyff);
            }
            return current;
        }

        addLeft(insertAmount : number, insertGlyff : Glyff<Void>) : Glyff<T> {
            var existingGlyff = this;
            return Glyff.create({
                call(audience : Audience, presenter : Presenter<Void>) {
                    var perimeter = audience.getPerimeter();
                    var insertRight = perimeter.left + insertAmount;
                    var insertPerimeter = new RectangleBounds(perimeter.left, perimeter.top,
                        insertRight, perimeter.bottom);
                    var modifiedPerimeter = new RectangleBounds(insertRight, perimeter.top,
                        perimeter.right, perimeter.bottom);
                    presenter.addPresentation(insertGlyff.present(new PerimeterAudience(insertPerimeter,
                        audience), presenter));
                    presenter.addPresentation(existingGlyff.present(new PerimeterAudience(modifiedPerimeter,
                        audience), presenter));
                }
            });
        }

        addTop(insertAmount : number, insertGlyff : Glyff<Void>) : Glyff<T> {
            var existingGlyff = this;
            return Glyff.create({
                call(audience : Audience, presenter : Presenter<Void>) {
                    var perimeter = audience.getPerimeter();
                    var insertBottom = perimeter.top + insertAmount;
                    var insertPerimeter = new RectangleBounds(perimeter.left, perimeter.top,
                        perimeter.right, insertBottom);
                    var modifiedPerimeter = new RectangleBounds(perimeter.left, insertBottom,
                        perimeter.right, perimeter.bottom);
                    presenter.addPresentation(insertGlyff.present(new PerimeterAudience(insertPerimeter,
                        audience), presenter));
                    presenter.addPresentation(existingGlyff.present(new PerimeterAudience(modifiedPerimeter,
                        audience), presenter));
                }
            });
        }

        kaleid(columns : number, rows : number, spots : number[][]) : Glyff<Void> {
            var upperGlyff = this;
            return Glyff.create({
                call(audience : Audience, presenter : Presenter<Void>) {
                    var perimeter = audience.getPerimeter();
                    var rowHeight = perimeter.getHeight() / rows;
                    var colWidth = perimeter.getWidth() / columns;
                    spots.forEach(spot=> {
                        var left = perimeter.left + colWidth * spot[0];
                        var top = perimeter.top + rowHeight * spot[1];
                        var spotPerimeter = new RectangleBounds(left,
                            top, left + colWidth, top + rowHeight
                        );
                        presenter.addPresentation(upperGlyff.present(
                            new PerimeterAudience(spotPerimeter, audience), presenter));
                    });
                }
            });
        }

        pad(xPixels : number, yPixels : number) : Glyff<T> {
            return this.compose({
                getUpperAudience(audience : Audience, presenter : Presenter<T>) : Audience {
                    var insetPerimeter = audience.getPerimeter().inset(xPixels, yPixels);
                    return new PerimeterAudience(insetPerimeter, audience);
                },
                getUpperReaction(audience : Audience, presenter : Presenter<T>) : Reaction<T> {
                    return presenter;
                }
            });
        }

        compose<U>(operation : Mogrifier<T,U>) {
            var upperGlyff = this;
            return Glyff.create<U>({
                call(audience : Audience, presenter : Presenter<U>) {
                    presenter.addPresentation(upperGlyff.present(operation.getUpperAudience(audience,
                            presenter),
                        operation.getUpperReaction(audience, presenter)
                    ));
                }
            });
        }

        present(audience : Audience, reaction ? : Reaction<T>) : Presentation {
            //noinspection JSUnusedLocalSymbols
            var firmReaction : Reaction<T> = reaction ? reaction : {
                onResult(result : T) {
                },
                onError(error : Error) {
                }
            };
            var presented : Presentation[] = [];
            var presenter = {
                addPresentation(presentation : Presentation) : Removable {
                    presented.push(presentation);
                    return {
                        remove() {
                            var index = presented.indexOf(presentation);
                            if (index >= 0) {
                                presented.splice(index, 1);
                            }
                            presentation.end();
                        }
                    }
                },
                onResult(result : T) {
                    firmReaction.onResult(result);
                },
                onError(error : Error) {
                    firmReaction.onError(error);
                }
            };
            this.onPresent.call(audience, presenter);
            return <Presentation>{
                end() {
                    while (presented.length > 0) {
                        presented.pop().end();
                    }
                }
            }
        }

        static fromColor(color : Color) : Glyff<Void> {
            return Glyff.create<Void>({
                call(audience : Audience, presenter : Presenter<Void>) {
                    var patch = audience.addRectanglePatch(audience.getPerimeter(), color);
                    presenter.addPresentation({
                        end() {
                            patch.remove();
                        }
                    });
                }
            });
        }

        static create<U>(f : OnPresent<U>) : Glyff<U> {
            return new Glyff<U>(f);
        }
    }

    export var RedGlyff = Glyff.fromColor(Palette.RED);
    export var GreenGlyff = Glyff.fromColor(Palette.GREEN);
    export var BlueGlyff = Glyff.fromColor(Palette.BLUE);
    export var BeigeGlyff = Glyff.fromColor(Palette.BEIGE);

    export var ClearGlyff = Glyff.create<Void>({
        call(audience : Audience, presenter : Presenter<Void>) {
        }
    });
}