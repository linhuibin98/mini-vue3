
/**
 * 判断是否是对象
 * @param {any} target any
 * @returns true | false
 */
export function isObject(target) {
    return target !== null && typeof target === 'object';
}

/**
 * 值是否有变化
 * @param {*} newValue 
 * @param {*} oldValue 
 * @returns 
 */
export function hasChanged(newValue, oldValue) {
    return !(Number.isNaN(newValue) && Number.isNaN(oldValue)) && newValue !== oldValue;
}

/**
 * 是否为数组
 * @param {*} target 
 * @returns bool
 */
export function isArray(target) {
    return Array.isArray(target);
}