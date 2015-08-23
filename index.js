/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "./glyffin", "./glyffin-gl", "./glyffin-ascii", "./glyffin-touch"], function (require, exports, Glyffin, GlyffinGl, GlyffinText, GlyffinTouch) {
    var Glyff = Glyffin.Glyff;
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var glAudience = new GlyffinGl.GlAudience(room);
    var perimeter = room.perimeter;
    var headline = "Bidding for the 2026 World Cup is suspended by FIFA as Valcke denies wrongdoing";
    var headline2 = "Google didn’t lead the self-driving vehicle revolution. John Deere did";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 \"'(),.;:[]";
    var fingerPixels = perimeter.tapHeight;
    var readPixels = perimeter.readHeight;
    var demo = Glyffin.RedGlyff.splitHeightYield(100, Glyffin.BlueGlyff.splitHeightYield(readPixels * 8, GlyffinText.asciiMultiLine(3, alphabet)).pad(10, 10)).splitHeightYield(readPixels * 5, Glyffin.BlueGlyff.splitHeightYield(readPixels * 3, GlyffinText.asciiMultiLine(2, headline)).pad(readPixels, readPixels)).splitHeightYield(readPixels * 7, Glyffin.BlueGlyff.splitHeightYield(readPixels * 5, GlyffinText.asciiMultiLine(3, headline2)).pad(readPixels, readPixels)).splitHeightRetain(fingerPixels, GlyffinTouch.button());
    var page = Glyffin.BeigeGlyff.splitHeightRetain(fingerPixels, GlyffinTouch.button());
    var app = Glyff.create(function (presenter) {
        var perimeter = presenter.perimeter;
        var audience = presenter.audience;
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
    }, Math.max(page.depth, demo.depth));
    app.present(perimeter, glAudience);
});
//# sourceMappingURL=index.js.map