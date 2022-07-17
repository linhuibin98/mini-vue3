import { hasChanged, isObject } from '../shared'
import { trackEffect, triggerEffect } from './effect'
import { reactive } from './reactive'

class RefImpl {
  private _value
  public _rawValue
  public deps
  public __v_isRef = true
  constructor(value) {
    this._rawValue = value
    this._value = convert(value)
    this.deps = new Set()
  }

  get value() {
    trackEffect(this.deps)
    return this._value
  }

  set value(newValue) {
    if (hasChanged(this._value, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffect(this.deps)
    }
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(maybeRef) {
  return !!maybeRef.__v_isRef
}

export function unref(maybeRef) {
  return isRef(maybeRef) ? maybeRef.value : maybeRef
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      return unref(Reflect.get(target, key, receiver))
    },
    set(target, key, value, receiver) {
      if (isRef(target[key]) && !isRef(value))
        return target[key].value = value

      else
        return Reflect.set(target, key, value, receiver)
    },
  })
}
function convert(value) {
  return isObject(value) ? reactive(value) : value
}
