import { isObject } from '../shared'
import { mutableHandlers, readonlyHandlers, shadowReadonlyHandlers } from './baseHandlers'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

export function reactive(raw) {
  return createActiveObject(raw, mutableHandlers)
}

export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

export function shadowReadonly(raw) {
  return createActiveObject(raw, shadowReadonlyHandlers)
}

export function createActiveObject(raw, baseHandlers) {
  if (!isObject(raw))
    return console.warn(`target ${raw} is not a object`)

  return new Proxy(raw, baseHandlers)
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}
