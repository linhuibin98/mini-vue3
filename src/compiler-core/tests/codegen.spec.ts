import { baseParse } from '../src'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'
import { transformElement } from '../src/transforms/transformElement'
import { transformExpression } from '../src/transforms/transformExpression'
import { transformText } from '../src/transforms/transformText'

describe('codegen', () => {
  it('gen text', () => {
    const source = 'Hi'
    const ast = baseParse(source)

    transform(ast)

    expect(generate(ast)).toMatchSnapshot()
  })

  it('gen interpolation', () => {
    const source = '{{message}}'
    const ast = baseParse(source)

    transform(ast, {
      nodeTransforms: [transformExpression],
    })

    expect(generate(ast)).toMatchSnapshot()
  })

  it('gen element', () => {
    const source = '<div></div>'
    const ast = baseParse(source)

    transform(ast, {
      nodeTransforms: [transformElement],
    })

    expect(generate(ast)).toMatchSnapshot()
  })

  it('gen element and text and interpolation', () => {
    const source = '<div>Hi,{{message}}</div>'
    const ast = baseParse(source)

    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText],
    })

    expect(generate(ast)).toMatchSnapshot()
  })
})
