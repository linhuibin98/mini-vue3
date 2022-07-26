export function showUpdateComponent(preVNode, nextVNode) {
  const { props: nextProps } = nextVNode
  const { props: preProps } = preVNode

  for (const key in nextProps) {
    if (nextProps[key] !== preProps[key])
      return true
  }

  return false
}
