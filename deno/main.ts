import { JsInterval, JsIntervalTree } from '../pkg/intervaL_tree.js';


const tree = new JsIntervalTree()


const clamp = (min: number, max: number, n: number) => Math.max(min, Math.min(n, max));


function intRand(min: number, max: number) {
    return clamp(min, max, Math.floor(Math.random() * max));
}


const newArray = Array.from({ length: 100 }, (value, index) => {

    const start = intRand(0, 100)
    const end = intRand(start, 100)

    return ({ start, end })
});


newArray.forEach((x, i) => {
    tree.insert(x.start, x.end, `value-${i}`)
})


const queried = tree.find(new JsInterval(20, 30));





