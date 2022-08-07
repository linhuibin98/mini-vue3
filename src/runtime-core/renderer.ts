import { effect } from '../reactivity'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { showUpdateComponent } from './componentUpdateUtils'
import { createAppAPI } from './createApp'
import { queueJobs } from './scheduler'
import { Fragment, Text, isSomeVNodeType, normalizeVNode } from './vnode'

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
  function patch(n1, n2, container, anchor, parentComponent) {
    const { type, shapeFlag } = n2

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        // 处理元素
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent)
        }
        else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件
          processComponent(n1, n2, container, anchor, parentComponent)
        }
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2
    if (!n1) {
      const textNode = n2.el = hostCreateTextNode(children)
      hostInsert(textNode, container)
    }
    else {
      // update text
      // 复用 textNode
      const textNode = n2.el = n1.el
      if (n1.children !== n2.children) {
        // 更新 textNode 值
        hostSetElementText(textNode, children)
      }
    }
  }

  function processFragment(n1, n2, container, anchor, parentComponent) {
    if (!n1)
      mountChildren(n2.children, container, anchor, parentComponent)
    else
      // 更新 children
      patchChildren(n1, n2, container, anchor, parentComponent)
  }

  function processElement(n1, n2, container, anchor, parentComponent) {
    if (!n1)
      mountElement(n2, container, anchor, parentComponent)
    else
      patchElement(n1, n2, anchor, parentComponent)
  }

  function mountElement(vnode, container, anchor, parentComponent) {
    const { type, props, shapeFlag, children } = vnode
    const el = vnode.el = hostCreateElement(type)
    // children
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN)
      hostSetElementText(el, children)

    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN)
      mountChildren(children, el, anchor, parentComponent)

    // props
    for (const propName in props)
      hostPatchProp(el, propName, null, props[propName])

    // mount
    hostInsert(el, container, anchor)
  }

  function patchElement(n1, n2, anchor, parentComponent) {
    const oldProps = n1.props
    const newProps = n2.props

    const el = n2.el = n1.el
    // 更新 children
    patchChildren(n1, n2, el, anchor, parentComponent)
    // 更新 props
    patchProps(oldProps, newProps, el)
  }

  function patchChildren(n1, n2, container, anchor, parentComponent) {
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
        mountChildren(n2.children, container, anchor, parentComponent)
      }
      else {
        // arr -> arr
        patchKeyedChildren(c1, c2, container, anchor, parentComponent)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentAnchor, parentComponent) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    // debugger
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
        patch(n1, n2, container, parentAnchor, parentComponent)

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
        patch(n1, n2, container, parentAnchor, parentComponent)

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
    const l2 = c2.length
    if (i > e1) {
      if (i <= e2) {
        // 新增的需要插入的原来的某个位置
        const nextPos = i + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, anchor, parentComponent)
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
    else {
      /**
     * case 7: 中间乱序 对比
     *  old: [a, b, c, d, f, g]
     *  new: [a, b, e, c, f, g]
     *  此时：i: 2; e1: 3; e2: 3
     *
     * case 8: 中间乱序 - 最长递增子序列，减少 insert 操作
     *  old: [a, b, c, d, e, f, g]
     *  new: [a, b, e, c, d, f, g]
     *  此时：i: 2; e1: 4; e4: 4
     *  s1: 2; s2: 2;
     *  newIndexToOldIndexMap 值： [5 , 3 , 4]
     *  increasingNewIndexSequence 最长递增子序列处理后返回：[1, 2] 表示的是索引
     */
      const s1 = i
      const s2 = i

      const toBePatched = e2 - s2 + 1
      let parched = 0
      const keyToNewIndexMap = new Map()
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
      let moved = false
      let maxNewIndexSoFar = 0

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      for (let i = s1; i <= e1; i++) {
        const preChild = c1[i]

        if (parched >= toBePatched) {
          hostRemove(preChild.el)
          continue
        }

        let newIndex
        // null / undefined
        if (preChild.key != null) {
          // 新旧 存在相同 key 的元素
          newIndex = keyToNewIndexMap.get(preChild.key)
        }
        else {
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(preChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }
        // 如果还是没有找到相同的元素 newIndex
        if (newIndex === undefined) {
          // 删除
          hostRemove(preChild.el)
        }
        else {
          if (newIndex >= maxNewIndexSoFar)
            maxNewIndexSoFar = newIndex
          else
            moved = true

          newIndexToOldIndexMap[newIndex - s2] = i + 1
          // 更新 patch
          patch(preChild, c2[newIndex], container, null, parentComponent)
          parched++
        }
      }

      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []

      let j = increasingNewIndexSequence.length - 1

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor

        if (newIndexToOldIndexMap[i] === 0) {
          // 新增
          patch(null, nextChild, container, anchor, parentComponent)
        }
        else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j])
            // 移动位置 / 插入
            hostInsert(nextChild.el, container, anchor)
          else
            j--
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

  function mountChildren(children, container, anchor, parentComponent) {
    children.forEach((child) => {
      patch(null, normalizeVNode(child), container, anchor, parentComponent)
    })
  }

  function processComponent(n1, n2, container, anchor, parentComponent) {
    if (!n1)
      mountComponent(n2, container, anchor, parentComponent)
    else
      updateComponent(n1, n2)
  }

  function updateComponent(n1, n2) {
    const instance = n2.component = n1.component
    if (showUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    }
    else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function mountComponent(vnode, container, anchor, parentComponent) {
    const instance = vnode.component = createComponentInstance(vnode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, vnode, container, anchor)
  }

  function setupRenderEffect(instance, vnode, container, anchor) {
    // 组件级别依赖收集，触发更新
    instance.update = effect(() => {
      if (!instance.isMounted) { // 第一次 mounted
        const { proxy } = instance
        // component -> children vnode
        const subTree = instance.render.call(proxy, proxy)
        instance.subTree = subTree
        // children vnode -> mount
        patch(null, subTree, container, anchor, instance)
        // 因为 组件 没有 el，从组件第一个元素节点获取 el
        vnode.el = subTree.el

        instance.isMounted = true
      }
      else { // 更新 update
        const { proxy, next, vnode: preVNode } = instance
        if (next) {
          next.el = preVNode.el
          updateComponentPreRender(instance, next)
        }
        const subTree = instance.render.call(proxy, proxy)
        const preSubTree = instance.subTree
        instance.subTree = subTree
        patch(preSubTree, subTree, preSubTree.el, anchor, instance)
      }
    }, {
      scheduler: () => {
        queueJobs(instance.update)
      },
    })
  }

  return {
    createApp: createAppAPI(render),
  }
}

function updateComponentPreRender(instance, nextVNode) {
  instance.vnode = nextVNode
  instance.next = null
  instance.props = nextVNode.props
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI)
          u = c + 1

        else
          v = c
      }
      if (arrI < arr[result[u]]) {
        if (u > 0)
          p[i] = result[u - 1]

        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

