import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelper'

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  // 1. 遍历 - 深度优先
  traverseNode(root, context)

  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root) {
  root.codegenNode = root.children[0]
}

function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms

  for (const transformFn of nodeTransforms)
    transformFn(node)

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node.children, context)
      break
    default:
      break
  }
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
    helpers: new Map(),
    helper(key) {
      if (!context.helpers.has(key))
        context.helpers.set(key, 1)
    },
  }

  return context
}
