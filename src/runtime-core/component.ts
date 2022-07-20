import { shadowReadonly } from '../reactivity'
import { isObject } from '../shared'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { publicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

export function createComponentInstance(vnode) {
  const componentInstance = {
    vnode,
    type: vnode.type,
    props: {},
    slots: {},
    emit: () => {},
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
    // function or object
    const setupResult = setup(shadowReadonly(instance.props), {
      emit: instance.emit,
      slots: instance.slots,
    })
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult) {
  // TODO function

  // object
  if (isObject(setupResult))
    instance.setupState = setupResult

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type

  if (Component.render)
    instance.render = Component.render
}
