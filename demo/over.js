/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="../webglbook.d.ts" />
/// <reference path="../glyffin.ts" />
/// <reference path="../glyffin-ascii.ts" />
/// <reference path="../glyffin-gl.ts" />
/// <reference path="../glyffin-touch.ts" />
var Insertion = Glyffin.Insertion;
var Glyff = Glyffin.Glyff;
var Void = Glyffin.Void;
function main() {
    var room = new Glyffin.GlRoom(document.getElementById('webgl'));
    var audience = new Glyffin.GlAudience(room);
    var perimeter = room.perimeter;
    var step = Glyffin.GreenGlyff.pad2(Glyffin.Inset2.EIGHTH).over(Glyffin.RedGlyff, 4);
    Glyffin.BlueGlyff.pad2(Glyffin.Inset2.QUARTER).over(step).present(perimeter, audience);
}
//# sourceMappingURL=over.js.map