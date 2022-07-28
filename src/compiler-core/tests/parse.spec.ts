import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parse'

describe('Parse interpolation', () => {
  it('simple interpolation', () => {
    const ast = baseParse('{{message}}')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'message',
      },
    })
  })
})

describe('Parse element', () => {
  it('simple element', () => {
    const ast = baseParse('<div></div>')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
    })
  })
})

describe('Parse text', () => {
  it('simple text', () => {
    const ast = baseParse('simple text')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.TEXT,
      content: 'simple text',
    })
  })
})
