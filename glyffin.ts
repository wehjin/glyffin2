/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin-basic.ts" />

module Glyffin {

    class NoResultPresenter<S,T> implements Presenter<S> {
        private outerPresenter;

        constructor(outerPresenter : Presenter<T>) {
            this.outerPresenter = outerPresenter;
        }

        addPresentation(presentation : Presentation) : Removable {
            return this.outerPresenter.addPresentation(presentation);
        }

        onResult(result : S) {
            // Do nothing.  Send to null.
        }

        onError(error : Error) {
            this.outerPresenter.onError(error);
        }
    }

    export class Glyff<T> {
        constructor(private onPresent : (metrics : Metrics, audience : Audience,
                                         presenter : Presenter<T>)=>void) {
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
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<Void>)=> {
                // TODO: Move perimeter computation into RectangleBounds.
                var perimeter = metrics.perimeter;
                var insertRight = perimeter.left + insertAmount;
                var insertPerimeter = new RectangleBounds(perimeter.left, perimeter.top,
                    insertRight, perimeter.bottom);
                var modifiedPerimeter = new RectangleBounds(insertRight, perimeter.top,
                    perimeter.right, perimeter.bottom);
                presenter.addPresentation(insertGlyff.present(metrics.withPerimeter(insertPerimeter),
                    audience, presenter));
                presenter.addPresentation(existingGlyff.present(metrics.withPerimeter(modifiedPerimeter),
                    audience, presenter));
            });
        }

        addTopReact<U>(size : number, addGlyff : Glyff<U>) : Glyff<U> {
            var existingGlyff = this;
            // TODO: Fix Presenter type. Should be U.
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<Void>) => {
                var bounds = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(addGlyff.present(metrics.withPerimeter(bounds[0]),
                    audience, presenter));
                presenter.addPresentation(existingGlyff.present(metrics.withPerimeter(bounds[1]),
                    audience, presenter));
            });
        }

        addTop(size : number, addGlyff : Glyff<Void>) : Glyff<T> {
            var existingGlyff = this;
            // TODO: Fix Presenter type.  Should be T.
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<Void>) => {
                var bounds = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(addGlyff.present(metrics.withPerimeter(bounds[0]),
                    audience, presenter));
                presenter.addPresentation(existingGlyff.present(metrics.withPerimeter(bounds[1]),
                    audience, presenter));
            });
        }

        addNearMajor<U>(distance : number, nearGlyff : Glyff<U>) : Glyff<U> {
            var farGlyff = this;
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<U>) => {
                // TODO: Enable z-level in bounds, support distance.
                presenter.addPresentation(farGlyff.present(metrics, audience,
                    new NoResultPresenter(presenter)));
                presenter.addPresentation(nearGlyff.present(metrics, audience, presenter));
            });
        }

        kaleid(columns : number, rows : number, spots : number[][]) : Glyff<Void> {
            var upperGlyff = this;
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<Void>)=> {
                var perimeter = metrics.perimeter;
                var rowHeight = perimeter.getHeight() / rows;
                var colWidth = perimeter.getWidth() / columns;
                spots.forEach(spot=> {
                    var left = perimeter.left + colWidth * spot[0];
                    var top = perimeter.top + rowHeight * spot[1];
                    var spotPerimeter = new RectangleBounds(left,
                        top, left + colWidth, top + rowHeight
                    );
                    presenter.addPresentation(upperGlyff.present(
                        metrics.withPerimeter(spotPerimeter), audience, presenter));
                });
            });
        }

        pad(xPixels : number, yPixels : number) : Glyff<T> {
            return this.compose({
                getMetrics(metrics : Metrics, presenter : Presenter<T>) : Metrics {
                    var insetPerimeter = metrics.perimeter.inset(xPixels, yPixels);
                    return metrics.withPerimeter(insetPerimeter);

                },
                getUpperAudience(audience : Audience, presenter : Presenter<T>) : Audience {
                    return audience;
                },
                getUpperReaction(audience : Audience, presenter : Presenter<T>) : Reaction<T> {
                    return presenter;
                }
            });
        }

        compose<U>(mogrifier : Mogrifier<T,U>) {
            var upperGlyff = this;
            return Glyff.create<U>((metrics : Metrics, audience : Audience,
                                    presenter : Presenter<U>)=> {
                presenter.addPresentation(upperGlyff.present(mogrifier.getMetrics(metrics,
                        presenter), mogrifier.getUpperAudience(audience,
                        presenter),
                    mogrifier.getUpperReaction(audience, presenter)
                ));
            });
        }

        present(metrics : Metrics, audience : Audience,
                reactionOrOnResult ? : Reaction<T>|ResultCallback,
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
            this.onPresent(metrics, audience, presenter);
            return <Presentation>{
                end() {
                    while (presented.length > 0) {
                        presented.pop().end();
                    }
                }
            }
        }

        static fromColor(color : Color) : Glyff<Void> {
            return Glyff.create<Void>((metrics : Metrics, audience : Audience,
                                       presenter : Presenter<Void>)=> {
                    var patch = audience.addPatch(metrics.perimeter, color);
                    presenter.addPresentation({
                        end() {
                            patch.remove();
                        }
                    });
                }
            );
        }

        static create<U>(onPresent : (metrics : Metrics, audience : Audience,
                                      presenter : Presenter<U>)=>void) : Glyff<U> {
            return new Glyff<U>(onPresent);
        }
    }

    export var ClearGlyff = Glyff.create<Void>(()=> {
    });

    export function fromColorPath(colorPath : number[]) : Glyff<Void> {
        return Glyff.create((metrics : Metrics, audience : Audience,
                             presenter : Presenter<Void>)=> {
            var colorGlyff = Glyff.fromColor(metrics.palette.get(colorPath));
            presenter.addPresentation(colorGlyff.present(metrics, audience, null, null));
        });
    }

    export var RedGlyff = Glyff.fromColor(Color.RED);
    export var GreenGlyff = Glyff.fromColor(Color.GREEN);
    export var BlueGlyff = Glyff.fromColor(Color.BLUE);
    export var BeigeGlyff = Glyff.fromColor(Color.BEIGE);
}