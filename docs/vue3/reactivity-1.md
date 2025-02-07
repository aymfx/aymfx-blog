# 响应式模块的核心

## Vue3 响应式核心

1. **Proxy 代理**

- Vue3 采用 Proxy 代替 Vue2 的 Object.defineProperty
- Proxy 可以直接监听对象和数组的变化
- 不需要像 Vue2 那样递归遍历每个属性，性能更好
- 可以监听到动态添加的属性，不需要通过 Vue.set

2. **响应式 API**

- ref：处理基本类型数据
- reactive：处理对象类型数据
- computed：计算属性
- watch/watchEffect：侦听数据变化

## 组合式 API 的优势

1. **更好的代码组织**

- 相关联的代码可以组织在一起
- 不再像选项式 API 那样将代码分散在不同选项中
- 提高了代码的可读性和可维护性
- 大型组件可以更容易地拆分成小函数

2. **更好的逻辑复用**

- 能够轻松地提取和复用逻辑
- 通过组合函数（Composables）实现逻辑的模块化
- 避免了 mixins 的缺点（命名冲突、数据来源不清晰）

3. **更好的类型推导**

- 组合式 API 对 TypeScript 的支持更好
- 不需要额外的类型声明就能获得完整的类型推导

4. **更小的打包体积**

- 更好的 tree-shaking
- 没有使用到的功能可以被完全移除

## 实现 reactive 和 effect

reactiveAPI 是可以将普通对象变成响应式对象
effectAPI 我们在使用 reactive 对象的时候会收集依赖，如果响应式对象的值发生变化 会触发更新

编写一个 html 然后引用 reactivity.esm-browser.js ，看下实现效果

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title></title>
  </head>

  <body>
    <div id="app"></div>
    <script type="module">
      import {
        reactive,
        effect,
      } from '/node_modules/@vue/reactivity/dist/reactivity.esm-browser.js';
      const state = reactive({ name: 'aymfx', age: 30 });
      effect(() => {
        // 副作用函数 默认执行一次，响应式数据变化后再次执行
        app.innerHTML = state.name + '今年' + state.age + '岁了';
      });
      setTimeout(() => {
        state.age++;
      }, 1000);
    </script>
  </body>
</html>
```

