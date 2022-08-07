export * from './toDisplayString'

export const extend = Object.assign

export function isObject(val) {
  return val !== null && typeof val === 'object'
}

export function isFunction(val) {
  return typeof val === 'function'
}

export function isString(val) {
  return typeof val === 'string'
}

export function isNumber(val) {
  return typeof val === 'number'
}

export function isArray(val) {
  return Array.isArray(val)
}

export function hasChanged(val, newValue) {
  return !Object.is(val, newValue)
}

export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export function hasKey(obj, key) {
  return key in obj
}

// add-foo -> addFoo
export const camelize = (str: string) => str.replace(/-(\w)/g, (_, c) => c ? c.toLocaleUpperCase() : '')
// addFoo -> AddFoo
export const capitalize = (str: string) => str.charAt(0).toLocaleUpperCase() + str.slice(1)
// AddFoo -> onAddFoo
export const toHandlerKey = (str: string) => str ? `on${capitalize(str)}` : ''

export function toArray(arr) {
  return isArray(arr) ? arr : [arr]
}
