/**
 * Created by wehjin on 5/24/15.
 */
var RelBounds = (function () {
    function RelBounds() {
    }
    return RelBounds;
})();
var GlAudience = (function () {
    function GlAudience() {
    }
    GlAudience.prototype.addRel = function (bounds) {
        return null;
    };
    return GlAudience;
})();
var Show = (function () {
    function Show(onShow) {
        this.onShow = onShow;
    }
    Show.create = function (onShow) {
        return new Show(onShow);
    };
    Show.prototype.show = function (audience, producer) {
        var curtains = [];
        this.onShow.onShow({
            addCurtain: function (curtain) {
                curtains.push(curtain);
            }
        });
        return {
            close: function () {
                while (curtains.length > 0) {
                    curtains.pop().close();
                }
            }
        };
    };
    return Show;
})();
//# sourceMappingURL=glyffin.js.map