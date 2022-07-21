import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    createTextNode: hostCreateTextNode,
  } = options
  function render(vnode, container) {
    patch(vnode, container)
  }

  function patch(vnode, container, parent?) {
    const { type, shapeFlag } = vnode

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parent)
        break
      case Text:
        processText(vnode, container)
        break
      default:
        // 处理元素
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parent)
        }
        else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(vnode, container, parent)
        }
    }
  }

  function processText(vnode, container) {
    const { children } = vnode
    const textNode = vnode.el = hostCreateTextNode(children)
    hostInsert(textNode, container)
  }

  function processFragment(vnode, container, parent) {
    mountChildren(vnode, container, parent)
  }

  function processElement(vnode, container, parent) {
    mountElement(vnode, container, parent)
  }

  function mountElement(vnode, container, parent) {
    const { type, props } = vnode
    const el = vnode.el = hostCreateElement(type)
    // children
    mountChildren(vnode, el, parent)

    // props
    hostPatchProps(el, props)

    // mount
    hostInsert(el, container)
  }

  function mountChildren(vnode, container, parent) {
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = children
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      children.forEach((child) => {
        patch(child, container, parent)
      })
    }
  }

  function processComponent(vnode, container, parent) {
    mountComponent(vnode, container, parent)
  }

  function mountComponent(vnode, container, parent) {
    const instance = createComponentInstance(vnode, parent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance
    // component -> children vnode
    const subTree = instance.render.call(proxy)
    // children vnode -> mount
    patch(subTree, container, instance)
    // 因为 组件 没有 el，从组件第一个元素节点获取 el
    vnode.el = subTree.el
  }
  return {
    createApp: createAppAPI(render),
  }
}

