import { isObject, hasChanged, isArray } from '../utils';
import { track, trigger } from './effect';

// 用于记录已经proxy代理的对象
const reactiveMap = new WeakMap();

export function reactive(target) {
    if (!isObject(target)) {
        return target;
    }
    // 已经是响应式对象
    if (isReactive(target)) {
        return target;
    }
    // 缓存中是否有记录被代理
    if (reactiveMap.has(target)) {
        return reactiveMap.get(target);
    }
    const proxy = new Proxy(target, {
        get(target, key, receiver) {
            // 响应式标识
            if (key === '__isReactive') {
                return true;
            }
            track(target, key);
            const res = Reflect.get(target, key, receiver);
            // 若res还是对象，继续proxy
            return isObject(res) ? reactive(res) : res;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const oldLength = target.length;  
            const res = Reflect.set(target, key, value, receiver);
            if (hasChanged(value, oldValue)) {
                trigger(target, key);
                if (isArray(target) && target.length !== oldLength) {
                    trigger(target, 'length');
                }
            }
            return res;
        }
    });
    reactiveMap.set(target, proxy);
    return proxy;
}

/**
 * 是否是响应式对应
 * @param {*} target 
 * @returns bool
 */
export function isReactive(target) {
    return !!(target && target.__isReactive);
}