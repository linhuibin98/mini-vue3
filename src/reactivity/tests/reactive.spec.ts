import { isProxy, isReactive, reactive } from '../reactive'

describe('reactive', () => {
  it('reactive', () => {
    const original = {
      foo: 1,
    }

    const observed = reactive(original)

    expect(observed).not.toBe(original)
    expect(isReactive(observed)).toBe(true)
    expect(isProxy(observed)).toBe(true)
    observed.foo = 2
    expect(observed.foo).toBe(2)
  })

  it('nested reactive', () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    }

    const observed = reactive(original)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
})
