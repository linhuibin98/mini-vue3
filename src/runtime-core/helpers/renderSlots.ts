import { isFunction } from '../../shared'
import { Fragment, createVNode } from '../vnode'

export function renderSlots(slots, slotName, props) {
  const slot = slots[slotName]
  if (slot) {
    // function
    if (isFunction(slot))
      return createVNode(Fragment, {}, slot(props))
  }
}
