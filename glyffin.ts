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

    interface AnimationPath {
        start(now : number);
        getAge(now : number) : number;
        hasMore(now : number) : boolean;
    }

    class LinearAnimationPath implements AnimationPath {
        private startTime;
        private endTime;

        constructor(private duration : number, private reverse : boolean) {
        }

        start(now : number) {
            this.startTime = now;
            this.endTime = this.startTime + this.duration;
        }

        getAge(now : number) : number {
            if (now >= this.endTime) {
                return this.reverse ? 0 : 1;
            }
            if (now <= this.startTime) {
                return this.reverse ? 1 : 0;
            }
            var age = (now - this.startTime) / this.duration;
            return this.reverse ? (1 - age) : age;
        }

        hasMore(now : number) : boolean {
            return now < this.endTime;
        }
    }

    class CycleAnimationPath implements AnimationPath {
        private reversed;
        private innerPath;
        private lives;
        private started;

        constructor(private duration : number, count : number) {
            this.reversed = false;
            this.innerPath = new LinearAnimationPath(duration, this.reversed);
            this.lives = count * 2 - 1;
        }

        start(now : number) {
            this.started = true;
            this.innerPath.start(now);
        }

        getAge(now : number) : number {
            return this.innerPath.getAge(now);
        }

        hasMore(now : number) : boolean {
            var hasMore = this.innerPath.hasMore(now);
            if (!hasMore) {
                if (this.started && this.lives > 0) {
                    this.lives--;
                    this.reversed = !this.reversed;
                    this.innerPath = new LinearAnimationPath(this.duration, this.reversed);
                    this.innerPath.start(now);
                    hasMore = this.innerPath.hasMore(now);
                }
            }
            return hasMore;
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
                    while (presented.length) {
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

        addLefts(insertions : Insertion<T>[]) : Glyff<T> {
            var current : Glyff<T> = this;
            var todo = insertions.slice();
            while (todo.length > 0) {
                var insertion : Insertion<T> = todo.pop();
                current = current.splitWidthCombine(insertion.amount, insertion.glyff);
            }
            return current;
        }

        splitWidthCombine(size : number, glyff : Glyff<T>) : Glyff<T> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<T>)=> {
                var split = metrics.perimeter.splitWidth(size);
                presenter.addPresentation(glyff.present(metrics.withPerimeter(split[0]),
                    audience, presenter));
                presenter.addPresentation(this.present(metrics.withPerimeter(split[1]),
                    audience, presenter));
            });
        }

        splitHeightCombine(size : number, topGlyff : Glyff<T>) : Glyff<T> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<T>) => {
                var split = metrics.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(metrics.withPerimeter(split[0]),
                    audience, presenter));
                presenter.addPresentation(this.present(metrics.withPerimeter(split[1]),
                    audience, presenter));
            });
        }

        splitHeightRetain<U>(size : number, topGlyff : Glyff<U>) : Glyff<U> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<U>) => {
                var split = metrics.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(metrics.withPerimeter(split[0]),
                    audience, presenter));
                presenter.addPresentation(this.present(metrics.withPerimeter(split[1]),
                    audience, new NoResultPresenter(presenter)));
            });
        }

        splitHeightYield<U>(size : number, addGlyff : Glyff<U>) : Glyff<T> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<T>) => {
                var split = metrics.perimeter.splitHeight(size);
                presenter.addPresentation(addGlyff.present(metrics.withPerimeter(split[0]),
                    audience, new NoResultPresenter(presenter)));
                presenter.addPresentation(this.present(metrics.withPerimeter(split[1]),
                    audience, presenter));
            });
        }

        addNearMajor<U>(level : number, nearGlyff : Glyff<U>) : Glyff<U> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<U>) => {
                presenter.addPresentation(this.present(metrics, audience,
                    new NoResultPresenter(presenter)));

                // TODO: Think through relative versus absolute level.
                var nearPerimeter = metrics.perimeter.withLevel(metrics.perimeter.level + level);
                presenter.addPresentation(nearGlyff.present(metrics.withPerimeter(nearPerimeter),
                    audience, presenter));
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
                    var narrowPerimeter : Perimeter = perimeter.limitWidth(maxWidth, align);
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
                    var shortPerimeter : Perimeter = perimeter.limitHeight(maxHeight, align);
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
                for (var i = 0, count = spots.length; i < count; i++) {
                    var spot = spots[i];
                    var left = perimeter.left + colWidth * spot[0];
                    var top = perimeter.top + rowHeight * spot[1];
                    var spotPerimeter = new Perimeter(left, top, left + colWidth, top + rowHeight,
                        perimeter.age, perimeter.level);
                    presenter.addPresentation(upperGlyff.present(
                        metrics.withPerimeter(spotPerimeter), audience, presenter));
                }
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

        move(x : number) : Glyff<T> {
            return Glyff.create<T>((metrics : Metrics, audience : Audience,
                                    presenter : Presenter<Void>)=> {
                var perimeter = metrics.perimeter.translate(x);
                presenter.addPresentation(this.present(metrics.withPerimeter(perimeter), audience,
                    presenter));
            });
        }

        clicken<U>(symbol : string, pressed : Glyff<U>) : Glyff<string> {
            return Glyff.create<string>((metrics : Metrics, audience : Audience,
                                         presenter : Presenter<Void>)=> {
                var perimeter = metrics.perimeter;
                var unpressed = this;
                var unpressedMetrics = metrics.withPerimeter(perimeter.withLevel(perimeter.level +
                    4));
                var removable = presenter.addPresentation(unpressed.present(unpressedMetrics,
                    audience));
                var zone = audience.addZone(perimeter,
                    new ClickGesturable(metrics.tapHeight / 2, ()=> {
                        removable.remove();
                        removable = presenter.addPresentation(pressed.present(metrics, audience));
                    }, ()=> {
                        removable.remove();
                        removable = presenter.addPresentation(unpressed.present(unpressedMetrics,
                            audience));
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

        pagen<U>(index : number, next : Glyff<U>, prev : Glyff<U>,
                 pressed : Glyff<U>) : Glyff<string> {
            return Glyff.create<string>((metrics : Metrics, audience : Audience,
                                         presenter : Presenter<Void>)=> {
                var perimeter = metrics.perimeter;
                var unpressed = this;
                var centerMetrics = metrics.withPerimeter(perimeter.withLevel(perimeter.level +
                    4));
                var leftMetrics = metrics.withPerimeter(perimeter.withLevel(perimeter.level +
                    8));
                var centerPresenter = new NoResultPresenter(presenter);
                var rightPresenter = new NoResultPresenter(presenter);
                var leftPresenter = new NoResultPresenter(presenter);

                var slideRange = perimeter.right;
                var centerAdded : Removable, rightAdded : Removable, leftAdded : Removable;

                function setCenter(glyff : Glyff<Void>) {
                    if (centerAdded) {
                        centerAdded.remove();
                    }
                    centerAdded =
                        presenter.addPresentation(glyff.present(centerMetrics, audience,
                            centerPresenter));
                }

                var centerSlide : number;

                function setCenterSlide(newSlide : number) {
                    if (newSlide !== centerSlide) {
                        centerSlide = newSlide;
                        setCenter(newSlide === 0 ? unpressed : unpressed.move(newSlide));
                    }
                }

                function showRight(show : boolean) {
                    if (show && !rightAdded && next) {
                        rightAdded = presenter.addPresentation(next.present(metrics, audience,
                            rightPresenter));
                    } else if (!show && rightAdded) {
                        rightAdded.remove();
                        rightAdded = null;
                    }
                }

                var leftSlide : number;

                function setLeftSlide(newSlide : number) {
                    if (newSlide <= -slideRange) {
                        newSlide = -slideRange;
                    }
                    if (newSlide >= 0) {
                        newSlide = 0;
                    }
                    if (newSlide !== leftSlide) {
                        leftSlide = newSlide;
                        setLeft((newSlide <= -slideRange || !prev) ? null : prev.move(newSlide));
                    }
                }

                function setLeft(glyff : Glyff<Void>) {
                    if (leftAdded) {
                        leftAdded.remove();
                    }
                    if (glyff) {
                        leftAdded = presenter.addPresentation(glyff.present(leftMetrics, audience,
                            leftPresenter));
                    }
                }

                var triggerAge = (metrics.tapHeight * 1.5) / slideRange;
                var age = 0.0;

                function setAge(newAge : number) {
                    setCenterSlide(newAge <= 0 ? 0 : (newAge * -slideRange));
                    showRight(newAge > 0);
                    setLeftSlide(newAge >= 0 ? -slideRange : (newAge + 1) * -slideRange);
                    age = newAge;
                    console.log("Age:%f", age);
                }

                var stopAnimation;

                function animateAge(newAge : number, onEnd : ()=>void) {
                    if (stopAnimation) {
                        stopAnimation();
                    }
                    var startAge = age;
                    var ageRange = newAge - startAge;
                    var startTime = Date.now();
                    var duration = 100;

                    var frame;

                    stopAnimation = ()=> {
                        if (frame) {
                            window.cancelAnimationFrame(frame);
                            frame = 0;
                        }
                        stopAnimation = null;
                    };

                    function animate() {
                        if (age == newAge) {
                            stopAnimation = null;
                            setTimeout(()=> {
                                if (onEnd) {
                                    onEnd();
                                }
                            }, 1);
                            return;
                        }
                        frame = window.requestAnimationFrame(()=> {
                            frame = 0;
                            var elapsed = (Date.now() - startTime);
                            var progress = (elapsed / duration) + .001; // Bias ensures we get there
                            setAge(elapsed >= duration ? newAge : startAge + ageRange * progress);
                            animate();
                        });
                    }

                    // Animate only after initializing stopAnimation so that animate can set
                    // it to null if needed.
                    animate();
                }

                setAge(0);
                var zone = audience.addZone(perimeter, {
                    init(startSpot : Spot) : Gesturing {
                        if (stopAnimation) {
                            return null;
                        }

                        var sliding = false;
                        var moveFrame;
                        var targetAge = age;
                        return {
                            move(spot : Spot, onAbort : ()=>void) {
                                if (!sliding) {
                                    var gridDelta = spot.gridDistance(startSpot);
                                    if (gridDelta < metrics.tapHeight * .75) {
                                        return;
                                    }
                                    sliding = true;
                                }
                                var xDelta = spot.xDistance(startSpot);
                                targetAge = -xDelta / slideRange * 1.2;
                                if (moveFrame) {
                                    return;
                                }
                                moveFrame = setTimeout(()=> {
                                    if (!moveFrame) {
                                        return;
                                    }
                                    moveFrame = 0;
                                    setAge(targetAge);
                                }, 3);
                            },
                            release() {
                                if (sliding) {
                                    moveFrame = 0;
                                    if (Math.abs(targetAge) < triggerAge) {
                                        animateAge(0, null);
                                    } else if (targetAge > 0) {
                                        animateAge(1, ()=> {
                                            presenter.onResult("next");
                                        });
                                    } else {
                                        animateAge(-1, ()=> {
                                            presenter.onResult("back");
                                        });
                                    }
                                } else {
                                    setCenter(pressed);
                                    setTimeout(()=> {
                                        setCenter(unpressed);
                                        setTimeout(()=> {
                                            presenter.onResult("drill");
                                        }, 100);
                                    }, 100);
                                }
                            },
                            cancel() {
                                if (sliding) {
                                    moveFrame = 0;
                                    setAge(0);
                                }
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

        private animateWithPath(path : AnimationPath) {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<Void>)=> {
                path.start(Date.now());

                var presentation;
                var frame;
                var present = ()=> {
                    var now = Date.now();
                    var perimeter = metrics.perimeter.withAge(path.getAge(now));
                    presentation = this.present(metrics.withPerimeter(perimeter),
                        audience, presenter);
                    if (path.hasMore(now)) {
                        frame = requestAnimationFrame(()=> {
                            presentation.end();
                            present();
                        })
                    }
                };
                present();
                presenter.addPresentation({
                    end: ()=> {
                        if (frame) {
                            cancelAnimationFrame(frame);
                        }
                        presentation.end();
                    }
                })
            });
        }

        animate(duration : number) : Glyff<T> {
            return this.animateWithPath(new LinearAnimationPath(duration, true));
        }

        pulseAnimate(duration : number, count : number) : Glyff<T> {
            return this.animateWithPath(new CycleAnimationPath(duration, count));
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

        static colorAnimation(first : Color, last : Color) : Glyff<Void> {
            return Glyff.create((metrics : Metrics, audience : Audience,
                                 presenter : Presenter<Void>)=> {
                var colorGlyff = Glyff.color(first.mix(metrics.perimeter.age, last));
                presenter.addPresentation(colorGlyff.present(metrics, audience, presenter));
            });
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