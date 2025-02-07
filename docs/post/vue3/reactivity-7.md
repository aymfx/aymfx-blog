# baseHandler

```ts
import { ReactiveFlags } from './constant';
import { track, trigger } from './reactiveEffect';

// 创建一个响应式对象的处理器
export const mutableHandlers: ProxyHandler<any> = {
  get(target, key) {
    // 1. 判断是不是已经代理过了 __v_isReactive是一个不存在的标记 如果存在就说明已经代理过了
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }

    // 收集依赖
    track(target, key);

    const res = Reflect.get(target, key);
    return res;
  },
  set(target, key, value, recevier) {
    let oldValue = target[key];

    let result = Reflect.set(target, key, value, recevier);
    if (oldValue !== value) {
      // 需要触发页面更新
      trigger(target, key);
    }
    // 触发更新 todo...
    return result;
  },
};
```
