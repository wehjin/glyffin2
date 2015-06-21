/**
 * @author  wehjin
 * @since   6/21/15
 */

module Rx {

    export interface Subscription {
        isUnsubscribed():boolean;
        unsubscribe();
    }

    export interface Observable<T> {
        subscribe(onNext? : (next : T)=>void, onError? : (error : Error)=>void,
                  onCompleted? : ()=>void) : Subscription;
    }

    export interface Observer<T> {
        onNext(next : T);
        onError(error : Error);
        onCompleted();
    }

    export interface Subscriber<T> extends Observer<T> {
        addSubscription(subscription : Subscription) : ()=>void;
    }

    class SubscriptionSubscriber<T> implements Subscription, Subscriber<T> {

        private _isUnsubscribed : boolean = false;
        private _didEnd : boolean = false;
        private _subscriptions : Subscription[] = [];

        constructor(private _onNext : (next : T)=>void, private _onError : (error : Error)=>void,
                    private _onCompleted : ()=>void) {
        }

        addSubscription(subscription : Subscription) : ()=>void {
            this._subscriptions.push(subscription);
            return ()=> {
                var index = this._subscriptions.indexOf(subscription);
                if (index < 0) {
                    return;
                }
                this._subscriptions = this._subscriptions.splice(index, 1);
            }
        }

        isUnsubscribed() : boolean {
            return this._isUnsubscribed;
        }

        unsubscribe() {
            if (this.isUnsubscribed()) {
                return;
            }
            this._isUnsubscribed = true;
            this._subscriptions.forEach((subscription : Subscription)=> {
                subscription.unsubscribe();
            });
        }

        isRetired() : boolean {
            return this._isUnsubscribed || this._didEnd;
        }

        onNext(next : T) {
            if (this.isRetired()) {
                return;
            }
            if (this._onNext) {
                this._onNext(next);
            }
        }

        onError(error : Error) {
            if (this.isRetired()) {
                return;
            }
            this._didEnd = true;
            if (this._onError) {
                this._onError(error);
            }
        }

        onCompleted() {
            if (this.isRetired()) {
                return;
            }
            this._didEnd = true;
            if (this._onCompleted) {
                this._onCompleted();
            }
        }
    }

    class CoreObservable<T> implements Observable<T> {
        constructor(private onSubscribe : (subscriber : SubscriptionSubscriber<T>)=>void) {
        }

        subscribe(onNext? : (next : T)=>void, onError? : (error : Error)=>void,
                  onCompleted? : ()=>void) : Subscription {
            var subscriber = new SubscriptionSubscriber<T>(onNext, onError, onCompleted);
            this.onSubscribe(subscriber);
            return subscriber;
        }
    }

    export function create<T>(onSubscribe : (subscriber : Subscriber<T>)=>void) : Observable<T> {
        return new CoreObservable(onSubscribe);
    }

    export class HttpResponse {
        public json : any;

        constructor(request : XMLHttpRequest) {
            this.json = JSON.parse(request.responseText);
        }
    }

    export function httpGet(url : string) : Observable<HttpResponse> {
        return create((subscriber : Subscriber<HttpResponse>)=> {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        var httpResponse = new HttpResponse(this);
                        subscriber.onNext(httpResponse);
                        subscriber.onCompleted();
                        //document.getElementById("myDiv").innerHTML = xmlthttp.responseText;
                    } else {
                        var error = new Error();
                        error.message = this.statusText;
                        subscriber.onError(error);
                    }
                }
            };
            request.onerror = function (e : ErrorEvent) {
                var error = new Error();
                error.message = e.message;
                subscriber.onError(error);
            };
            request.open('GET', url, true);
            request.send();
        });
    }
}