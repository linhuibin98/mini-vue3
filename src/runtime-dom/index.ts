import { createRenderer } from '../runtime-core'

function createElement(type) {
  return document.createElement(type)
}

function patchProps(el, props) {
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
}

function insert(el, parent) {
  return parent.append(el)
}

function createTextNode(text) {
  return document.createTextNode(text)
}

const renderer = createRenderer({
  createElement,
  patchProps,
  insert,
  createTextNode,
})

export function createApp(rootComponent) {
  return renderer.createApp(rootComponent)
}

