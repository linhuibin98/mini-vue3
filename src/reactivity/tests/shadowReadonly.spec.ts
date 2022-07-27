import { isReadonly, shadowReadonly } from '../reactive'

describe('readonly', () => {
  it('nested shadowReadonly', () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    }

    const props = shadowReadonly(original)

    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.nested)).toBe(false)
    expect(isReadonly(props.array)).toBe(false)
    expect(isReadonly(props.array[0])).toBe(false)
  })

  it('warn when call set', () => {
    const original = {
      foo: 1,
    }
    console.warn = jest.fn()
    const props = shadowReadonly(original)

    expect(isReadonly(props)).toBe(true)
    props.foo = 2
    expect(props.foo).toBe(1)
    expect(console.warn).toHaveBeenCalledTimes(1)
  })
})
