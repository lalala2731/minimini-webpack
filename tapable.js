import { SyncHook, AsyncParallelHook } from "tapable";

class list {
    getRoutes() {
        console.log('getRoutes');
    }
}

class Car {
    constructor() {
        this.hooks = {
            accelerate: new SyncHook(["newSpeed"]),
            brake: new SyncHook(),
            calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
        };
    }

    /* ... */

    setSpeed(newSpeed) {
        // following call returns undefined even when you returned values
        this.hooks.accelerate.call(newSpeed);// 触发事件
    }

    useNavigationSystemPromise(source, target) {
        const routesList = new List();
        return this.hooks.calculateRoutes.promise(source, target, routesList).then((res) => {
            // res is undefined for AsyncParallelHook
            return routesList.getRoutes();
        });
    }

    useNavigationSystemAsync(source, target, callback) {
        const routesList = new List();
        this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
            if (err) return callback(err);
            callback(null, routesList.getRoutes());
        });
    }


}

// 1.注册
const car = new Car()
car.hooks.accelerate.tap('test1', (a) => {
    console.log('accelerate', a);
})

car.hooks.calculateRoutes.tapPromise('test2', (source, target, routesList) => {
    console.log('----promise', source, target, routesList);
})
// 2.触发
car.setSpeed(1)

car.useNavigationSystemPromise([1, 2, 3], () => {
    console.log('------ppp------');
})


