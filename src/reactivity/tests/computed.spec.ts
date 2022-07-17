import { computed } from '../computed'
import { reactive } from '../reactive'

describe('computed', () => {
  it('should ref', () => {

  })

  it('should compute lazy', () => {
    const value = reactive({
      foo: 1,
    })

    const getter = jest.fn(() => {
      return value.foo
    })

    const cValue = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(1)

    value.foo = 2
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
