import { hasOwn } from '../shared'

const publicPropertiesMap = {
  $el: i => i.vnode.el,
  $slots: i => i.slots,
}

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // setupState
    const { setupState, props } = instance

    if (hasOwn(setupState, key))
      return setupState[key]

    else if (hasOwn(props, key))
      return props[key]

    // key -> $el / $slots
    else if (hasOwn(publicPropertiesMap, key))
      return publicPropertiesMap[key](instance)
  },
}
