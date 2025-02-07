# Effect

```ts
import { DirtyLevels } from './constant';

// 导出activeEffect 当有人访问effect的时候 就会把这个effect放到activeEffect中
export let activeEffect;

function cleanDepEffect(dep, effect) {
  dep.delete(effect);
  if (dep.size == 0) {
    dep.cleanup(); // 如果map为空，则删除这个属性
  }
}

function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; // 每次执行id 都是+1， 如果当前同一个effect执行，id就是相同的
}

function postCleanEffect(effect) {
  // [flag,a,b,c]
  // [flag]  -> effect._depsLength = 1
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect); // 删除映射表中对应的effect
    }
    effect.deps.length = effect._depsLength; // 更新依赖列表的长度
  }
}

export function trackEffect(effect, dep) {
  // 收集时一个个收集的
  // 需要重新的去收集依赖 ， 将不需要的移除掉
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId); // 更新id
    let oldDep = effect.deps[effect._depsLength]; //从第0个开始找旧值
    if (oldDep !== dep) {
      if (oldDep) {
        // 删除掉老的
        cleanDepEffect(oldDep, effect);
      }
      // 换成新的
      effect.deps[effect._depsLength++] = dep; // 永远按照本次最新的来存放
    } else {
      effect._depsLength++;
    }
  }
}

// 触发依赖
export function triggerEffects(dep) {
  // 遍历dep 找到所有的effect 执行
  for (const [effect, id] of dep) {
    // 当前这个值是不脏的，但是触发更新需要将值变为脏值

    // 属性依赖了计算属性， 需要让计算属性的drity在变为true
    if (effect._dirtyLevel < DirtyLevels.Dirty) {
      effect._dirtyLevel = DirtyLevels.Dirty;
    }
    if (!effect._running) {
      if (effect.scheduler) {
        // 如果不是正在执行，才能执行
        effect.scheduler(); //
      }
    }
  }
}

export const effect = (fn, options?) => {
  // 每次执行effect的时候 都会创建一个新的effect
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });

  // 默认会执行一次
  _effect.run();

  if (options) {
    Object.assign(_effect, options); // 用用户传递的覆盖掉内置的
  }
  // 返回一个runner函数 调用runner函数就会执行effect
  const runner = _effect.run.bind(_effect);
  // 将effect挂载到runner上
  runner.effect = _effect;

  return runner;
};

// 创建一个响应式的effect
export class ReactiveEffect {
  public active = true; // 创建的effect是响应式的
  _trackId = 0; // 用于记录当前effect执行了几次
  _depsLength = 0; // 存了几个effect
  deps = []; // 存放effect
  _dirtyLevel = DirtyLevels.Dirty; // 脏值
  _running = 0; // 正在执行的effect
  constructor(public fn, public scheduler) {}

  public get dirty() {
    return this._dirtyLevel === DirtyLevels.Dirty;
  }

  public set dirty(v) {
    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NoDirty;
  }

  run() {
    this._dirtyLevel = DirtyLevels.NoDirty; // 每次运行后effect变为no_dirty
    if (!this.active) {
      return this.fn();
    }

    // 如果是effect嵌套的话，需要记录上一次的effect
    let lastEffect = activeEffect;
    try {
      // 这里的this是当前的effect
      activeEffect = this;

      // 每次执行effect之前，需要将之前的effect清除掉
      preCleanEffect(this);
      // 执行+1
      this._running++;
      return this.fn();
    } finally {
      // 还原上一次的effect
      activeEffect = lastEffect;
      // 结束了-1
      this._running--;
      postCleanEffect(this);
    }
  }

  stop() {
    if (this.active) {
      this.active = false;
      preCleanEffect(this);
      postCleanEffect(this);
    }
  }
}
```
