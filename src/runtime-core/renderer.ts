import { isArray, isObject, isString } from '../shared'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  patch(vnode, container)
}

export function patch(vnode, container) {
  // 处理元素
  if (isString(vnode.type)) {
    processElement(vnode, container)
  }
  else if (isObject(vnode.type)) {
    // 处理组件
    processComponent(vnode, container)
  }
}

export function processElement(vnode, container) {
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const { type, props } = vnode
  const el = vnode.el = document.createElement(type)
  // children
  mountChildren(vnode, el)

  // props
  for (const propName in props)
    el.setAttribute(propName, props[propName])

  // mount
  container.appendChild(el)
}

function mountChildren(vnode, container) {
  const { children } = vnode
  if (isString(children)) {
    container.textContent = children
  }
  else if (isArray(children)) {
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

