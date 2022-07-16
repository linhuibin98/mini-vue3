
export let activeEffect;

class ReactiveEffect {
    private _fn

    constructor(fn, public scheduler?) {
        this._fn = fn
    }

    run() {
        activeEffect = this
        return this._fn()
    }
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)

    _effect.run()

    return _effect.run.bind(_effect)
}

const targetMap = new Map(); // 储存依赖收集  target -> key -> deps
export function track(target, key) {
    // target -> key -> deps
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let deps = depsMap.get(key)
    if (!deps) {
        deps = new Set()
        depsMap.set(key, deps)
    }
    deps.add(activeEffect)
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const deps = depsMap.get(key)

    for (const depEffect of deps) {
        if (depEffect.scheduler) {
            depEffect.scheduler()
        } else {
            depEffect.run()
        }
    }
}
