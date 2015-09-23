/**
 * Created by wehjin on 5/24/15.
 */
define(["require", "exports", "../glyffin", "../glyffin", "../glyffin-gl", "../glyffin-ascii", "../rx"], function (require, exports, glyffin_1, Glyffin, GlyffinGl, GlyffinText, Rx) {
    function getPreviousIndex(index, count) {
        return index == 0 ? (count - 1) : (index - 1);
    }
    var room = new GlyffinGl.GlRoom(document.getElementById('webgl'));
    var glAudience = new GlyffinGl.GlAudience(room);
    var background = [0xbb, 0xbb, 0xbb, 0xff];
    var midground = [0x55, 0x055, 0x55, 0xff];
    room.perimeter.palette = new Glyffin.Palette().withLevel(0, [background, midground]);
    var backgroundColorPath = [0, 0];
    var midgroundColorPath = [0, 1];
    var perimeter = room.perimeter;
    var hNewsUri = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22https%3A%2F%2Fnews.ycombinator.com%2Frss%22&format=json&diagnostics=true&callback=";
    var yNewsUri = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22http%3A%2F%2Frss.news.yahoo.com%2Frss%2Ftopstories%22&format=json&callback=";
    Rx.httpGet(hNewsUri).subscribe(function (response) {
        var items = response.json['query']['results']['item'];
        var index = 0;
        var presentation;
        var visitedLink = sessionStorage.getItem("visitedLink");
        if (visitedLink) {
            items.forEach(function (item, itemIndex) {
                if (item['link'] === visitedLink) {
                    index = itemIndex;
                }
            });
        }
        function getPreviousItemIndex(index) {
            return getPreviousIndex(index, items.length);
        }
        function refresh() {
            if (presentation) {
                presentation.end();
            }
            var tapHeight = perimeter.tapHeight;
            var readSize = perimeter.readHeight;
            var textSize = readSize * 1.2;
            var textBase = glyffin_1.Color.WHITE;
            function getCell(background, text, subtext) {
                function addTitle(background) {
                    return background.addNearMajor(0.5, GlyffinText.asciiMultiLine(2, text, glyffin_1.Color.BEIGE)
                        .splitHeightYield(-textSize, Glyffin.ClearGlyff)
                        .splitHeightYield(-textSize, GlyffinText.asciiEntireWord(subtext, textBase))
                        .pad(readSize * 2, readSize * 2)
                        .limitHeight(readSize * 4 + textSize * 5, .4));
                }
                return background.rebuild(addTitle);
            }
            var unpressedBackground = Glyffin.colorPath(midgroundColorPath);
            var pressedBackground = Glyffin.colorPath(midgroundColorPath, .5, backgroundColorPath);
            function getUnpressedCell(item) {
                return getCell(unpressedBackground, item['title'], item['link'])
                    .clicken("drill", getCell(pressedBackground, item['title'], item['link']));
            }
            function getRightCell(item) {
                return getCell(Glyffin.colorPath(midgroundColorPath, .1, backgroundColorPath), item['title'], item['link']);
            }
            function getLeftCell(item) {
                return getCell(Glyffin.colorPath(midgroundColorPath, -.1, backgroundColorPath), item['title'], item['link']);
            }
            var itemIndex = (index % items.length);
            var item = items[itemIndex];
            var nextItem = items[(itemIndex + 1) % items.length];
            var prevItem = items[getPreviousItemIndex(itemIndex)];
            var cell = getUnpressedCell(item).stackNearLeft(getRightCell(nextItem), getLeftCell(prevItem));
            var app = Glyffin.colorPath(backgroundColorPath)
                .addNearMajor(1, cell.splitHeightRetain(-tapHeight * 3, Glyffin.ClearGlyff));
            var spinnerSize = tapHeight * 3;
            var spinner = glyffin_1.Glyff.colorAnimation(glyffin_1.Color.BLUE, glyffin_1.Color.RED)
                .pulseAnimate(1000, 50)
                .limitHeight(spinnerSize, .5).limitWidth(spinnerSize, .5);
            // TODO: Design better spinner.
            // TODO: Disable app during transition.
            var transition = app.addNearMajor(10, spinner);
            presentation = app.present(perimeter, glAudience, function (symbol) {
                console.log("%s", symbol);
                if (symbol === "go" || symbol === "drill") {
                    var link = item['link'];
                    sessionStorage.setItem("visitedLink", link);
                    presentation.end();
                    presentation = transition.present(perimeter, glAudience);
                    setTimeout(function () {
                        window.open(link, "_self");
                    }, 300);
                }
                else if (symbol === "next") {
                    index++;
                    refresh();
                }
                else if (symbol === "back") {
                    index = getPreviousItemIndex(index);
                    refresh();
                }
            });
        }
        refresh();
    });
});
//# sourceMappingURL=feed.js.map