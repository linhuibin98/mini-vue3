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

export function isArray(val) {
  return Array.isArray(val)
}

export function hasChanged(val, newValue) {
  return !Object.is(val, newValue)
}
