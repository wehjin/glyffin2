/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
/// <reference path="glyffin-touch.ts" />
/// <reference path="rx.ts" />

function main() {
    var glAudience = new Glyffin.GlAudience();

    var background = [0xbb, 0xbb, 0xbb, 0xff];
    var midground = [0x55, 0x055, 0x55, 0xff];
    var palette = new Glyffin.Palette().withLevel(0, [background, midground]);
    var backgroundColorPath = [0, 0];
    var midgroundColorPath = [0, 1];

    var perimeter = new Glyffin.RectangleBounds(0, 0, glAudience.canvas.width,
        glAudience.canvas.height);
    var metrics = new Glyffin.Metrics(perimeter, 48, 10, palette);

    var hNewsUri = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22https%3A%2F%2Fnews.ycombinator.com%2Frss%22&format=json&diagnostics=true&callback=";
    var yNewsUri = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D%22http%3A%2F%2Frss.news.yahoo.com%2Frss%2Ftopstories%22&format=json&callback=";
    Rx.httpGet(hNewsUri).subscribe((response : Rx.HttpResponse)=> {
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

        function refresh() {
            if (presentation) {
                presentation.end();
            }

            var tapHeight = metrics.tapHeight;
            var readSize = metrics.readHeight;
            var textSize = readSize * 1.2;

            var item = items[index % items.length];
            var title = item['title'] + " - " + item['link'];

            function addTitle<T>(background : Glyffin.Glyff<T>) : Glyffin.Glyff<T> {
                return background.addNearMajor(1,
                    Glyffin.asciiMultiLine(2, title)
                        .pad(readSize * 2, readSize)
                        .limitHeight(readSize * 2 + textSize * 3, .6)
                );
            }

            var unpressedCell = addTitle(Glyffin.colorPath(midgroundColorPath));
            var pressedCell = addTitle(Glyffin.colorPath(midgroundColorPath, .5,
                backgroundColorPath));
            var cell = unpressedCell
                .clicken("go", pressedCell);

            var buttonText = Glyffin.asciiMultiLine(1, "Next").pad(readSize, readSize);
            var buttonNormal = Glyffin.colorPath(midgroundColorPath, .3,
                backgroundColorPath).addNearMajor(1, buttonText);
            var buttonPressed = Glyffin.colorPath(midgroundColorPath, .6,
                backgroundColorPath).addNearMajor(1, buttonText);
            var nextButton = buttonNormal.clicken("next", buttonPressed).pad(readSize / 2,
                readSize / 2);

            var app = Glyffin.colorPath(backgroundColorPath)
                .addNearMajor(1, cell.combineTop(-tapHeight, nextButton));
            presentation = app.present(metrics, glAudience, (symbol)=> {
                console.log("%s", symbol);
                if (symbol === "go") {
                    var link = item['link'];
                    sessionStorage.setItem("visitedLink", link);
                    window.open(link, "_self");
                } else if (symbol === "next") {
                    index++;
                    refresh();
                }
            });
        }

        refresh();
    });
}

