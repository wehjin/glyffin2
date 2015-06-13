/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin-basic.ts" />

module Glyffin {

    export class Glyff<T> {
        constructor(private onPresent : (audience : Audience, presenter : Presenter<T>)=>void) {
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
            return Glyff.create((audience : Audience, presenter : Presenter<Void>)=> {
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
            });
        }

        addTopReact<U>(size : number, addGlyff : Glyff<U>) : Glyff<U> {
            var existingGlyff = this;
            return Glyff.create((audience : Audience, presenter : Presenter<Void>) => {
                var bounds = audience.getPerimeter().splitHorizontal(size);
                presenter.addPresentation(addGlyff.present(new PerimeterAudience(bounds[0],
                    audience), presenter));
                presenter.addPresentation(existingGlyff.present(new PerimeterAudience(bounds[1],
                    audience), presenter));
            });
        }

        addTop(size : number, addGlyff : Glyff<Void>) : Glyff<T> {
            var existingGlyff = this;
            return Glyff.create((audience : Audience, presenter : Presenter<Void>) => {
                var bounds = audience.getPerimeter().splitHorizontal(size);
                presenter.addPresentation(addGlyff.present(new PerimeterAudience(bounds[0],
                    audience), presenter));
                presenter.addPresentation(existingGlyff.present(new PerimeterAudience(bounds[1],
                    audience), presenter));
            });
        }

        kaleid(columns : number, rows : number, spots : number[][]) : Glyff<Void> {
            var upperGlyff = this;
            return Glyff.create((audience : Audience, presenter : Presenter<Void>)=> {
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
            return Glyff.create<U>((audience : Audience, presenter : Presenter<U>)=> {
                presenter.addPresentation(upperGlyff.present(operation.getUpperAudience(audience,
                        presenter),
                    operation.getUpperReaction(audience, presenter)
                ));
            });
        }

        present(audience : Audience, reactionOrOnResult ? : Reaction<T>|ResultCallback,
                onError? : ErrorCallback) : Presentation {
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
                    if (typeof reactionOrOnResult === 'object') {
                        (<Reaction<T>>reactionOrOnResult).onResult(result);
                    } else if (typeof reactionOrOnResult === 'function') {
                        (<ResultCallback>reactionOrOnResult)(result);
                    }
                },
                onError(error : Error) {
                    if (typeof reactionOrOnResult === 'object') {
                        (<Reaction<T>>reactionOrOnResult).onError(error);
                    } else if (onError) {
                        onError(error);
                    }
                }
            };
            this.onPresent(audience, presenter);
            return <Presentation>{
                end() {
                    while (presented.length > 0) {
                        presented.pop().end();
                    }
                }
            }
        }

        static fromColor(color : Color) : Glyff<Void> {
            return Glyff.create<Void>((audience : Audience, presenter : Presenter<Void>)=> {
                    var patch = audience.addRectanglePatch(audience.getPerimeter(), color);
                    presenter.addPresentation({
                        end() {
                            patch.remove();
                        }
                    });
                }
            );
        }

        static create<U>(f : (audience : Audience, presenter : Presenter<U>)=>void) : Glyff<U> {
            return new Glyff<U>(f);
        }
    }

    export var ClearGlyff = Glyff.create<Void>(()=> {
    });
    export var RedGlyff = Glyff.fromColor(Palette.RED);
    export var GreenGlyff = Glyff.fromColor(Palette.GREEN);
    export var BlueGlyff = Glyff.fromColor(Palette.BLUE);
    export var BeigeGlyff = Glyff.fromColor(Palette.BEIGE);
}