/**
 * 判断对象是否为数组
 * @param obj
 * @returns
 */
function isArray(obj: any) {
  return obj && typeof obj == 'object' && obj instanceof Array;
}

/**
 * 对象深拷贝
 * @param source
 * @returns
 */
export function deepClone<T>(source: T, target?: Record<string, any> | T): T {
  if (isArray(source)) {
    target = target || [];
  } else {
    target = target || {};
  }
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && typeof source[key] !== null) {
        target[key] = isArray(source[key]) ? [] : {};
        deepClone(source[key], target[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target as T;
}
