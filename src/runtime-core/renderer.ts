import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  patch(vnode, container)
}

export function patch(vnode, container) {
  const { type, shapeFlag } = vnode

  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      // 处理元素
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      }
      else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 处理组件
        processComponent(vnode, container)
      }
  }
}

function processText(vnode, container) {
  const { children } = vnode
  const textNode = vnode.el = document.createTextNode(children)
  container.append(textNode)
}

function processFragment(vnode, container) {
  mountChildren(vnode, container)
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const { type, props } = vnode
  const el = vnode.el = document.createElement(type)
  // children
  mountChildren(vnode, el)

  // props
  const isOn = key => /^on[A-z]/.test(key)
  for (const propName in props) {
    const val = props[propName]
    if (isOn(propName)) {
      const eventType = propName.slice(2).toLocaleLowerCase()
      el.addEventListener(eventType, val)
    }
    else {
      el.setAttribute(propName, val)
    }
  }

  // mount
  container.appendChild(el)
}

function mountChildren(vnode, container) {
  const { children, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    container.textContent = children
  }
  else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    children.forEach((child) => {
      patch(child, container)
    })
  }
}

export function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

export function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, vnode, container)
}

export function setupRenderEffect(instance, vnode, container) {
  const { proxy } = instance
  // component -> children vnode
  const subTree = instance.render.call(proxy)
  // children vnode -> mount
  patch(subTree, container)
  // 因为 组件 没有 el，从组件第一个元素节点获取 el
  vnode.el = subTree.el
}

