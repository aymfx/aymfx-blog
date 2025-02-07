# computed

```ts
import { isFunction } from '@vue3/shared';
import { ReactiveEffect } from './effect';
import { trackRefValue, triggerRefValue } from './ref';

export class ComputedRefImpl {
  public _value;
  public effect;
  public dep;
  constructor(public getter, public setter) {
    // 我们需要创建一个effect 来关联当前计算属性的dirty属性
    this.effect = new ReactiveEffect(
      () => getter(this._value), // 用户的fn  state.name
      () => {
        triggerRefValue(this); // 依赖的属性变化后需要触发重新渲染，还需要将dirty变为true
      }
    );
  }
  get value() {
    // 让计算属性收集对应的effect
    // 这里我们需要做处理
    if (this.effect.dirty) {
      // 默认取值一定是脏的，但是执行一次run后就不脏了
      this._value = this.effect.run();
      trackRefValue(this);
      // 如果当前在effect中访问了计算属性，计算属性是可以收集这个effect的
    }
    return this._value;
  }
  set value(v) {
    // 这个就是ref的setter
    this.setter(v);
  }
}

/* function computed<T>(
  getter: (oldValue: T | undefined) => T,
  // 查看下方的 "计算属性调试" 链接
  debuggerOptions?: DebuggerOptions
): Readonly<Ref<Readonly<T>>>

// 可写的
function computed<T>(
  options: {
    get: (oldValue: T | undefined) => T
    set: (value: T) => void
  },
  debuggerOptions?: DebuggerOptions
): Ref<T> */

export function computed(getterOrOptions) {
  let getter;
  let setter;
  // 只有getter
  let onlyGetter = isFunction(getterOrOptions);

  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {};
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
```
