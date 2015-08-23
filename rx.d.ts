/**
 * @author  wehjin
 * @since   6/21/15
 */
export interface Subscription {
    isUnsubscribed(): boolean;
    unsubscribe(): any;
}
export interface Observable<T> {
    subscribe(onNext?: (next: T) => void, onError?: (error: Error) => void, onCompleted?: () => void): Subscription;
}
export interface Observer<T> {
    onNext(next: T): any;
    onError(error: Error): any;
    onCompleted(): any;
}
export interface Subscriber<T> extends Observer<T> {
    addSubscription(subscription: Subscription): () => void;
}
export declare function create<T>(onSubscribe: (subscriber: Subscriber<T>) => void): Observable<T>;
export declare class HttpResponse {
    json: any;
    constructor(request: XMLHttpRequest);
}
export declare function httpGet(url: string): Observable<HttpResponse>;
