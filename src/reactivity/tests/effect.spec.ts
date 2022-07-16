import { effect } from "../effect";
import { reactive } from "../reactive"

describe('effect', () => {
    it('reactive', () => {
        const user = reactive({
            age: 18
        })
        let nextAge;
        effect(() => {
            nextAge = user.age + 1
        })

        expect(nextAge).toBe(19)

        user.age++

        expect(nextAge).toBe(20)
    })

    it('runner', () => {
        let foo = 1;
        const runner = effect(() => {
            ++foo
            return 'foo';
        })

        expect(foo).toBe(2)
        const res = runner()
        expect(foo).toBe(3)
        expect(res).toBe('foo')
    })

    it('scheduler', () => {
        let dummy;
        let run;
        const scheduler = jest.fn(() => {
            run = runner
        }) 
        const obj = reactive({
            foo: 1
        })
        const runner = effect(() => {
            dummy = obj.foo
        }, { scheduler })

        expect(scheduler).not.toHaveBeenCalled() // 第一次不是执行 scheduler
        expect(dummy).toBe(1) // 立马会执行传入的 fn

        obj.foo++
        expect(dummy).toBe(1) // 响应式数据变化应该调用的是 scheduler
        expect(scheduler).toHaveBeenCalledTimes(1)

        run() // 执行 runner 不会调用 scheduler
        expect(scheduler).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(2)
    })
})
