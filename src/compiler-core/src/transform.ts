import { NodeTypes } from './ast'
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING } from './runtimeHelper'

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  // 1. 遍历 - 深度优先
  traverseNode(root, context)

  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root) {
  const childNode = root.children[0]
  if (childNode.type === NodeTypes.ELEMENT)
    root.codegenNode = childNode.codegenNode

  else
    root.codegenNode = root.children[0]
}

function traverseNode(node, context) {
  const nodeTransforms = context.nodeTransforms
  const exitFns: any[] = []

  for (const transformFn of nodeTransforms) {
    const exitFn = transformFn(node, context)
    if (exitFn) exitFns.push(exitFn)
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node.children, context)
      break
    case NodeTypes.TEXT:
      context.helper(CREATE_ELEMENT_VNODE)
      break
    default:
      break
  }

  let i = exitFns.length

  while (i--)
    exitFns[i]()
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
