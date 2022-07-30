export function transform(root, options) {
  const context = createTransformContext(root, options)
  // 1. 遍历 - 深度优先
  traverseNode(root, context)
}

function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms

  for (const transformFn of nodeTransforms)
    transformFn(node)

  traverseChildren(node.children, context)
}

function traverseChildren(children, context) {
  if (!children) return

  for (const childNode of children)
    traverseNode(childNode, context)
}

function createTransformContext(root, options) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  }

  return context
}
