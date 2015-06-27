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

    class ClickGesturing implements Gesturing {

        private isEnded : boolean = false;
        private pressTime : number = 0;
        private willPress : number = 0;

        private clearWillPress() {
            if (this.willPress) {
                clearTimeout(this.willPress);
                this.willPress = 0;
            }
        }

        private doPress() {
            if (this.isEnded) {
                return;
            }
            this.clearWillPress();
            this.pressTime = Date.now();
            this.onPress();
        }

        private doEnd() {
            this.isEnded = true;
            this.clearWillPress();
            if (this.pressTime) {
                this.onUnpress();
            }
        }

        constructor(private startSpot : Spot, private threshold : number,
                    private onPress : ()=>void,
                    private onUnpress : ()=>void, private onClick : ()=>void) {
            this.willPress = setTimeout(()=> {
                this.doPress();
            }, 200);
        }

        release() {
            if (this.isEnded) {
                return;
            }

            if (this.pressTime == 0) {
                this.doPress();
            }

            var delay = (this.pressTime + 200) - Date.now();
            // Stayed pressed until minimum duration ends then un-press.
            setTimeout(()=> {
                this.doEnd();

                // Wait for screen to show the un-press before delivering click.
                setTimeout(this.onClick, 100);
            }, (delay > 0) ? delay : 0);
        }

        move(spot : Glyffin.Spot, onAbort : ()=>void) {
            if (this.isEnded) {
                return;
            }
            if (spot.gridDistance(this.startSpot) > this.threshold) {
                this.doEnd();
                onAbort();
            }
        }

        cancel() {
            if (this.isEnded) {
                return;
            }
            this.doEnd();
        }
    }

    class ClickGesturable implements Gesturable {
        constructor(private threshold : number, private press : ()=>void,
                    private unpress : ()=>void, private click : ()=>void) {
        }

        init(spot : Spot) : Gesturing {
            return new ClickGesturing(spot, this.threshold, this.press, this.unpress, this.click);
        }
    }

    export class Glyff<T> {
        constructor(private onPresent : (metrics : Metrics, audience : Audience,
                                         presenter : Presenter<T>)=>void) {
        }

        static create<U>(onPresent : (metrics : Metrics, audience : Audience,
                                      presenter : Presenter<U>)=>void) : Glyff<U> {
            return new Glyff<U>(onPresent);
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

        rebuild<U>(builder : (previous : Glyff<T>)=>Glyff<U>) : Glyff<U> {
            var rebuilt = builder(this);
            return Glyff.create<U>((metrics : Metrics, audience : Audience,
                                    presenter : Presenter<U>)=> {
                presenter.addPresentation(rebuilt.present(metrics, audience, presenter));
            });
        }

        compose<U>(mogrifier : Mogrifier<T,U>) : Glyff<U> {
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

        combineTop(size : number, topGlyff : Glyff<T>) : Glyff<T> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<T>) => {
                var split = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(topGlyff.present(metrics.withPerimeter(split[0]),
                    audience, presenter));
                presenter.addPresentation(this.present(metrics.withPerimeter(split[1]),
                    audience, presenter));
            });
        }

        majorTop<U>(size : number, topGlyff : Glyff<U>) : Glyff<U> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<U>) => {
                var split = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(topGlyff.present(metrics.withPerimeter(split[0]),
                    audience, presenter));
                presenter.addPresentation(this.present(metrics.withPerimeter(split[1]),
                    audience, new NoResultPresenter(presenter)));
            });
        }

        minorTop<U>(size : number, addGlyff : Glyff<U>) : Glyff<T> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<T>) => {
                var split = metrics.perimeter.splitHorizontal(size);
                presenter.addPresentation(addGlyff.present(metrics.withPerimeter(split[0]),
                    audience, new NoResultPresenter(presenter)));
                presenter.addPresentation(this.present(metrics.withPerimeter(split[1]),
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

        limitWidth(maxWidth : number, align : number) : Glyff<T> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<T>) => {
                var perimeter = metrics.perimeter;
                var width = perimeter.getWidth();
                if (width <= maxWidth) {
                    presenter.addPresentation(this.present(metrics, audience, presenter));
                } else {
                    var narrowPerimeter : RectangleBounds = perimeter.limitWidth(maxWidth, align);
                    var narrowMetrics = metrics.withPerimeter(narrowPerimeter);
                    presenter.addPresentation(this.present(narrowMetrics, audience, presenter));
                }
            });
        }

        limitHeight(maxHeight : number, align : number) : Glyff<T> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<T>) => {
                var perimeter = metrics.perimeter;
                var height = perimeter.getHeight();
                if (height <= maxHeight) {
                    presenter.addPresentation(this.present(metrics, audience, presenter));
                } else {
                    var shortPerimeter : RectangleBounds = perimeter.limitHeight(maxHeight, align);
                    var shortMetrics = metrics.withPerimeter(shortPerimeter);
                    presenter.addPresentation(this.present(shortMetrics, audience, presenter));
                }
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

        clicken<U>(symbol : string, pressed : Glyff<U>) : Glyff<string> {
            return Glyff.create<string>((metrics : Metrics, audience : Audience,
                                         presenter : Presenter<Void>)=> {
                var unpressed = this;
                var removable = presenter.addPresentation(unpressed.present(metrics, audience));
                var zone = audience.addZone(metrics.perimeter,
                    new ClickGesturable(metrics.tapHeight / 2, ()=> {
                        removable.remove();
                        removable = presenter.addPresentation(pressed.present(metrics, audience));
                    }, ()=> {
                        removable.remove();
                        removable = presenter.addPresentation(unpressed.present(metrics, audience));
                    }, ()=> {
                        presenter.onResult(symbol);
                    }));
                presenter.addPresentation(<Presentation>{
                    end: ()=> {
                        zone.remove();
                    }
                });
            });
        }

        static color(color : Color) : Glyff<Void> {
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

    }

    export var ClearGlyff = Glyff.create<Void>(()=> {
    });

    export function colorPath(colorPath : number[], mix? : number,
                              colorPath2? : number[]) : Glyff<Void> {
        return Glyff.create((metrics : Metrics, audience : Audience,
                             presenter : Presenter<Void>)=> {
            var color = metrics.palette.get(colorPath);
            if (mix) {
                color = color.mix(mix, metrics.palette.get(colorPath2));
            }
            var colorGlyff = Glyff.color(color);
            presenter.addPresentation(colorGlyff.present(metrics, audience, null, null));
        });
    }

    export var RedGlyff = Glyff.color(Color.RED);
    export var GreenGlyff = Glyff.color(Color.GREEN);
    export var BlueGlyff = Glyff.color(Color.BLUE);
    export var BeigeGlyff = Glyff.color(Color.BEIGE);
    export var WhiteGlyff = Glyff.color(Color.WHITE);
    export var BlackGlyff = Glyff.color(Color.BLACK);
}