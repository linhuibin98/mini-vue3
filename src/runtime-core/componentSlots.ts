import { toArray } from '../shared'

export function initSlots(instance, children) {
  // children -> object
  normalizeObjectSlots(children, instance.slots, instance.props)
}

function normalizeObjectSlots(children, slots) {
  for (const key in children) {
    if (Object.prototype.hasOwnProperty.call(children, key)) {
      const slot = children[key]
      slots[key] = props => toArray(slot(props))
    }
  }
}
