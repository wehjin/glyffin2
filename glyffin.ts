/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />

module Glyffin {

    export class Void {
    }

    export class RectangleBounds {
        constructor(public left : number, public top : number, public right : number,
                    public bottom : number) {
        }

        getHeight() : number {
            return this.bottom - this.top;
        }

        getWidth() : number {
            return this.right - this.left;
        }

        inset(pixels : number) : RectangleBounds {
            return new RectangleBounds(this.left + pixels,
                this.top + pixels, this.right - pixels,
                this.bottom - pixels);
        }
    }

    export class Color {

        constructor(public red : number, public green : number, public blue : number,
                    public alpha : number) {
        }
    }

    export interface Audience {
        getPerimeter():RectangleBounds;
        getPalette():Palette;
        addRectanglePatch(bounds : RectangleBounds, color : Color):RectanglePatch;
    }

    class PerimeterAudience implements Audience {

        constructor(private perimeter : RectangleBounds, private audience : Audience) {
        }

        getPerimeter() : RectangleBounds {
            return this.perimeter;
        }

        getPalette() : Palette {
            return this.audience.getPalette();
        }

        addRectanglePatch(bounds : RectangleBounds, color : Color) : RectanglePatch {
            return this.audience.addRectanglePatch(bounds, color);
        }
    }

    export class Palette {
        public static RED = new Color(1, 0, 0, 1);
        public static GREEN = new Color(0, 1, 0, 1);
        public static BLUE = new Color(0, 0, 1, 1);
        public static BEIGE = new Color(245 / 255, 245 / 255, 220 / 255, 1);
    }

    export interface RectanglePatch {
        remove();
    }

    export var EMPTY_PATCH : RectanglePatch = {
        remove() {
        }
    };

    export interface Reaction<T> {
        onResult(result : T);
        onError(error : Error);
    }

    export interface Presentation {
        end();
    }

    export interface Presenter<T> extends Reaction<T> {
        addPresentation(presentation : Presentation);
    }

    export interface OnPresent<T> {
        call(audience : Audience, presenter : Presenter<T>);
    }

    export interface Mogrifier<T,U> {
        getUpperAudience(audience : Audience, presenter : Presenter<U>):Audience;
        getUpperReaction(audience : Audience, presenter : Presenter<U>):Reaction<T>;
    }

    export class Insertion<T> {

        constructor(public amount : number, public glyff : Glyff<T>) {
        }
    }

    export class Glyff<T> {

        constructor(private onPresent : OnPresent<T>) {
        }

        insertLefts<U>(insertions : Insertion<U>[]) : Glyff<T> {
            var current : Glyff<T> = this;
            var todo = insertions.slice();
            while (todo.length > 0) {
                var insertion : Insertion<U> = todo.pop();
                current = current.insertLeft(insertion.amount, insertion.glyff);
            }
            return current;
        }

        insertLeft(insertAmount : number, insertGlyff : Glyff<Void>) : Glyff<T> {
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

        insertTop(insertAmount : number, insertGlyff : Glyff<Void>) : Glyff<T> {
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

        kaleido(columns : number, rows : number, spots : number[][]) : Glyff<Void> {
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

        inset(pixels : number) : Glyff<T> {
            return this.compose({
                getUpperAudience(audience : Audience, presenter : Presenter<T>) : Audience {
                    var insetPerimeter = audience.getPerimeter().inset(pixels);
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
                addPresentation(presentation : Presentation) {
                    presented.push(presentation);
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