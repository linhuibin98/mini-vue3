import { isProxy, isReadonly, readonly } from '../reactive'

describe('readonly', () => {
  it('readonly', () => {
    const original = {
      foo: 1,
    }

    const observed = readonly(original)

    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReadonly(observed)).toBe(true)
    expect(isProxy(observed)).toBe(true)
  })

  it('warn when call set', () => {
    const original = {
      foo: 1,
    }
    console.warn = jest.fn()
    const observed = readonly(original)

    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)
    expect(isReadonly(observed)).toBe(true)
    observed.foo = 2
    expect(observed.foo).toBe(1)
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('nested readonly', () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    }

    const observed = readonly(original)

    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(observed.nested)).toBe(true)
    expect(isReadonly(observed.array)).toBe(true)
    expect(isReadonly(observed.array[0])).toBe(true)
  })
})
