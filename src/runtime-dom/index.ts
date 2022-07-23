import { createRenderer } from '../runtime-core'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, preValue, nextValue) {
  const isOn = key => /^on[A-z]/.test(key)

  if (isOn(key)) {
    const eventType = key.slice(2).toLocaleLowerCase()
    el.addEventListener(eventType, nextValue)
  }
  else {
    if (nextValue === undefined || nextValue === null)
      el.removeAttribute(key)

    else el.setAttribute(key, nextValue)
  }
}

function insert(el, parent) {
  return parent.append(el)
}

function createTextNode(text) {
  return document.createTextNode(text)
}

const renderer = createRenderer({
  createElement,
  patchProp,
  insert,
  createTextNode,
})

export function createApp(rootComponent) {
  return renderer.createApp(rootComponent)
}

