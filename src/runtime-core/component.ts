import { isObject } from '../shared'
import { publicInstanceProxyHandlers } from './componentPublicInstance'

export function createComponentInstance(vnode) {
  const componentInstance = {
    vnode,
    type: vnode.type,
  }

  return componentInstance
}

export function setupComponent(instance) {
  // TODO
  // initProps
  // initSlots

  setupStatefulComponent(instance)
}

export function setupStatefulComponent(instance) {
  const Component = instance.type

  // ctx
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    // function or object
    const setupResult = setup()
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

export function initProps() {}
