import { hasOwn } from '../shared'

const publicPropertiesMap = {
  $el: i => i.vnode.el,
}

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key, receiver) {
    // setupState
    const { setupState, props } = instance

    if (hasOwn(setupState, key))
      return Reflect.get(setupState, key, receiver)

    else if (hasOwn(props, key))
      return Reflect.get(props, key, receiver)

    // key -> $el
    else if (hasOwn(publicPropertiesMap, key))
      return publicPropertiesMap[key](instance)
  },
}
