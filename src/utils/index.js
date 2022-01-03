
/**
 * 判断是否是对象
 * @param {any} target any
 * @returns true | false
 */
export function isObject(target) {
    return target !== null && typeof target === 'object';
}