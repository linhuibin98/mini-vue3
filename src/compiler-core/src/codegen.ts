import { isString } from '../../shared'
import { NodeTypes } from './ast'
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperMapName } from './runtimeHelper'

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  // import
  if (ast.helpers.length > 0) {
    const vueBinging = 'Vue'
    const aliasHelper = v => `${helperMapName[v]}: _${helperMapName[v]}}`

    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${vueBinging}`)
    push('\n')
  }

  // return
  push('return ')

  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')

  push(`function ${functionName}(${signature}){`)
  push('return ')

  // ast 生成 code
  genNode(ast.codegenNode, context)

  push('}')

  return {
    code: context.code,
  }
}

function createCodegenContext() {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    },
  }

  return context
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    default:
      break
  }
}

function genCompoundExpression(node, context) {
  const { children } = node
  const { push } = context
  for (const childNode of children) {
    if (isString(childNode))
      push(childNode)

    else
      genNode(childNode, context)
  }
}

function genElement(node, context) {
  const { push, helper } = context
  const { tag, children, props } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullable([tag, props, children]), context)
  push(')')
}

function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node))
      push(node)

    else
      genNode(node, context)

    if (i < nodes.length - 1)
      push(', ')
  }
}

function genNullable(args) {
  return args.map(arg => arg || 'null')
}

function genText(node, context) {
  const { push } = context

  push(`'${node.content}'`)
}

function genInterpolation(node, context) {
  const { push, helper } = context

  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

function genExpression(node, context) {
  const { push } = context

  push(node.content)
}
