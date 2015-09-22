/**
 * @author  wehjin
 * @since   9/22/15
 */

export class Void {
}

export class Inset1 {

    constructor(public fraction : number, public fixed : number) {
    }

    public getPixels(whole : number) : number {
        return this.fraction * whole + this.fixed;
    }
}

export class Inset2 {
    public x : Inset1;
    public y : Inset1;

    constructor(fractionX : number, fixedX : number, fractionY : number, fixedY : number) {
        this.x = new Inset1(fractionX, fixedX);
        this.y = new Inset1(fractionY, fixedY);
    }

    public static QUARTER : Inset2 = new Inset2(.25, 0, .25, 0);
    public static EIGHTH : Inset2 = new Inset2(.125, 0, .125, 0);
}

export class TexelRect {
    s : number;
    t : number;
    u : number;
    v : number;

    constructor(s : number, t : number, u : number, v : number) {
        this.s = s;
        this.t = t;
        this.u = u;
        this.v = v;
    }
}

export class Spot {
    constructor(public x : number, public y : number) {
    }

    gridDistance(other : Spot) : number {
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
    }

    xDistance(origin : Spot) : number {
        return this.x - origin.x;
    }

    yDistance(origin : Spot) : number {
        return this.y - origin.y;
    }

    addX(addition : number) : Spot {
        return new Spot(this.x + addition, this.y);
    }

    addY(addition : number) : Spot {
        return new Spot(this.x, this.y + addition);
    }
}

export interface Presentation {
    end();
}

export interface Removable {
    remove();
}

export interface Patch extends Removable {
}

export class PatchPresentation implements Presentation {
    patch : Patch;

    constructor(patch : Patch) {
        this.patch = patch;
    }

    end() {
        if (this.patch) {
            this.patch.remove();
            this.patch = null;
        }
    }
}
