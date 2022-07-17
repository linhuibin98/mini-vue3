export function createVNode(component, props = {}, children = null) {
  const vnode = {
    type: component,
    props,
    children,
    el: null,
  }

  return vnode
}

export function h(type, props?, children?) {
  return createVNode(type, props, children)
}
