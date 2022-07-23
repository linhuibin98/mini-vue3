import { effect } from '../reactivity'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    createTextNode: hostCreateTextNode,
  } = options

  function render(vnode, container) {
    patch(null, vnode, container)
  }
  /**
   *
   * @param n1 老的 vnode
   * @param n2 新的 vnode
   * @param container
   * @param parent
   */
  function patch(n1, n2, container, parent?) {
    const { type, shapeFlag } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        // 处理元素
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parent)
        }
        else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parent)
        }
    }
  }

  function processText(n1, n2, container) {
    if (!n1) {
      const { children } = n2
      const textNode = n2.el = hostCreateTextNode(children)
      hostInsert(textNode, container)
    }
  }

  function processFragment(n1, n2, container, parent) {
    if (!n1)
      mountChildren(n2, container, parent)
  }

  function processElement(n1, n2, container, parent) {
    if (!n1)
      mountElement(n2, container, parent)
    else
      patchElement(n1, n2)
  }

  function mountElement(vnode, container, parent) {
    const { type, props } = vnode
    const el = vnode.el = hostCreateElement(type)
    // children
    mountChildren(vnode, el, parent)

    // props
    for (const propName in props)
      hostPatchProp(el, propName, null, props[propName])

    // mount
    hostInsert(el, container)
  }

  function patchElement(n1, n2) {
    const oldProps = n1.props
    const newProps = n2.props

    const el = n2.el = n1.el

    // 更新 props
    patchProps(el, oldProps, newProps)
  }

  function patchProps(el, oldProps, newProps) {
    // 先遍历新 props 赋值
    for (const key in newProps) {
      if (Object.prototype.hasOwnProperty.call(newProps, key)) {
        const preProp = oldProps[key]
        const nextProp = newProps[key]

        hostPatchProp(el, key, preProp, nextProp)
      }
    }

    // 遍历老的 props, 在新的中不存在就删除
    for (const key in oldProps) {
      if (Object.prototype.hasOwnProperty.call(oldProps, key)) {
        if (!(key in newProps))
          hostPatchProp(el, key, null, null)
      }
    }
  }

  function mountChildren(vnode, container, parent) {
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = children
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      children.forEach((child) => {
        patch(null, child, container, parent)
      })
    }
  }

  function processComponent(n1, n2, container, parent) {
    if (!n1)
      mountComponent(n2, container, parent)
  }

  function mountComponent(vnode, container, parent) {
    const instance = createComponentInstance(vnode, parent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container)
  }

  function setupRenderEffect(instance, vnode, container) {
    // 组件级别依赖收集，触发更新
    effect(() => {
      if (!instance.isMounted) { // 第一次 mounted
        const { proxy } = instance
        // component -> children vnode
        const subTree = instance.render.call(proxy)
        // children vnode -> mount
        patch(null, subTree, container, instance)
        // 因为 组件 没有 el，从组件第一个元素节点获取 el
        vnode.el = subTree.el

        instance.isMounted = true
      }
      else { // 更新 update
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.vnode
        instance.vnode = subTree
        patch(preSubTree, subTree, container, instance)
        vnode.el = subTree.el
      }
    })
  }

  return {
    createApp: createAppAPI(render),
  }
}

