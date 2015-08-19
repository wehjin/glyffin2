/**
 * Created by wehjin on 5/24/15.
 */
/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
/// <reference path="glyffin-touch.ts" />
var Insertion = Glyffin.Insertion;
var Glyff = Glyffin.Glyff;
var Void = Glyffin.Void;
function main() {
    var room = new Glyffin.GlRoom(document.getElementById('webgl'));
    var glAudience = new Glyffin.GlAudience(room);
    var perimeter = room.perimeter;
    var headline = "Bidding for the 2026 World Cup is suspended by FIFA as Valcke denies wrongdoing";
    var headline2 = "Google didn’t lead the self-driving vehicle revolution. John Deere did";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 \"'(),.;:[]";
    var fingerPixels = perimeter.tapHeight;
    var readPixels = perimeter.readHeight;
    var demo = Glyffin.RedGlyff.splitHeightYield(100, Glyffin.BlueGlyff.splitHeightYield(readPixels * 8, Glyffin.asciiMultiLine(3, alphabet)).pad(10, 10)).splitHeightYield(readPixels * 5, Glyffin.BlueGlyff.splitHeightYield(readPixels * 3, Glyffin.asciiMultiLine(2, headline)).pad(readPixels, readPixels)).splitHeightYield(readPixels * 7, Glyffin.BlueGlyff.splitHeightYield(readPixels * 5, Glyffin.asciiMultiLine(3, headline2)).pad(readPixels, readPixels)).splitHeightRetain(fingerPixels, Glyffin.button());
    var app = Glyff.create(function (presenter) {
        var perimeter = presenter.perimeter;
        var audience = presenter.audience;
        var page = Glyffin.BeigeGlyff.splitHeightRetain(fingerPixels, Glyffin.button());
        var presented;
        function setPresented(glyff, next) {
            if (presented) {
                presented.remove();
            }
            presented = presenter.addPresentation(glyff.present(perimeter, audience, function () {
                setPresented(next, glyff);
            }));
        }
        setPresented(page, demo);
    });
    app.present(perimeter, glAudience);
}
//# sourceMappingURL=index.js.map