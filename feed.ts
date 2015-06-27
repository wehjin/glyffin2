/**
 * Created by wehjin on 5/24/15.
 */

/// <reference path="webglbook.d.ts" />
/// <reference path="glyffin.ts" />
/// <reference path="glyffin-ascii.ts" />
/// <reference path="glyffin-gl.ts" />
/// <reference path="glyffin-touch.ts" />
/// <reference path="rx.ts" />

import Void = Glyffin.Void;
import Glyff = Glyffin.Glyff;

function main() {

    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
        window.scroll(0, 0);
        return false;
    }, false);

    var glAudience = new Glyffin.GlAudience();

    var background = [0xbb, 0xbb, 0xbb, 0xff];
    var midground = [0x55, 0x055, 0x55, 0xff];
    var palette = new Glyffin.Palette().withLevel(0, [background, midground]);
    var backgroundColorPath = [0, 0];
    var midgroundColorPath = [0, 1];

    var screenWidth = glAudience.canvas.width;
    var perimeter = new Glyffin.RectangleBounds(0, 0, screenWidth, glAudience.canvas.height);
    var metrics = new Glyffin.Metrics(perimeter, 48, 13, palette);

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
            var title = item['title'];
            var link = item['link'];

            function addTitle<T>(background : Glyffin.Glyff<T>) : Glyffin.Glyff<T> {
                return background.addNearMajor(1,
                    Glyffin.asciiMultiLine(2, title)
                        .minorTop(-textSize, Glyffin.ClearGlyff)
                        .minorTop(-textSize, Glyffin.asciiEntireWord(link))
                        .pad(readSize * 2, readSize * 2)
                        .limitHeight(readSize * 4 + textSize * 5, .4)
                );
            }

            var unpressedCell = Glyffin.colorPath(midgroundColorPath).rebuild(addTitle);
            var pressedCell = Glyffin.colorPath(midgroundColorPath, .5, backgroundColorPath)
                .rebuild(addTitle);
            var cell = unpressedCell
                .clicken("go", pressedCell);

            function button(label : string, symbol : string) : Glyff<string> {
                function addLabel(label : string) : (glyff : Glyff<Void>)=>Glyff<Void> {
                    return function (background : Glyffin.Glyff<Void>) : Glyff<Void> {
                        var buttonText = Glyffin.asciiMultiLine(1, label)
                            .pad(readSize, 0)
                            .limitHeight(readSize * 1.75, .5);
                        return background.addNearMajor(1, buttonText);
                    }
                }

                var buttonBackgroundUnpressed = Glyffin.colorPath(midgroundColorPath, .3,
                    backgroundColorPath);
                var buttonBackgroundPressed = Glyffin.colorPath(midgroundColorPath, .6,
                    backgroundColorPath);
                var addButtonLabel = addLabel(label);
                var buttonUnpressed = buttonBackgroundUnpressed.rebuild(addButtonLabel);
                var buttonPressed = buttonBackgroundPressed.rebuild(addButtonLabel);
                return buttonUnpressed.clicken(symbol, buttonPressed);
            }

            var nextButton = button("Next", "next");
            var prevButton = button("Back", "back");
            var actionBar = nextButton
                .addLeft(readSize / 2, Glyffin.ClearGlyff)
                .addLeft(screenWidth * .3, prevButton)
                .pad(readSize, tapHeight / 2)
                .limitHeight(2 * tapHeight, 0);

            var app = Glyffin.colorPath(backgroundColorPath)
                .addNearMajor(1, cell.combineTop(-tapHeight * 3, actionBar));

            var spinnerSize = tapHeight * 3;
            var spinner = Glyffin.BlueGlyff
                .limitHeight(spinnerSize, .5).limitWidth(spinnerSize, .5);
            var transition = app.addNearMajor(1, spinner);

            presentation = app.present(metrics, glAudience, (symbol)=> {
                console.log("%s", symbol);
                if (symbol === "go") {
                    var link = item['link'];
                    sessionStorage.setItem("visitedLink", link);
                    presentation.end();
                    presentation = transition.present(metrics, glAudience);
                    setTimeout(()=> {
                        window.open(link, "_self");
                    }, 300);
                } else if (symbol === "next") {
                    index++;
                    refresh();
                } else if (symbol === "back") {
                    index = index == 0 ? (items.length - 1) : (index - 1);
                    refresh();
                }
            });
        }

        refresh();
    });
}

