const publicPropertiesMap = {
  $el: i => i.vnode.el,
}

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key, receiver) {
    // setupState
    const { setupState } = instance
    if (key in setupState)
      return Reflect.get(setupState, key, receiver)

    // key -> $el
    if (key in publicPropertiesMap)
      return publicPropertiesMap[key](instance)
  },
}
