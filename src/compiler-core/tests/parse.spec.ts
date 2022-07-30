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
      children: [],
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

describe('Parse interpolation element text', () => {
  it('simple', () => {
    const ast = baseParse('<div>Hi,{{message}}</div>')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'Hi,',
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message',
          },
        },
      ],
    })
  })

  it('nested element', () => {
    const source = '<div><p>Title</p>{{message}}</div>'
    const ast = baseParse(source)

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'p',
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'Title',
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message',
          },
        },
      ],
    })
  })

  it('should throw error when lack end tag', () => {
    const source = '<div><span></div>'

    expect(() => baseParse(source)).toThrowError('缺少结束标签：span')
  })
})
