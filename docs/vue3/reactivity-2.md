### reactvie

```ts
import { isObject } from '@vue3/shared';
import { ReactiveFlags } from './constant';
import { mutableHandlers } from './baseHandler';

// 缓存响应式对象 防止重复代理
const reactiveMap = new WeakMap();

// 先创建一个响应式对象
function createReactiveObject(raw) {
  // 1.先判断是不是对象 是对象才进行响应式处理，不是就直接返回
  if (!isObject(raw)) {
    return raw;
  }

  // 2. 判断是不是代理对象
  if (raw[ReactiveFlags.IS_REACTIVE]) {
    return raw;
  }

  // 3. 判断原始对象是不是已经代理过了
  const existingProxy = reactiveMap.get(raw);
  if (existingProxy) {
    return existingProxy;
  }

  // 4. 没有代理过就创建一个代理对象
  const proxy = new Proxy(raw, mutableHandlers);

  // 5. 将代理对象和原始对象关联起来
  reactiveMap.set(raw, proxy);

  // 6. 返回代理对象
  return proxy;
}

// 创建一个响应式对象
export function reactive(raw) {
  return createReactiveObject(raw);
}

// 判断一个对象是否对象，如果是就返回代理对象，否则就返回原始对象
export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

// 判断一个对象是否是响应式对象
export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}
```
