/**
 * Created by wehjin on 5/24/15.
 */

class RelBounds {
    left : number;
    right : number;
    top : number;
    bottom : number;
}

interface Rel {
    remove();
}

interface Audience {
    addRel(bounds : RelBounds):Rel;
}

class GlAudience implements Audience {

    addRel(bounds : RelBounds) : Rel {
        return null;
    }
}

interface Producer<T> {
    onResult():T;
}

interface Curtain {
    close();
}
interface Director {
    addCurtain(curtain : Curtain);
}

interface OnShow {
    onShow(director : Director);
}


class Show<T> {
    static create<U>(onShow : OnShow) : Show<U> {
        return new Show<U>(onShow);
    }

    constructor(private onShow : OnShow) {
    }

    show(audience : Audience, producer : Producer<T>) : Curtain {
        var curtains : Curtain[] = [];
        this.onShow.onShow({
            addCurtain(curtain : Curtain) {
                curtains.push(curtain);
            }
        });
        return {
            close() {
                while (curtains.length > 0) {
                    curtains.pop().close();
                }
            }
        }
    }
}