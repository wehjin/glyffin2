/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
function main() {
    var glAudience = new Glyffin.GlAudience();
    var R_spots = [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var A_spots = [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [0, 4],
        [4, 4],
        [0, 5],
        [4, 5],
        [0, 6],
        [4, 6]
    ];
    var J_spots = [
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
        [0, 5],
        [4, 5],
        [1, 6],
        [2, 6],
        [3, 6]
    ];
    Glyffin.RedGlyff.kaleido(5, 7, J_spots).inset(55).present(glAudience);
}
//# sourceMappingURL=index.js.map