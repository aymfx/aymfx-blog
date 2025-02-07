# apiWatch

```ts
import { isFunction, isObject } from '@vue3/shared';
import { isReactive } from './reactive';
import { isRef } from './ref';
import { ReactiveEffect } from './effect';

function traverse(source, depth, currentDepth = 0, seen = new Set()) {
  if (!isObject(source)) {
    return source;
  }
  if (depth) {
    if (currentDepth >= depth) {
      return source;
    }
    currentDepth++; // 根据deep 属性来看是否是深度
  }
  if (seen.has(source)) {
    return source;
  }

  // 遍历就会触发每个属性的get
  for (let key in source) {
    traverse(source[key], depth, currentDepth, seen);
  }

  return source;
}
export function doWatch(source, cb, { deep, immediate }) {
  // source ?  -> getter
  // 先把source 变成一个getter
  const reactiveGetter = (source) =>
    traverse(source, deep === false ? 1 : undefined);

  // 产生一个可以给ReactiveEffect 来使用的getter， 需要对这个对象进行取值操作，会关联当前的reactiveEffect
  let getter;
  if (isReactive(source)) {
    getter = () => reactiveGetter(source);
  } else if (isRef(source)) {
    // 是ref对象
    getter = () => source.value;
  } else if (isFunction(source)) {
    // 是函数
    getter = source;
  }
  let oldValue;

  // 清理操作
  let clean;
  const onCleanup = (fn) => {
    clean = () => {
      fn();
      clean = undefined;
    };
  };

  // 当用户的回调执行的时候，会执行job
  const job = () => {
    if (cb) {
      const newValue = effect.run();

      if (clean) {
        clean(); //  在执行回调前，先调用上一次的清理操作进行清理
      }

      cb(newValue, oldValue, onCleanup);
      oldValue = newValue;
    } else {
      effect.run(); // watchEffect
    }
  };
  const effect = new ReactiveEffect(getter, job);
  if (cb) {
    if (immediate) {
      // 立即先执行一次用户的回调，传递新值和老值
      job();
    } else {
      oldValue = effect.run();
      console.log(oldValue, 'oldValue');
    }
  } else {
    // watchEffect
    effect.run(); // 直接执行即可
  }

  const unwatch = () => {
    effect.stop();
  };

  return unwatch;
}

export function watch(source, cb, options = {} as any) {
  // watchEffect 也是基于doWatch来实现的
  return doWatch(source, cb, options);
}
```
