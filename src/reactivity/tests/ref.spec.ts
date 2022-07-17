import { effect } from '../effect'
import { reactive } from '../reactive'
import { isRef, proxyRefs, ref, unref } from '../ref'

describe('ref', () => {
  it('basic', () => {
    const count = ref(1)

    expect(count.value).toBe(1)
  })

  it('should be reactive', () => {
    const count = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = count.value
    })

    expect(dummy).toBe(1)
    expect(calls).toBe(1)

    count.value = 2
    expect(dummy).toBe(2)
    expect(calls).toBe(2)
    // 设置同样的值，将不触发 trigger
    count.value = 2
    expect(calls).toBe(2)
  })

  it('isRef', () => {
    const val = 1
    const count = ref(val)
    const user = reactive({
      age: 1,
    })

    expect(isRef(count)).toBe(true)
    expect(isRef(val)).toBe(false)
    expect(isRef(user)).toBe(false)
  })

  it('unref', () => {
    const val = 1
    const count = ref(val)

    expect(unref(count)).toBe(1)
    expect(unref(val)).toBe(1)
  })

  it('proxyRefs', () => {
    const user = {
      name: 'Joo',
      age: ref(18),
    }

    const proxyUser = proxyRefs(user)

    expect(proxyUser.name).toBe('Joo')
    expect(proxyUser.age).toBe(18)
    expect(user.age.value).toBe(18)

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(22)
    expect(proxyUser.age).toBe(22)
    expect(user.age.value).toBe(22)

    proxyUser.name = ref('Boo')
    expect(proxyUser.name).toBe('Boo')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(user.name.value).toBe('Boo')
  })
})
