import { isObject } from '../shared'
import { track, trigger } from './effect'
import { ReactiveFlags, reactive, readonly } from './reactive'

function createGetter(isReadonly = false, shadow = false) {
  return function get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE)
      return !isReadonly

    else if (key === ReactiveFlags.IS_READONLY)
      return isReadonly

    const res = Reflect.get(target, key, receiver)

    if (shadow)
      return res

    if (isObject(res))
      return isReadonly ? readonly(res) : reactive(res)

    if (!isReadonly)
      // 依赖收集
      track(target, key)

    return res
  }
}

function createSetter() {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    // 触发依赖更新
    trigger(target, key)
    return res
  }
}

export const get = createGetter()
export const set = createSetter()
export const readonlyGet = createGetter(true)
export const shadowReadonlyGet = createGetter(true, true)
export const readonlySet = (target, key) => {
  console.warn(`${key} is readonly`)
  return true
}

export const mutableHandlers = {
  get,
  set,
}

export const readonlyHandlers = {
  get: readonlyGet,
  set: readonlySet,
}

export const shadowReadonlyHandlers = {
  get: shadowReadonlyGet,
  set: readonlySet,
}
