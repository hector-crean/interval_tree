import { JsInterval, JsIntervalTree, } from '../pkg/intervaL_tree.js';

/**
 * Variables:
 * - What is the size of the overall interval that we are searching over
 * - How many sub intervals are within the overal interval (i.e. candidates)
 * - Are we searching over the whole overall interval, or just a sub range?
 * - how does it interact with caching/memoising?
 * 
 * It would be good to have a situation where we choose the appripriate function given the input params, so in all situations we get the fastest function
 */

const INTERVAL_START = 0;
const INTERVAL_END = 5 * 60 * 10;

interface Interval {
    start: number, end: number
}
const clamp = (min: number, max: number, n: number) => Math.max(min, Math.min(n, max));


const intRand = (min: number, max: number) => {
    return clamp(min, max, Math.floor(Math.random() * max));
}


const intervals: Array<Interval> = Array.from({ length: 100000 }, (value, index) => {



    const start = intRand(INTERVAL_START, INTERVAL_END)
    const end = intRand(start, INTERVAL_END)

    return ({ start, end })
});

const array = (length: number, start: number) => Array.from({ length: length }, (value, index) => start + index);

const longArray = array(Math.abs(INTERVAL_END - INTERVAL_START), 0)

const generateTree = (intervals: Array<Interval>): JsIntervalTree => {

    const tree = new JsIntervalTree()

    intervals.forEach((x, i) => {
        tree.insert(new JsInterval(x.start, x.end), `value-${i}`)
    })

    return tree

}


const isBetween = (entry: Interval, queryInterval: Interval) => {


    return entry.start >= queryInterval.start && entry.start < queryInterval.end && entry.end >= queryInterval.start && entry.end < queryInterval.end
}


const tree = generateTree(intervals)



Deno.bench(
    { name: "naive_array", group: "intervals", baseline: true, permissions: { read: true } },
    () => {


        const query = () => intervals.filter(iv => isBetween(iv, { start: 1300, end: 3600 }))

        const result1 = query()
        const result2 = query()
        const result3 = query()
        const result4 = query()
        const result5 = query()
    },
)


Deno.bench(
    { name: "interval_tree", group: "intervals", permissions: { read: true } },
    () => {

        const query = () => tree.find(new JsInterval(1300, 3600));
        const result1 = query()
        const result2 = query()
        const result3 = query()
        const result4 = query()
        const result5 = query()



    }
);

Deno.bench(
    { name: "naive_array:memoized", group: "intervals", baseline: true, permissions: { read: true } },
    () => {


        const query = () => intervals.filter(iv => isBetween(iv, { start: 1300, end: 3600 }))

        const memoizedFn = memoizy(query)
        const result1 = memoizedFn()
        const result2 = memoizedFn()
        const result3 = memoizedFn()
        const result4 = memoizedFn()
        const result5 = memoizedFn()

    },
)


Deno.bench(
    { name: "interval_tree:memoized", group: "intervals", permissions: { read: true } },
    () => {

        const query = () => tree.find(new JsInterval(1300, 3600));
        const memoizedFn = memoizy(query)
        const result1 = memoizedFn()
        const result2 = memoizedFn()
        const result3 = memoizedFn()
        const result4 = memoizedFn()
        const result5 = memoizedFn()
        // const sanitied = queried.map(q => ({ start: q.start, end: q.end, data: q.data }))

    }
);


Deno.bench(
    { name: "interval_tree:batched", group: "intervals", permissions: { read: true } },
    () => {

        const query = () => tree.batch_find(new Int32Array([
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
            51, 52, 53, 54, 55, 56, 57, 58, 59, 60,

            1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
            51, 52, 53, 54, 55, 56, 57, 58, 59, 60,

            1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
            51, 52, 53, 54, 55, 56, 57, 58, 59, 60,

            1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
            51, 52, 53, 54, 55, 56, 57, 58, 59, 60,

            1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
            11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
            21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
            51, 52, 53, 54, 55, 56, 57, 58, 59, 60,


        ]));
        const result = query()
        // const sanitied = queried.map(q => ({ start: q.start, end: q.end, data: q.data }))

    }
);





const defaultCacheKeyBuilder = (...args: any[]): string =>
    args.length === 0 ? "__0aritykey__" : JSON.stringify(args);

const isPromise = <TResult>(value: unknown): value is Promise<TResult> =>
    value instanceof Promise;

export interface GenericCache<TKey = void, TValue = void> {
    has: (k: TKey) => boolean;
    get: (k: TKey) => TValue | undefined;
    set: (k: TKey, v: TValue) => void;
    delete: (k: TKey) => boolean;
    clear?: () => void;
}

export interface MemoizyOptions<TResult = any> {
    cache?: () => GenericCache<string, TResult>;
    maxAge?: number;
    cacheKey?: (...args: any[]) => string;
    valueAccept?: null | ((err: Error | null, res?: TResult) => boolean);
}

export interface MemoizedFunction<TResult> {
    (...args: any[]): TResult;
    delete: (...args: any[]) => boolean;
    clear: () => void;
}

const defaultOptions = {
    cache: () => new Map(),
    maxAge: Infinity,
    cacheKey: defaultCacheKeyBuilder,
    valueAccept: null,
};

/**
 * Givent a function returns the memoized version of it
 * @example
 * const add = (a, b) => a + b;
 * const memAdd = memoizy(add);
 * const res = memAdd(4, 5);
 * 
 * @param fn The function to be memoized
 * @param [config] The config for the memoization process. All the config are optional
 * @param [config.cache] A factory that returns a map like cache
 * @param [config.maxAge] Time, in milliseconds, to retain the result of the memoization
 * @param [config.cacheKey] A function to return the memoization key given the arguments of the function
 * @param [config.valueAccept] A function that, given the result, returns a boolean to keep it or not.
 */
export const memoizy = <TResult>(
    fn: (...args: any[]) => TResult,
    {
        cache: cacheFactory = () => new Map<string, TResult>(),
        maxAge = Infinity,
        cacheKey = defaultCacheKeyBuilder,
        valueAccept = null,
    } = defaultOptions as MemoizyOptions<TResult>,
): MemoizedFunction<TResult> => {
    const hasExpireDate = maxAge > 0 && maxAge < Infinity;
    const cache = cacheFactory();

    const set = (key: string, value: TResult) => {
        if (hasExpireDate) {
            setTimeout(() => {
                cache.delete(key);
            }, maxAge);
        }
        cache.set(key, value);
    };

    const memoized = (...args: any[]) => {
        const key = cacheKey(...args);
        if (cache.has(key)) {
            return cache.get(key) as TResult;
        }
        const value = fn(...args);

        if (!valueAccept) {
            set(key, value);
        } else if (isPromise<TResult>(value)) {
            value
                .then((res) => [null, res])
                .catch((err) => [err])
                .then(([err, res]) => {
                    if (valueAccept(err, res)) {
                        set(key, value);
                    }
                });
        } else if (valueAccept(null, value)) {
            set(key, value);
        }

        return value;
    };

    memoized.delete = (...args: any[]) => cache.delete(cacheKey(...args));
    memoized.clear = () => {
        if (cache.clear instanceof Function) {
            cache.clear();
        } else {
            throw new Error("This cache doesn't support clear");
        }
    };

    return memoized;
};

export default memoizy;
