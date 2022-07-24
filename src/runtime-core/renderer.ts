import { effect } from '../reactivity'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text, isSomeVNodeType } from './vnode'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    createTextNode: hostCreateTextNode,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }
  /**
   *
   * @param n1 老的 vnode
   * @param n2 新的 vnode
   * @param container
   * @param parentComponent 父组件
   * @param anchor 锚点
   */
  function patch(n1, n2, container, parentComponent, anchor) {
    const { type, shapeFlag } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container, anchor)
        break
      default:
        // 处理元素
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        }
        else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, parentComponent, anchor)
        }
    }
  }

  function processText(n1, n2, container, anchor) {
    const { children } = n2
    if (!n1) {
      const textNode = n2.el = hostCreateTextNode(children)
      hostInsert(textNode, container, anchor)
    }
    else {
      // update text
      if (n1.children !== n2.children) {
        // 复用 textNode
        const textNode = n2.el = n1.el
        // 更新 textNode 值
        hostSetElementText(textNode, children)
      }
    }
  }

  function processFragment(n1, n2, container, parent, anchor) {
    if (!n1)
      mountChildren(n2, container, parent, anchor)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1)
      mountElement(n2, container, parentComponent, anchor)
    else
      patchElement(n1, n2, parentComponent, anchor)
  }

  function mountElement(vnode, container, parent, anchor) {
    const { type, props } = vnode
    const el = vnode.el = hostCreateElement(type)
    // children
    mountChildren(vnode, el, parent, anchor)

    // props
    for (const propName in props)
      hostPatchProp(el, propName, null, props[propName])

    // mount
    hostInsert(el, container, anchor)
  }

  function patchElement(n1, n2, parentComponent, anchor) {
    const oldProps = n1.props
    const newProps = n2.props

    const el = n2.el = n1.el
    // 更新 children
    patchChildren(n1, n2, el, parentComponent, anchor)
    // 更新 props
    patchProps(oldProps, newProps, el)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const preShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    const c1 = n1.children
    const c2 = n2.children
    // 如果 新的 为 text
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // case: arr -> text
      // case: text -> text
      if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1. 清空老的 children
        unmountChildren(c1)
      }
      // 2. 设置 text
      if (c1 !== c2)
        hostSetElementText(container, c2)
    }
    // 如果新的为 arr
    else {
      // case: text -> arr
      // case: arr -> arr
      if (preShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(n2, container, parentComponent, anchor)
      }
      else {
        // arr -> arr
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1

    /**
     * case 1: 左侧对比
     *  old: [a, b, c]
     *  new: [a, b, d, e]
     */
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      // 如果是同一个类型的 vnode, patch 对比 props，children
      if (isSomeVNodeType(n1, n2))
        patch(n1, n2, container, parentComponent, parentAnchor)

      else
        break

      i++
    }
    /**
     * case 2: 右侧对比
     *  old: [a, b, c]
     *  new: [d, e, b, c]
     */
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      // 如果是同一个类型的 vnode, patch 对比 props，children
      if (isSomeVNodeType(n1, n2))
        patch(n1, n2, container, parentComponent, parentAnchor)

      else
        break

      e1--
      e2--
    }

    /**
     * case 3: 右侧多 新的比老的多 -> 创建
     *  old: [a, b]
     *  new: [a, b, c, d]
     *  此时：i: 2; e1: 1; e2: 3
     *
     * case 4: 左侧多 新的比老的多 -> 创建
     *  old: [a, b]
     *  new: [c, a, b]
     *  此时：i: 0; e1: -1; e2: 0
     */
    const l1 = c1.length
    const l2 = c2.length
    if (i > e1) {
      if (i <= e2) {
        // 新增的需要插入的原来的某个位置
        const nextPos = i + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    }
    else if (i > e2) {
      /**
       * case: 5: 右侧少，新的比老的少 -> 删除
       *  old: [a, b, c, d]
       *  new: [a, b]
       *  此时：i: 2; e1: 3; e2: 1
       *
       * case 6: 左侧少，新的比老的少 -> 删除
       *  old: [a, b, c, d]
       *  new: [c, d]
       *  此时：i: 0; e1: 1; e2: -1
       */
      if (i <= e1) {
        while (i <= e1) {
          hostRemove(c1[i].el)
          i++
        }
      }
    }
  }

  function unmountChildren(children) {
    for (const child of children)
      hostRemove(child.el)
  }

  function patchProps(oldProps, newProps, el) {
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

  function mountChildren(vnode, container, parent, anchor) {
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(container, children)
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      children.forEach((child) => {
        patch(null, child, container, parent, anchor)
      })
    }
  }

  function processComponent(n1, n2, container, parent, anchor) {
    if (!n1)
      mountComponent(n2, container, parent, anchor)
  }

  function mountComponent(vnode, container, parent, anchor) {
    const instance = createComponentInstance(vnode, parent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container, anchor)
  }

  function setupRenderEffect(instance, vnode, container, anchor) {
    // 组件级别依赖收集，触发更新
    effect(() => {
      if (!instance.isMounted) { // 第一次 mounted
        const { proxy } = instance
        // component -> children vnode
        const subTree = instance.render.call(proxy)
        instance.subTree = subTree
        // children vnode -> mount
        patch(null, subTree, container, instance, anchor)
        // 因为 组件 没有 el，从组件第一个元素节点获取 el
        vnode.el = subTree.el

        instance.isMounted = true
      }
      else { // 更新 update
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, container, instance, anchor)
        vnode.el = subTree.el
      }
    })
  }

  return {
    createApp: createAppAPI(render),
  }
}

