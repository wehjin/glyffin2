/**
 * @author  wehjin
 * @since   6/21/15
 */
var Rx;
(function (Rx) {
    var SubscriptionSubscriber = (function () {
        function SubscriptionSubscriber(_onNext, _onError, _onCompleted) {
            this._onNext = _onNext;
            this._onError = _onError;
            this._onCompleted = _onCompleted;
            this._isUnsubscribed = false;
            this._didEnd = false;
            this._subscriptions = [];
        }
        SubscriptionSubscriber.prototype.addSubscription = function (subscription) {
            var _this = this;
            this._subscriptions.push(subscription);
            return function () {
                var index = _this._subscriptions.indexOf(subscription);
                if (index < 0) {
                    return;
                }
                _this._subscriptions = _this._subscriptions.splice(index, 1);
            };
        };
        SubscriptionSubscriber.prototype.isUnsubscribed = function () {
            return this._isUnsubscribed;
        };
        SubscriptionSubscriber.prototype.unsubscribe = function () {
            if (this.isUnsubscribed()) {
                return;
            }
            this._isUnsubscribed = true;
            this._subscriptions.forEach(function (subscription) {
                subscription.unsubscribe();
            });
        };
        SubscriptionSubscriber.prototype.isRetired = function () {
            return this._isUnsubscribed || this._didEnd;
        };
        SubscriptionSubscriber.prototype.onNext = function (next) {
            if (this.isRetired()) {
                return;
            }
            if (this._onNext) {
                this._onNext(next);
            }
        };
        SubscriptionSubscriber.prototype.onError = function (error) {
            if (this.isRetired()) {
                return;
            }
            this._didEnd = true;
            if (this._onError) {
                this._onError(error);
            }
        };
        SubscriptionSubscriber.prototype.onCompleted = function () {
            if (this.isRetired()) {
                return;
            }
            this._didEnd = true;
            if (this._onCompleted) {
                this._onCompleted();
            }
        };
        return SubscriptionSubscriber;
    })();
    var CoreObservable = (function () {
        function CoreObservable(onSubscribe) {
            this.onSubscribe = onSubscribe;
        }
        CoreObservable.prototype.subscribe = function (onNext, onError, onCompleted) {
            var subscriber = new SubscriptionSubscriber(onNext, onError, onCompleted);
            this.onSubscribe(subscriber);
            return subscriber;
        };
        return CoreObservable;
    })();
    function create(onSubscribe) {
        return new CoreObservable(onSubscribe);
    }
    Rx.create = create;
    var HttpResponse = (function () {
        function HttpResponse(request) {
            this.json = JSON.parse(request.responseText);
        }
        return HttpResponse;
    })();
    Rx.HttpResponse = HttpResponse;
    function httpGet(url) {
        return create(function (subscriber) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        var httpResponse = new HttpResponse(this);
                        subscriber.onNext(httpResponse);
                        subscriber.onCompleted();
                    }
                    else {
                        var error = new Error();
                        error.message = this.statusText;
                        subscriber.onError(error);
                    }
                }
            };
            request.onerror = function (e) {
                var error = new Error();
                error.message = e.message;
                subscriber.onError(error);
            };
            request.open('GET', url, true);
            request.send();
        });
    }
    Rx.httpGet = httpGet;
})(Rx || (Rx = {}));
//# sourceMappingURL=rx.js.map