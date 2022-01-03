const effectStack = []
let activeEffect

/**
 * 副作用监听
 * @param {function} fn
 * @param {object} options
 */
export function effect(fn, options = {}) {
  const effectFn = () => {
    try {
      effectStack.push(fn)
      activeEffect = effectFn
      return fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }
  // 立即执行
  if (!options.lazy) {
    effectFn()
  }
  effectFn.scheduler = options.scheduler
  return effectFn
}

/**
 * 依赖收集缓存
 * {
 *  'target': {
 *      'targetKey': [effectFn, effectFn, ...]
 *  }
 * }
 */
const targetMap = new WeakMap()

/**
 * 依赖收集
 * @param {object} target
 * @param {string} key
 */
export function track(target, key) {
  if (!activeEffect) {
    return
  }
  let depMap = targetMap.get(target)
  if (!depMap) {
    targetMap.set(target, (depMap = new Map()))
  }
  let deps = depMap.get(key)
  if (!deps) {
    depMap.set(key, (deps = new Set()));
  }
  if (!deps.has(activeEffect)) {
    deps.add(activeEffect);
  }
}

/**
 * 触发更新
 * @param {object} target
 * @param {string} key
 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const dep = depsMap.get(key)
  if (!dep) {
    return
  }
  dep.forEach((effectFn) => {
    if (effectFn.scheduler) {
      effectFn.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
