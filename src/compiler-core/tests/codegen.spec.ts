import { baseParse } from '../src'
import { generate } from '../src/codegen'
import { transform } from '../src/transform'
import { transformExpression } from '../src/transforms/transformExpression'

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
})
