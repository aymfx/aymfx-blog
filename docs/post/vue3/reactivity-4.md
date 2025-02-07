# ref

```ts
import { isObject } from '@vue/shared';
import { toReactive } from './reactive';
import { activeEffect, trackEffect, triggerEffects } from './effect';
import { createDep } from './reactiveEffect';

function createRef(value: any) {
  return new RefImpl(value);
}

class RefImpl {
  public __v_isRef = true; // 增加ref标识
  public _value; // 用来保存ref的值的
  public dep; // 用于收集对应的effect
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue !== this.rawValue) {
      this.rawValue = newValue; // 更新值
      this._value = newValue;
      triggerRefValue(this);
    }
  }
}

export function trackRefValue(ref) {
  //   {
  //     "rawValue": 1,
  //     "__v_isRef": true,
  //     "_value": 1
  // }
  // 收集effect
  if (activeEffect) {
    ref.dep = ref.dep || createDep(() => (ref.dep = undefined), 'undefined');
    trackEffect(activeEffect, ref.dep);
  }
}

export function triggerRefValue(ref) {
  let dep = ref.dep;
  if (dep) {
    triggerEffects(dep); // 触发依赖更新
  }
}

// ref 可以接收对象，也可以接收基本类型
export function ref(value) {
  return createRef(value);
}

// toRef , toRefs

class ObjectRefImpl {
  public __v_isRef = true; // 增加ref标识
  constructor(public _object, public _key) {}
  get value() {
    return this._object[this._key];
  }
  set value(newValue) {
    this._object[this._key] = newValue;
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  let ret = isObject(object) ? {} : [];
  for (let key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}

export function isRef(value) {
  return value && value.__v_isRef;
}
```
