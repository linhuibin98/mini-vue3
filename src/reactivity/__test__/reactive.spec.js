import { reactive, isReactive } from '../reactive';

describe('reactive', () => {
    test('isReactive', () => {
        const original = { count: 0 };
        const observed = reactive(original);
        expect(isReactive(original)).toBe(false);
        expect(isReactive(observed)).toBe(true);
    });
});
