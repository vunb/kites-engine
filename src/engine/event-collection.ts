export interface ICollectionItem {
    readonly key:string;
    readonly fn:Function;
    readonly context:object|Function;
}

export class EventCollectionEmitter {
    private _listeners: Array<ICollectionItem>;
    private _pre: Array<Function>;
    private _post: Array<Function>;
    private _postFail: Array<Function>;

    constructor() {
        this._listeners = [];
        this._pre = [];
        this._post = [];
        this._postFail = [];
    }

    /**
     * Add listener callback at the end of the current chain
     * @param key
     * @param context
     * @param listener
     */
    add(key: string, context: Object|Function, listener?: Function) {
        let _ctx = listener == null ? this: context;
        let _fn = listener || context as Function;

        if(typeof _fn !== 'function') {
            throw 'Listener must be a function!'
        }

        this._listeners.push({
            key: key,
            fn: _fn,
            context: _ctx
        })
    }

    /**
     * Remove the listener specified by its key from the collection
     * @param key
     */
    remove(key:string) {
        this._listeners = this._listeners.filter(x => x.key !== key)
    }

    /**
     * add hook that will be executed before actual listener
     * @param fn
     */
    pre(fn: Function) {
        this._pre.push(fn)
    }

    /**
     * add hook that will be executed after actual listener
     * @param fn
     */
    post(fn: Function) {
        this._post.push(fn)
    }

    /**
     * add hook that will be executed after actual listener when execution will fail
     * @param fn
     */
    postFail (fn: Function) {
        this._postFail.push(fn)
    }

    /**
     * Fire registered listeners in sequence and returns a promise containing wrapping an array of all individual results
     * The parameters passed to the fire are forwarded in the same order to the listeners
     * @returns {Promise<U>}
     */
    async fire(...args: object[]) {
        var self = this

        function mapSeries (arr:Array<any>, next:Function) {
            // create a empty promise to start our series
            var currentPromise = Promise.resolve();
            var promises = arr.map(async function (item) {
                // execute the next function after the previous has resolved successfully
                return (currentPromise = currentPromise.then(() => next(item)))
            })
            // group the results for executing concurrently
            // and return the group promise
            return Promise.all(promises)
        }

        function applyHook (listener:ICollectionItem, hookArrayName: string, outerArgs: Array<any>) {
            var hooks = (<any>self)[hookArrayName];
            hooks.forEach((hook:Function) => {
                try {
                    hook.apply(listener, outerArgs)
                } catch (err) {
                    console.warn('Event listener [' + hookArrayName + '] hook got an error!', err);
                }
            });
        }

        return await mapSeries(this._listeners, async (listener:ICollectionItem) => {
            if (!listener) {
                return null;
            }
            var currentArgs = args.slice(0);
            applyHook(listener, '_pre', currentArgs);

            try {
                let valOrPromise = listener.fn.apply(listener.context, currentArgs);
                let result = await Promise.resolve(valOrPromise);
                applyHook(listener, '_post', currentArgs);
                return result;
            } catch (err) {
                currentArgs.unshift(err);
                // console.warn('Event listener got an error!', err);
                applyHook(listener, '_postFail', currentArgs);
                return Promise.reject(err);
            }
        });
    }
}
