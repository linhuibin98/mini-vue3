import { isArray, isNumber, isObject, isString } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVNode(type, props?, children?) {
  const vnode = {
    __v_isVNode: true,
    type,
    key: props?.key,
    props: props || {},
    children,
    el: null,
    component: null,
    shapeFlag: getShapeFlag(type),
  }

  // children shapeFlag
  if (isString(children))
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN

  else if (isArray(children))
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children))
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
  }

  return vnode
}

export function createTextVNode(text) {
  return createVNode(Text, {}, text)
}

export function isVNode(value) {
  return value ? value.__v_isVNode === true : false
}

export function isSomeVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

export function getShapeFlag(type) {
  return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

export function normalizeChildren(vnode, children) {
  if (isObject(children)) {
    // 暂时主要是为了标识出 slots_children 这个类型来
    // 暂时我们只有 element 类型和 component 类型的组件
    // 所以我们这里除了 element ，那么只要是 component 的话，那么children 肯定就是 slots 了
    if (vnode.shapeFlag & ShapeFlags.ELEMENT) {
      // 如果是 element 类型的话，那么 children 肯定不是 slots
    }
    else {
      // 这里就必然是 component 了,
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
    }
  }
}

// 标准化 vnode 的格式
// 其目的是为了让 child 支持多种格式
export function normalizeVNode(child) {
  // 暂时只支持处理 child 为 string 和 number 的情况
  if (isString(child) || isNumber(child))
    return createVNode(Text, null, String(child))

  else
    return child
}
