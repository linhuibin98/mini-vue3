import { proxyRefs, shadowReadonly } from '../reactivity'
import { isObject } from '../shared'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { publicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

let currentInstance: any = null // 当前组件实例

export function createComponentInstance(vnode, parent) {
  const componentInstance = {
    vnode,
    next: null, // 下次要更新的 vnode
    subTree: {},
    type: vnode.type,
    props: {},
    slots: {},
    emit: () => {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
  }

  componentInstance.emit = emit.bind(null, componentInstance) as any

  return componentInstance
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance)
}

export function setupStatefulComponent(instance) {
  const Component = instance.type

  // ctx
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    setCurrentInstance(instance)
    // function or object
    const setupResult = setup(shadowReadonly(instance.props), {
      emit: instance.emit,
      slots: instance.slots,
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  // TODO function

  // object
  if (isObject(setupResult))
    instance.setupState = proxyRefs(setupResult)

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type

  if (Component.render)
    instance.render = Component.render
}

export function getCurrentInstance() {
  return currentInstance
}

function setCurrentInstance(instance) {
  currentInstance = instance
}
