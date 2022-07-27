import { isArray, isObject } from '../shared'
import { createVNode, isVNode } from './vnode'

// `h` is a more user-friendly version of `createVNode` that allows omitting the
// props when possible. It is intended for manually written render functions.
// Compiler-generated code uses `createVNode` because
// 1. it is monomorphic and avoids the extra call overhead
// 2. it allows specifying patchFlags for optimization

/*
// type only
h('div')

// type + props
h('div', {})

// type + omit props + children
// Omit props does NOT support named slots
h('div', []) // array
h('div', 'foo') // text
h('div', h('br')) // vnode
h(Component, () => {}) // default slot

// type + props + children
h('div', {}, []) // array
h('div', {}, 'foo') // text
h('div', {}, h('br')) // vnode
h(Component, {}, () => {}) // default slot
h(Component, {}, {}) // named slots

// named slots without props requires explicit `null` to avoid ambiguity
h(Component, null, {})
**/
export function h(type, propsOrChildren?, children?) {
  const l = arguments.length
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren))
        // 单 vnode 转为 数组 [vnode]
        return createVNode(type, null, [propsOrChildren])

      // 为 props
      return createVNode(type, propsOrChildren)
    }
    // 为 children
    return createVNode(type, null, propsOrChildren)
  }
  else {
    // l 为 1 或者 3 或者 大于 3
    if (l > 3)
      // eslint-disable-next-line prefer-rest-params
      children = Array.prototype.slice.call(arguments, 2)

    else if (l === 3 && isVNode(children))
      // 单 vnode 转为 数组 [vnode]
      children = [children]

    return createVNode(type, propsOrChildren, children)
  }
}
