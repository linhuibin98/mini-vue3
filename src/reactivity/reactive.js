import { isObject } from '../utils';

export function reactive(target) {
    if (!isObject(target)) {
        return target;
    }

    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver);
            console.log('获取值：', key, res);
            return res;
        },
        set(target, key, value, receiver) {
            console.log('设置值：', key, value);
            const res = Reflect.set(target, key, value, receiver);
            return res;
        }
    });
    return proxy;
}