import { isFunction } from '../../shared'
import { createVNode } from '../vnode'

export function renderSlots(slots, slotName, props) {
  const slot = slots[slotName]
  if (slot) {
    // function
    if (isFunction(slot))
      return createVNode('div', {}, slot(props))

    return createVNode('div', {}, slot)
  }
}
