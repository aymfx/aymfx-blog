# reactiveEffect

```ts
import { activeEffect, trackEffect, triggerEffects } from './effect';

const targetMap = new WeakMap(); // 存放依赖收集的关系

// 依赖收集 key: dep
// 一个key 可能会有多个effect 所以dep是一个set,cleanup是一个函数,用来清除effect
export function createDep(cleanup, key) {
  const dep = new Map() as any;
  dep.cleanup = cleanup;
  dep.speaclName = key;
  return dep;
}

export const track = (target: any, key: string | symbol) => {
  // 先判断是否有activeEffect
  // 如果没有activeEffect 说明没有调用effect 直接return
  if (!activeEffect) return;
  // 从targetMap中获取target对应的map
  let depsMap = targetMap.get(target);
  // 如果没有depsMap 就创建一个
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 从depsMap中获取key对应的set
  let dep = depsMap.get(key);

  // 如果没有dep 就创建一个
  if (!dep) {
    dep = createDep(() => () => depsMap.delete(key), key);
    depsMap.set(key, dep);
  }
  // 将activeEffect添加到dep中
  trackEffect(activeEffect, dep); // 将当前的effect放入到dep（映射表）中， 后续可以根据值的变化触发此dep中存放的effect
};

export const trigger = (target: any, key: string | symbol) => {
  // 从targetMap中获取target对应的map
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    // 找不到对象 直接return即可
    return;
  }
  let dep = depsMap.get(key);
  if (dep) {
    // 修改的属性对应了effect
    triggerEffects(dep);
  }
};
```
