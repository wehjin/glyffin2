/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin-basic.ts" />

module Glyffin {

    export interface Audience {
        addPatch(bounds : Perimeter, color : Color):Patch;
        addZone(bounds : Perimeter, touchProvider : Gesturable):Zone;
        present<U>(glyff : Glyff<U>, reactionOrOnResult ? : Reaction<U>|OnResult<U>,
                   onError? : OnError) : Presentation;
    }

    export interface Presenter<T> extends Reaction<T>, Presentation {
        perimeter:Perimeter;
        audience:Audience;
        addPresentation(presentation : Presentation):Removable;
    }

    export interface OnPresent<T> {
        (presenter : Presenter<T>);
    }

    export interface Lifter<T, U> {
        (lowerPresenter : Presenter<T>):Presenter<U>;
    }

    export class Insertion<T> {

        constructor(public amount : number, public glyff : Glyff<T>) {
        }
    }

    export interface Mogrifier<T,U> {
        getPerimeter(presenter : Presenter<U>): Perimeter;
        getUpperAudience(presenter : Presenter<U>): Audience;
        getUpperReaction(presenter : Presenter<U>): Reaction<T>;
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

        isDrained() : boolean {
            return this.isEnded;
        }

        isPowered() : boolean {
            return !this.isEnded;
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

        move(spot : Glyffin.Spot) : GestureStatus {
            if (this.isEnded) {
                return GestureStatus.DRAINED;
            }
            if (spot.gridDistance(this.startSpot) > this.threshold) {
                this.doEnd();
                return GestureStatus.DRAINED;
            }
            return GestureStatus.CHARGED;
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

    class BasePresenter<T> implements Presenter<T> {
        perimeter : Glyffin.Perimeter;
        audience : Glyffin.Audience;
        private reactionOrOnResult : Reaction<T>|OnResult<T>;
        private _onError : ErrorCallback;
        private presented : Presentation[] = [];
        private ended : boolean = false;

        constructor(perimeter : Glyffin.Perimeter, audience : Glyffin.Audience,
                    reactionOrOnResult ? : Reaction<T>|OnResult<T>, onError? : ErrorCallback) {
            this.perimeter = perimeter;
            this.audience = audience;
            this.reactionOrOnResult = reactionOrOnResult;
            this._onError = onError;
        }

        addPresentation(presentation : Glyffin.Presentation) : Glyffin.Removable {
            if (this.ended) {
                throw "addPresentation called after end";
            }
            var index = this.presented.length;
            this.presented.push(presentation);
            return {
                remove() {
                    var presentation = this.presented[index];
                    if (presentation) {
                        this.presented[index] = null;
                        presentation.end();
                    }
                }
            }
        }

        onResult(result : T) {
            if (typeof this.reactionOrOnResult === 'object') {
                (<Reaction<T>>this.reactionOrOnResult).onResult(result);
            } else if (typeof this.reactionOrOnResult === 'function') {
                (<OnResult<T>>this.reactionOrOnResult)(result);
            }
        }

        onError(error : Error) {
            if (typeof this.reactionOrOnResult === 'object') {
                (<Reaction<T>>this.reactionOrOnResult).onError(error);
            } else if (this.onError) {
                this.onError(error);
            }
        }

        end() {
            this.ended = true;
            for (var i = 0; i < this.presented.length; i++) {
                var presentation = this.presented[i];
                if (presentation) {
                    this.presented[i] = null;
                    presentation.end();
                }
            }
        }
    }

    export class Glyff<T> {
        constructor(private onPresent : OnPresent<T>) {
        }

        static create<U>(onPresent : OnPresent<U>) : Glyff<U> {
            return new Glyff<U>(onPresent);
        }

        present(perimeter : Perimeter, audience : Audience,
                reactionOrOnResult ? : Reaction<T>|OnResult<T>,
                onError? : ErrorCallback) : Presentation {
            var presenter : Presenter<T> = new BasePresenter<T>(perimeter, audience,
                reactionOrOnResult, onError);
            this.onPresent(presenter);
            return presenter;
        }

        lift<U>(lifter : Lifter<U,T>) : Glyff<U> {
            return Glyff.create<U>((presenter : Presenter<U>)=> {
                var lifted = lifter(presenter);
                presenter.addPresentation(this.present(lifted.perimeter, lifted.audience, lifted));
            });
        }

        rebuild<U>(builder : (previous : Glyff<T>)=>Glyff<U>) : Glyff<U> {
            var rebuilt = builder(this);
            return Glyff.create<U>((presenter : Presenter<U>)=> {
                presenter.addPresentation(rebuilt.present(presenter.perimeter, presenter.audience,
                    presenter));
            });
        }

        compose<U>(mogrifier : Mogrifier<T,U>) : Glyff<U> {
            var upperGlyff = this;
            return Glyff.create<U>((presenter : Presenter<U>)=> {
                var perimeter = mogrifier.getPerimeter(presenter);
                var audience = mogrifier.getUpperAudience(presenter);
                var reaction = mogrifier.getUpperReaction(presenter);
                presenter.addPresentation(upperGlyff.present(perimeter, audience, reaction));
            });
        }

        disappear(disappeared : boolean) : Glyff<T> {
            return Glyff.create<T>((presenter : Presenter<Void>)=> {
                var audience = disappeared ? {
                    addPatch(bounds : Perimeter, color : Color) : Patch {
                        return EMPTY_REMOVABLE;
                    },
                    addZone(bounds : Perimeter, touchProvider : Gesturable) : Zone {
                        return presenter.audience.addZone(bounds, touchProvider);
                    },
                    present: <U>(glyff : Glyff<U>, reactionOrOnResult ? : Reaction<U>|OnResult<U>,
                                 onError? : OnError) : Presentation => {
                        return presenter.audience.present(glyff, reactionOrOnResult, onError);
                    }
                } : presenter.audience;
                presenter.addPresentation(this.present(presenter.perimeter, audience, presenter));
            });
        }

        isolate(isolated : boolean) : Glyff<T> {
            return Glyff.create<T>((presenter : Presenter<Void>)=> {
                var audience = isolated ? {
                    addPatch(bounds : Perimeter, color : Color) : Patch {
                        return presenter.audience.addPatch(bounds, color);
                    },
                    addZone(bounds : Perimeter, touchProvider : Gesturable) : Zone {
                        return EMPTY_REMOVABLE;
                    },
                    present: <U>(glyff : Glyff<U>, reactionOrOnResult ? : Reaction<U>|OnResult<U>,
                                 onError? : OnError) : Presentation => {
                        return presenter.audience.present(glyff, reactionOrOnResult, onError);
                    }
                } : presenter.audience;
                presenter.addPresentation(this.present(presenter.perimeter, audience, presenter));
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
            return Glyff.create((presenter : Presenter<T>)=> {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitWidth(size);
                presenter.addPresentation(glyff.present(split[0], audience, presenter));
                presenter.addPresentation(this.present(split[1], audience, presenter));
            });
        }

        splitHeight<U>(size : number, topGlyff : Glyff<U>) : Glyff<T|U> {
            return Glyff.create((presenter : Presenter<T|U>) => {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(split[0], audience, presenter));
                presenter.addPresentation(this.present(split[1], audience, presenter));
            });
        }

        splitHeightYield<U>(size : number, topGlyff : Glyff<U>) : Glyff<U> {
            return Glyff.create((presenter : Presenter<U>) => {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(topGlyff.present(split[0], audience, presenter));
                presenter.addPresentation(this.present(split[1], audience,
                    new NoResultReaction(presenter)));
            });
        }

        splitHeightRetain<U>(size : number, addGlyff : Glyff<U>) : Glyff<T> {
            return Glyff.create((presenter : Presenter<T>) => {
                var audience = presenter.audience;
                var split = presenter.perimeter.splitHeight(size);
                presenter.addPresentation(addGlyff.present(split[0], audience,
                    new NoResultReaction(presenter)));
                presenter.addPresentation(this.present(split[1], audience, presenter));
            });
        }

        addNearMajor<U>(level : number, nearGlyff : Glyff<U>) : Glyff<U> {
            return Glyff.create((presenter : Presenter<U>) => {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                presenter.addPresentation(this.present(perimeter, audience,
                    new NoResultReaction(presenter)));
                // TODO: Think through relative versus absolute level.
                var nearPerimeter = perimeter.withLevel(perimeter.level + level);
                presenter.addPresentation(nearGlyff.present(nearPerimeter, audience, presenter));
            });
        }


        revealDown<U>(inset : Inset1, revelation : Glyff<U>) : Glyff<T|U> {
            return Glyff.create<T|U>((presenter : Presenter<T|U>) => {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var perimeterHeight = perimeter.getHeight();
                var maxRevelationHeight = inset.getPixels(perimeterHeight);
                var revelationPerimeter = perimeter.resizeFromTop(maxRevelationHeight);

                var revelationHeight;
                var unpresent : ()=>void = null;
                var cover = this;

                var levels = 5;

                function setRevelationHeight(height : number) {
                    revelationHeight = Math.max(0, Math.min(height, maxRevelationHeight));

                    // TODO levels should depend on the maximum level of the revelation glyff.
                    var coverPerimeter = perimeter.downFromTop(revelationHeight,
                        perimeterHeight).addLevel(levels);

                    if (unpresent) {
                        unpresent();
                    }
                    var coverRemovable = presenter.addPresentation(cover
                        .present(coverPerimeter, audience, presenter));
                    var revelationRemovable = presenter.addPresentation(revelation
                        .isolate(revelationHeight < maxRevelationHeight)
                        .disappear(revelationHeight <= 0)
                        .present(revelationPerimeter, audience, presenter));
                    unpresent = ()=> {
                        coverRemovable.remove();
                        revelationRemovable.remove();
                    }
                }

                var anchorHeight;
                var zone : Removable;
                var zonePerimeter = perimeter.addLevel(levels);

                function setAnchorHeight(height : number) {
                    if (zone) {
                        zone.remove();
                    }
                    setRevelationHeight(height);
                    anchorHeight = height;
                    zone = audience.addZone(zonePerimeter, {
                        init: (spot : Spot) : Gesturing => {
                            return new VerticalGesturing(spot,
                                perimeter.tapHeight / 2 * (anchorHeight <= 0 ? 1 : -1),
                                (moved)=> {
                                    setRevelationHeight(anchorHeight + moved);
                                }, ()=> {
                                    setRevelationHeight(anchorHeight);
                                }, ()=> {
                                    var target = anchorHeight <= 0 ? maxRevelationHeight : 0;
                                    var distanceFromTarget = Math.abs(revelationHeight - target);
                                    if (distanceFromTarget < maxRevelationHeight / 2) {
                                        setAnchorHeight(target);
                                    } else {
                                        setRevelationHeight(anchorHeight);
                                    }
                                })
                        }
                    });
                }

                setAnchorHeight(0);
                presenter.addPresentation({
                    end: ()=> {
                        if (zone) {
                            zone.remove();
                        }
                    }
                });
            });
        }

        limitWidth(maxWidth : number, align : number) : Glyff<T> {
            return Glyff.create((presenter : Presenter<T>) => {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var width = perimeter.getWidth();
                if (width <= maxWidth) {
                    presenter.addPresentation(this.present(perimeter, audience, presenter));
                } else {
                    var narrowPerimeter : Perimeter = perimeter.limitWidth(maxWidth, align);
                    presenter.addPresentation(this.present(narrowPerimeter, audience, presenter));
                }
            });
        }

        limitHeight(maxHeight : number, align : number) : Glyff<T> {
            return Glyff.create((presenter : Presenter<T>) => {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var height = perimeter.getHeight();
                if (height <= maxHeight) {
                    presenter.addPresentation(this.present(perimeter, audience, presenter));
                } else {
                    var shortPerimeter : Perimeter = perimeter.limitHeight(maxHeight, align);
                    presenter.addPresentation(this.present(shortPerimeter, audience, presenter));
                }
            });
        }

        kaleid(columns : number, rows : number, spots : number[][]) : Glyff<Void> {
            var upperGlyff = this;
            return Glyff.create((presenter : Presenter<Void>)=> {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var rowHeight = perimeter.getHeight() / rows;
                var colWidth = perimeter.getWidth() / columns;
                for (var i = 0, count = spots.length; i < count; i++) {
                    var spot = spots[i];
                    var left = perimeter.left + colWidth * spot[0];
                    var top = perimeter.top + rowHeight * spot[1];
                    var spotPerimeter = perimeter.at(left, top, left + colWidth, top + rowHeight);
                    new Perimeter(left, top, left + colWidth, top + rowHeight,
                        perimeter.age, perimeter.level, perimeter.tapHeight, perimeter.readHeight,
                        perimeter.palette);
                    presenter.addPresentation(upperGlyff.present(spotPerimeter, audience,
                        presenter));
                }
            });
        }

        pad(xPixels : number, yPixels : number) : Glyff<T> {
            return this.compose({
                getPerimeter(presenter : Presenter<T>) : Perimeter {
                    return presenter.perimeter.inset(xPixels, yPixels);
                },
                getUpperAudience(presenter : Presenter<T>) : Audience {
                    return presenter.audience;
                },
                getUpperReaction(presenter : Presenter<T>) : Reaction<T> {
                    return presenter;
                }
            });
        }

        pad2(inset : Inset2) : Glyff<T> {
            return this.lift((lowerPresenter : Presenter<T>) : Presenter<T>=> {
                var perimeter = lowerPresenter.perimeter;
                var insetPerimeter = perimeter.inset2(inset);
                return {
                    perimeter: insetPerimeter,
                    audience: lowerPresenter.audience,
                    addPresentation(presentation : Presentation) : Removable {
                        return lowerPresenter.addPresentation(presentation);
                    },
                    onResult(result : T) {
                        lowerPresenter.onResult(result);
                    },
                    onError(err : Error) {
                        lowerPresenter.onError(err);
                    },
                    end() {
                        lowerPresenter.end();
                    }
                };
            });
        }

        move(x : number) : Glyff<T> {
            return Glyff.create<T>((presenter : Presenter<Void>)=> {
                var audience = presenter.audience;
                var perimeter = presenter.perimeter.translate(x);
                presenter.addPresentation(this.present(perimeter, audience, presenter));
            });
        }

        clicken<U>(symbol : string, pressed? : Glyff<U>) : Glyff<string> {
            return Glyff.create<string>((presenter : Presenter<Void>)=> {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var unpressed = this;
                var unpressedPerimeter = perimeter.withLevel(perimeter.level + 4);
                var removable = presenter.addPresentation(unpressed.present(unpressedPerimeter,
                    audience));
                var zone = audience.addZone(perimeter,
                    new ClickGesturable(perimeter.tapHeight / 2, ()=> {
                        if (!pressed) {
                            return;
                        }
                        removable.remove();
                        removable = presenter.addPresentation(pressed.present(perimeter, audience));
                    }, ()=> {
                        if (!pressed) {
                            return;
                        }
                        removable.remove();
                        removable = presenter.addPresentation(unpressed.present(unpressedPerimeter,
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

        pagen<U>(index : number, next : Glyff<U>, prev : Glyff<U>) : Glyff<string|T> {
            return Glyff.create<string|T>((presenter : Presenter<string|T>)=> {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var current = this;
                // TODO Determine levels dynamically.
                var centerPerimeter = perimeter.withLevel(perimeter.level + 4);
                var leftPerimeter = perimeter.withLevel(perimeter.level + 12);
                var noResultReaction = new NoResultReaction(presenter);

                var slideRange = perimeter.right;
                var centerAdded : Removable, rightAdded : Removable, leftAdded : Removable;

                function setCenter(glyff : Glyff<string|T>) {
                    if (centerAdded) {
                        centerAdded.remove();
                    }
                    centerAdded =
                        presenter.addPresentation(glyff.present(centerPerimeter, audience,
                            presenter));
                }

                var centerSlide : number;

                function setCenterSlide(newSlide : number) {
                    if (newSlide !== centerSlide) {
                        centerSlide = newSlide;
                        setCenter(newSlide === 0 ? current : current.move(newSlide));
                    }
                }

                function showRight(show : boolean) {
                    if (show && !rightAdded && next) {
                        rightAdded = presenter.addPresentation(next.present(perimeter, audience,
                            noResultReaction));
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
                        leftAdded = presenter.addPresentation(glyff.present(leftPerimeter, audience,
                            noResultReaction));
                    }
                }

                var triggerAge = (perimeter.tapHeight * 1.5) / slideRange;
                var age = 0.0;

                function setAge(newAge : number) {
                    setCenterSlide(newAge <= 0 ? 0 : (newAge * -slideRange));
                    showRight(newAge > 0);
                    setLeftSlide(newAge >= 0 ? -slideRange : (newAge + 1) * -slideRange);
                    age = newAge;
                }

                var stopAnimation;

                function animateAge(newAge : number, ageVelocity : number, onEnd : ()=>void) {
                    if (stopAnimation) {
                        stopAnimation();
                    }
                    var startAge = age;
                    var ageRange = newAge - startAge;
                    var startTime = Date.now();

                    var duration = 200;
                    if (ageVelocity * ageRange > 0) {
                        // Velocity and range are in same direction and both non-zero.
                        // Continue to see if we should shorten the duration.
                        var minVelocity = ageRange / duration;
                        if (ageVelocity / minVelocity > 1) {
                            // Moving faster than minimum.  Get new duration.
                            duration = ageRange / ageVelocity;
                        }
                    }

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

                        var moveFrame;
                        var targetAge = age;
                        return new PagenGesturing(startSpot, perimeter.tapHeight * .75,
                            (pixelsMoved : number)=> {
                                targetAge = -pixelsMoved / slideRange * 1.2;
                                if ((targetAge < 0 && !prev) || (targetAge > 0 && !next)) {
                                    targetAge = 0;
                                }
                                if (!moveFrame) {
                                    moveFrame = setTimeout(()=> {
                                        if (!moveFrame) {
                                            return;
                                        }
                                        moveFrame = 0;
                                        setAge(targetAge);
                                    }, 3);
                                }
                            }, ()=> {
                                moveFrame = 0;
                                setAge(0);
                            }, (velocity : number)=> {
                                moveFrame = 0;
                                var ageVelocity = -velocity / slideRange;
                                if (Math.abs(targetAge) < triggerAge) {
                                    animateAge(0, ageVelocity, null);
                                } else if (targetAge > 0) {
                                    animateAge(1, ageVelocity, ()=> {
                                        presenter.onResult("next");
                                    });
                                } else {
                                    animateAge(-1, ageVelocity, ()=> {
                                        presenter.onResult("back");
                                    });
                                }
                            });
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
            return Glyff.create((presenter : Presenter<Void>)=> {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                path.start(Date.now());

                var presentation;
                var frame;
                var present = ()=> {
                    var now = Date.now();
                    var agedPerimeter = perimeter.withAge(path.getAge(now));
                    presentation = this.present(agedPerimeter, audience, presenter);
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
            return Glyff.create<Void>((presenter : Presenter<Void>)=> {
                    var audience = presenter.audience;
                    var patch = audience.addPatch(presenter.perimeter, color);
                    presenter.addPresentation({
                        end() {
                            patch.remove();
                        }
                    });
                }
            );
        }

        static colorAnimation(first : Color, last : Color) : Glyff<Void> {
            return Glyff.create((presenter : Presenter<Void>)=> {
                var perimeter = presenter.perimeter;
                var audience = presenter.audience;
                var colorGlyff = Glyff.color(first.mix(perimeter.age, last));
                presenter.addPresentation(colorGlyff.present(perimeter, audience, presenter));
            });
        }
    }

    export interface Hall {
        present<U>(glyff : Glyff<U>, onResult? : OnResult<U>, onError? : OnError): Presentation;
    }

    export var ClearGlyff = Glyff.create<Void>(()=> {
    });

    export function colorPath(colorPath : number[], mix? : number,
                              colorPath2? : number[]) : Glyff<Void> {
        return Glyff.create((presenter : Presenter<Void>)=> {
            var perimeter = presenter.perimeter;
            var audience = presenter.audience;
            var color = perimeter.palette.get(colorPath);
            if (mix) {
                color = color.mix(mix, perimeter.palette.get(colorPath2));
            }
            var colorGlyff = Glyff.color(color);
            presenter.addPresentation(colorGlyff.present(perimeter, audience, null, null));
        });
    }

    export var RedGlyff = Glyff.color(Color.RED);
    export var GreenGlyff = Glyff.color(Color.GREEN);
    export var BlueGlyff = Glyff.color(Color.BLUE);
    export var BeigeGlyff = Glyff.color(Color.BEIGE);
    export var WhiteGlyff = Glyff.color(Color.WHITE);
    export var BlackGlyff = Glyff.color(Color.BLACK);
}