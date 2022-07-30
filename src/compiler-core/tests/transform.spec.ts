import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parse'
import { transform } from '../src/transform'

describe('transform', () => {
  it.only('simple', () => {
    const ast = baseParse('<div>Hi,{{message}}</div>')

    const transformPlugin = (node) => {
      if (node.type === NodeTypes.TEXT)
        node.content = 'Hi, mini vue'
    }

    transform(ast, {
      nodeTransforms: [transformPlugin],
    })

    const nodeText = ast.children[0].children[0]

    expect(nodeText.content).toBe('Hi, mini vue')
  })
})
