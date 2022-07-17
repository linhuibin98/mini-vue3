import { extend } from '../shared'

let activeEffect: ReactiveEffect | null = null
let shouldTrack = false
export class ReactiveEffect {
  private fn
  public deps: Set<Set<ReactiveEffect>> = new Set()
  private active = true
  public onStop?: () => void
  public scheduler?: () => void
  constructor(fn, scheduler?) {
    this.fn = fn
    this.scheduler = scheduler
  }

  run() {
    if (!this.active)
      return this.fn()

    shouldTrack = true
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    activeEffect = this
    const result = this.fn()

    shouldTrack = false

    return result
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop)
        this.onStop()

      this.active = false
    }
  }
}

function cleanupEffect(reactiveEffect) {
  for (const dep of reactiveEffect.deps)
    dep.delete(reactiveEffect)

  reactiveEffect.deps.clear()
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)

  runner.effect = _effect
  return runner
}

const targetMap = new WeakMap() // 储存依赖收集  target -> key -> deps
export function track(target, key) {
  /**
   * 不是在 effect 中读取 reactive 数据 将没有  activeEffect，不进行依赖收集
   * 也就是说 只有在 effect 中读取 reactive 数据 才进行依赖收集
   */
  if (!activeEffect || !shouldTrack) return

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
  trackEffect(deps)
}

export function trackEffect(deps) {
  if (!activeEffect) return
  /**
   * 双向收集
   * dep 保存 activeEffect
   * activeEffect 保存 dep, 用于之后解除监听响应式变化
   */
  if (!deps.has(activeEffect))
    deps.add(activeEffect)

  if (!activeEffect.deps.has(deps))
    activeEffect.deps.add(deps)
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return // 没有 effect 将没有依赖收集

  const deps = depsMap.get(key)
  triggerEffect(deps)
}

export function triggerEffect(deps) {
  if (!deps) return // 没有 effect 将没有依赖收集

  for (const depEffect of deps) {
    if (depEffect.scheduler)
      depEffect.scheduler()
    else
      depEffect.run()
  }
}

export function stop(runner) {
  runner.effect.stop()
}
