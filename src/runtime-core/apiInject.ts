import { hasKey, isFunction } from '../shared'
import { getCurrentInstance } from './component'

export function provide(key, value) {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    let parentProvides
    if (currentInstance.parent)
      parentProvides = currentInstance.parent.provides

    if (parentProvides === provides)
      provides = currentInstance.provides = Object.create(parentProvides)

    provides[key] = value
  }
}

export function inject(key, defaultValue?) {
  const currentInstance = getCurrentInstance()
  if (currentInstance) {
    const { parent } = currentInstance
    if (parent) {
      const provides = parent.provides

      if (hasKey(provides, key))
        return provides[key]

      else if (isFunction(defaultValue))
        return defaultValue()

      else
        return defaultValue
    }
  }
}
