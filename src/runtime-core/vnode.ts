import { isArray, isObject, isString } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVNode(type, props?, children?) {
  const vnode = {
    __v_isVNode: true,
    type,
    props: props || {},
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  }

  // children shapeFlag
  if (isString(children))
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN

  else if (isArray(children))
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN

  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children))
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
  }

  return vnode
}

export function createTextVNode(text) {
  return createVNode(Text, {}, text)
}

export function isVNode(value) {
  return value ? value.__v_isVNode === true : false
}

export function getShapeFlag(type) {
  return isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
