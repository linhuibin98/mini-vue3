import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING, helperMapName } from './runtimeHelper'

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
    default:
      break
  }

  if (node.children && node.children.length > 0) {
    for (const childNode of node.children)
      genNode(childNode, context)
  }
}

function genElement(node, context) {
  // TODO
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
