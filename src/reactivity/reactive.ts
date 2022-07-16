import { track, trigger } from "./effect"

export function reactive(raw) {
    return new Proxy(raw, {
        get(target, key, receiver) {
            // 依赖收集
            track(target, key)
            return Reflect.get(target, key, receiver)
        },
        set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver)
            trigger(target, key)
            return res
        }
    })
}
