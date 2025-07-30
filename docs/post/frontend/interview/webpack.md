# webpack

## 理解 vue3 中 webpack 的工作原理

### Loader 和 Plugin 的使用

| 名称                  | 类型   | 作用                                                                                                                                                                                                          |
| :-------------------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vue-loader`          | Loader | **（核心）** 解析 `.vue` 文件，将 `<template>`, `<script>`, `<style>` 拆分并交给其它 loader 处理。                                                                                                            |
| `@vue/compiler-sfc`   | 依赖   | **（Vue 3 必需）** `vue-loader` v16+ (用于 Vue 3) 需要它来编译 `<template>` 部分。它被 `vue-loader` 内部调用。                                                                                                |
| `VueLoaderPlugin`     | Plugin | **（核心）** 它的作用是配合 `vue-loader`，将你为 `.js` 或 `.css` 等文件配置的 loader 规则，应用到 `.vue` 文件内的 `<script>` 和 `<style>` 块上。**没有它，**`babel-loader`** 将不会处理 **`<script>`** 块！** |
| `babel-loader`        | Loader | 用来处理 `<script>` 块中的 JavaScript 代码，将其转换为浏览器兼容的格式。                                                                                                                                      |
| `vue-style-loader`    | Loader | 将 `css-loader` 处理后的 CSS，通过 `<style>` 标签动态注入到 HTML 的 `<head>` 中。                                                                                                                             |
| `css-loader`          | Loader | 负责解析 CSS 中的 `@import` 和 `url()` 语法。                                                                                                                                                                 |
| `html-webpack-plugin` | Plugin | 创建一个 HTML 文件，并自动将 Webpack 打包后的 JS 文件（如 `bundle.js`）注入进去。                                                                                                                             |

### 他们扮演的角色

1. Webpack 开始构建，遇到入口文件（如 `main.js`）。
2. `main.js` 中 `import App from './App.vue'`，Webpack 看到了 `.vue` 后缀。
3. 根据 `module.rules`，Webpack 将 `App.vue` 文件交给 `vue-loader` 处理。
4. `vue-loader` 解析 `App.vue` 文件：
   - 发现 `<template>`，调用 `@vue/compiler-sfc` 将其编译成渲染函数（Render Function）。
   - 发现 `<script>`，将其内容提取出来。
   - 发现 `<style>`，将其内容提取出来。
5. `VueLoaderPlugin` **发挥作用**。它会克隆你的所有 loader 规则。当 `vue-loader` 提取出 `<script>` 内容时，`VueLoaderPlugin` 会确保 `babel-loader` 的规则能匹配并处理这段 JS 代码。同理，`<style>` 内容会被 `vue-style-loader` 和 `css-loader` 组成的链条处理。
6. `css-loader` 首先处理 CSS，解析 `@import` 等。
7. 处理结果交给 `vue-style-loader`，它会生成一段 JS 代码，这段代码的逻辑是在运行时将样式动态插入到 `<head>`。
8. 所有代码块都处理完毕后，合并成最终的 JavaScript 模块。
9. 所有模块打包完成后，`HtmlWebpackPlugin` 生成 `index.html` 并把最终的 JS 文件路径写进去。

![](https://raw.githubusercontent.com/vuejs/vue-loader/master/docs/flow.png)

```javascript
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // 开发模式
  entry: './src/main.js', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'bundle.js', // 输出文件名
    clean: true, // 每次构建前清理 dist 文件夹
  },
  devServer: {
    static: './dist', // 开发服务器根目录
  },
  module: {
    rules: [
      // 规则1: 处理 .vue 文件
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      // 规则2: 处理 .js 文件 (用于 .vue 中的 <script> 和独立的 .js 文件)
      {
        test: /\.js$/,
        exclude: /node_modules/, // 排除 node_modules
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      // 规则3: 处理样式文件 (loader 从右到左执行: css-loader -> vue-style-loader)
      {
        test: /\.css$/,
        use: [
          'vue-style-loader', // 将样式注入到 <style> 标签
          'css-loader', // 解析 @import 和 url()
        ],
      },
    ],
  },
  plugins: [
    // 插件1: VueLoaderPlugin 必须！
    new VueLoaderPlugin(),
    // 插件2: HtmlWebpackPlugin 自动生成 index.html
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'), // 以这个文件为模板
      inject: 'body', // 将脚本注入到 body
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
    extensions: ['.js', '.vue', '.json'],
  },
};
```

### 开发环境用 style-loader，生产环境抽离成独立 CSS 文件

**目标**

- 开发环境 (Development): CSS 内联在 JS 中，通过 \<style\> 标签注入。优点是热更新（HMR）速度快。
- 生产环境 (Production): CSS 被提取成独立的 .css 文件，通过 \<link\> 标签引入。优点是利用浏览器缓存，减小 JS 文件体积。

**核心**

- **Plugin:** `MiniCssExtractPlugin`
- **Loader:** `MiniCssExtractPlugin.loader`

#### 工作原理

1. `css-loader`**的角色不变：** 它的任务依然是解析 CSS 中的 `@import` 和 `url()`。
2. `MiniCssExtractPlugin.loader`**替换 **`vue-style-loader`**：**
   - 在生产模式下，当 Webpack 构建时，这个 loader 会取代 `vue-style-loader` 的位置。
   - 它不会将 CSS 转换成要注入页面的 JS 代码。相反，它会 **拦截** 所有处理过的 CSS 内容，并将其 **导出为一个临时的、可被插件识别的模块**。它本身几乎不产生可执行的 JS 代码。
3. `new MiniCssExtractPlugin()`** 在构建后期发挥作用：**
   - 在 Webpack 完成所有模块的加载和处理后，进入插件（plugins）处理阶段。
   - 这个插件会 **遍历所有被 **`MiniCssExtractPlugin.loader`** 标记过的 CSS 模块**。
   - 它将这些模块的内容 **合并** 起来，生成一个或多个独立的 `.css` 文件（例如 `main.css`）。
   - 最后，`HtmlWebpackPlugin` 在生成 `index.html` 时，会自动感知到这些新产出的 `.css` 文件，并以 `<link rel="stylesheet" href="main.css">` 的形式将其插入到 `<head>` 标签中。

**一句话总结原理：** `loader` 在模块处理阶段负责“收集”CSS，`plugin` 在构建收尾阶段负责将收集到的 CSS “写入”到独立文件中。

`webpack.config.js`

这是最关键的一步，我们需要动态地调整 `rules` 和 `plugins`。

```javascript
// webpack.config.js

const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 1. 引入插件

// 2. 判断当前环境
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // 根据环境设置 mode
  mode: isProduction ? 'production' : 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    // 3. 生产环境下为输出文件添加 hash，防止缓存问题
    filename: isProduction ? 'js/[name].[contenthash:8].js' : 'bundle.js',
    clean: true,
  },
  // ... 其他配置如 devServer ...
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          // 4. 根据环境使用不同的 loader
          isProduction ? MiniCssExtractPlugin.loader : 'vue-style-loader',
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      inject: 'body',
    }),
    // 5. 只有在生产环境中才使用 MiniCssExtractPlugin
    //    使用展开运算符和三元表达式可以很优雅地实现
    ...(isProduction
      ? [
          new MiniCssExtractPlugin({
            // 为输出的 CSS 文件也添加 hash
            filename: 'css/[name].[contenthash:8].css',
          }),
        ]
      : []),
  ],
  // ... resolve 配置 ...
};
```

**代码讲解：**

1. `isProduction`**变量：** 成为我们所有决策的依据。
2. `output.filename`**：** 在生产环境中，我们给输出的 JS 文件名加上 `[contenthash:8]`。`contenthash` 会根据文件内容生成一个唯一的 8 位哈希值。只有当文件内容改变时，哈希才会变，这样浏览器就可以安全地缓存旧文件。
3. `module.rules`**中的条件判断：** `use` 数组的第一个 loader 根据 `isProduction` 的值动态决定是 `MiniCssExtractPlugin.loader` 还是 `vue-style-loader`。
4. `plugins`**中的条件判断** 我们使用 `...` (展开运算符) 和一个三元表达式。如果 `isProduction` 是 `true`，就展开 `[new MiniCssExtractPlugin()]` 这个数组，将其添加到 `plugins` 列表中。如果是 `false`，就展开一个空数组 `[]`，等于什么都没加。这是一种比 `if/else` 更简洁、更常用的写法。
5. `MiniCssExtractPlugin`**的 **`filename`** 选项：** 同样，我们也给抽离出的 CSS 文件加上 `contenthash`，以实现最佳的缓存策略。

现在，运行 `npm run serve`，CSS 依然是内联的。运行 `npm run build`，你会发现 `dist` 文件夹下出现了独立的 `css` 目录和带有哈希值的 CSS 文件，并且 `index.html` 会自动链接它。

### 组件懒加载

**原理：动态导入 `import()`**

当 Webpack 在编译时遇到 `import('path/to/module')` 语法，它会将其理解为：“这个模块不是立即需要的，不要把它打包进主文件（`bundle.js`）里”。

于是，Webpack 会：

1. **创建一个新的代码块（Chunk）：** 将 `path/to/module.vue` 及其所有独有的依赖项打包成一个独立的 JS 文件（例如 `1.bundle.js`）。
2. **返回一个 Promise：** 原始的 `import()` 语句在运行时会返回一个 Promise。当浏览器需要加载这个路由时，它会执行这个函数，发起一个网络请求去获取那个独立的 JS 文件。文件加载并执行成功后，Promise 会 resolve，返回模块的内容，Vue Router 接着渲染组件。

这就是最基础的、由 Webpack 自动完成的代码分割。

**给分割的 Chunk 命名**

Webpack 默认会用数字（如 `0.js`, `1.js`）来命名分割出的文件，这对于调试非常不友好。我们可以通过两种方式优化命名：

- 使用 `output.chunkFilename`

这个配置项专门用来指定非入口（non-entry）chunk 的文件名。

```javascript
// webpack.config.js
module.exports = {
  // ...
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js', // 入口文件的命名
    // 新增：给动态导入的 chunk 命名
    chunkFilename: 'js/[name].[contenthash:8].js',
    clean: true,
  },
  // ...
};
```

这里的 `[name]` 是一个占位符。但 `import()` 默认没有名字，Webpack 怎么知道 `[name]` 是什么呢？这就引出了第二种方法。

- 使用 Webpack “魔法注释” (Magic Comments)

这是**最佳实践**。你可以在 `import()` 语句里添加一个特殊格式的注释，来给这个 chunk 指定一个名字。

```javascript
// 在你的路由配置中
const routes = [
  {
    path: '/print',
    // 在 import 中添加 webpackChunkName 注释
    component: () =>
      import(/* webpackChunkName: "print-view" */ '@/views/print/index.vue'),
  },
  {
    path: '/about',
    component: () =>
      import(/* webpackChunkName: "about-view" */ '@/views/about/index.vue'),
  },
];
```

### 分离公共模块

`optimization.splitChunks`、`import()`** 解决了页面模块的分割。但还有一个问题：如果 **`print/index.vue`** 和 **`about/index.vue`** 都依赖了同一个大型库（比如 **`lodash`** 或 **`echarts`**），默认情况下，**`lodash`\*\* 可能会被同时打包进这两个文件中，造成代码冗余。

**`optimization.splitChunks`** 就是为了解决这个问题而生的。它能自动分析模块间的依赖关系，将公共的模块提取成一个共享的 chunk。

- `chunks`
  - **作用**：决定对哪种类型的 chunk 进行代码分割。
  - **可选值**:
    - `'async'` (默认值): 只对动态导入的 chunk (即 `import()` 引入的) 进行分割。
    - `'initial'`: 只对入口 chunk (entry) 进行分割。
    - `'all'`: （最推荐）\*\* 不管是动态的还是入口的，都一视同仁。这样可以最大化地复用模块。例如，如果你的入口文件 `main.js` 和一个懒加载的 `About.vue` 都引入了 `axios`，`'all'` 模式可以将 `axios` 抽离到一个单独的文件中，供两者共享。
- `cacheGroups`:
  - 作用：定义自定义的分割规则，这是 `splitChunks` 最强大的地方。你可以根据路径、模块大小等条件，把符合规则的模块分到同一个组（即同一个 chunk）里。
  - 核心配置:
    - `test`: 一个正则表达式或函数，用来匹配模块的路径。
    - `name`: 分割出的 chunk 的名字。
    - `priority`: 优先级。当一个模块同时满足多个 `cacheGroups` 的规则时，优先级更高的规则会生效（数字越大，优先级越高）。

**一个经典的生产环境 **`**splitChunks**`** 配置：**

```javascript
// webpack.config.js
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      // 1. 选择对所有 chunk 生效
      chunks: 'all',

      // 2. 定义缓存组
      cacheGroups: {
        // 规则一：将所有来自 node_modules 的模块打包到一个叫 vendors 的 chunk 中
        vendors: {
          test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 目录
          name: 'vendors', // 生成的 chunk 名称
          priority: -10, // 优先级，负数表示较低
          reuseExistingChunk: true, // 如果一个模块已经被打包，则复用而不是重新生成
        },
        // 规则二：可以定义自己的公共模块
        common: {
          name: 'common',
          minChunks: 2, // 至少被2个入口文件引用才会打包
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  // ...
};
```

### 处理图片等静态资源

在 Webpack 4 及以前，我们需要 `file-loader` (处理文件路径) 和 `url-loader` (将小文件转为 Base64)。

**Webpack 5 引入了内置的“资源模块（Asset Modules）”**，完全取代了这些 loader。你不再需要安装它们。

核心配置：**`module.rules`** 中的 **`type`** 属性\*\*

资源模块有四种类型：

- `asset/resource`: 发送一个单独的文件并导出 URL。作用等同于 `file-loader`。
- `asset/inline`: 导出一个资源的 data URI (Base64)。作用等同于 `url-loader`。
- `asset/source`: 导出资源的源代码。作用等同于 `raw-loader`。
- `asset`: **（最常用）** 自动在 `resource` 和 `inline` 之间选择。默认情况下，小于 8kb 的文件会被视为 `inline` 模块，否则视为 `resource` 模块。你可以修改这个阈值。

```javascript
// webpack.config.js
module.exports = {
  // ...
  output: {
    // ...
    // 为资源文件指定输出目录和命名规则
    assetModuleFilename: 'assets/[name].[hash:8][ext]',
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset', // 关键！使用 asset 自动模式
        parser: {
          // 在这里自定义内联的阈值
          dataUrlCondition: {
            maxSize: 10 * 1024, // 设置为 10kb，小于10kb的图片会被转为 base64
          },
        },
        // Webpack 5.28.0+ 可以把 generator 配置移到这里
        // generator: {
        //   filename: 'images/[name].[hash:8][ext]'
        // }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource', // 字体文件通常直接作为资源文件
        // generator: {
        //   filename: 'fonts/[name].[hash:8][ext]'
        // }
      },
    ],
  },
  // ...
};
```

- `output.assetModuleFilename`: 这是一个全局配置，用于指定所有 `asset/resource` 类型文件的输出路径和名称。`[ext]` 是文件扩展名的占位符。
- `type: 'asset'`：告诉 Webpack 对匹配的文件启用此功能。
- `parser.dataUrlCondition.maxSize`：自定义 `asset` 模式下，被视为 `inline` 模块的文件大小上限（单位是字节）。

## 可视化地分析 Webpack 打包产物中各个模块的大小和依赖关系

`webpack-bundle-analyzer`这是分析 Webpack 产物的“瑞士军刀”。它会生成一个可交互的、矩形树图（Treemap）的网页，让你能直观地看到：

- 最终包里到底包含了哪些模块。
- 每个模块（以及它的依赖）占据多大的体积。
- 模块之间的父子关系。

## 优化技术：Tree Shaking

- **原理：** ESM 的导入导出关系是 **静态的**。这意味着 Webpack 在 **编译时** 就可以通过分析代码的字面量，100% 确定你 `import` 了什么、`export` 了什么，从而构建出清晰的依赖图。
- **对比 CommonJS (**`require`**)：** CommonJS 是 **动态的**。你可以写出 `if (condition) { require('module') }` 这样的代码，导入的模块路径可以是一个变量。不实际运行代码，Webpack 无法确定最终的依赖关系，因此无法安全地进行 Tree Shaking。库的作者必须表明其“无副作用” (**`sideEffects`**)\*\*

### 什么是副作用 (Side Effect)

当一个模块被 `import` 时，如果它不仅仅是导出变量，还会对外部环境产生影响（比如修改全局对象、自动执行代码、注入 CSS 样式等），这就叫副作用。 - 例如 `import 'core-js/stable';` (一个 polyfill) - 例如 `import './style.css';` (在 JS 中导入 CSS)

- `package.json` 中的 **`sideEffects`** 字段：
  - `"sideEffects": false`：这是库作者给 Webpack 的一个强力保证：“我的这个包是纯粹的，没有任何副作用。只要你发现没有代码用到我的 `export`，你就可以放心地把整个包从最终产物中移除。” 像 `lodash-es`、`vue-router` 等现代库都会设置这个。
  - `"sideEffects": ["*.css"]`：这告诉 Webpack：“我的 JS 文件是纯的，但请不要对 CSS 文件进行 Tree Shaking，因为只要 `import` 了它们，就应该被打包进去。”

### 开启生产模式 (**`mode: 'production'`**) 以激活代码压缩

- **原理：** Webpack 的 Tree Shaking 自身只负责**标记**出哪些是“死码”。真正**移除**这些代码的步骤，是由代码压缩工具（Webpack 5 默认是 **Terser**）完成的。
- 当你设置 `mode: 'production'` 时，Webpack 会自动启用 `TerserWebpackPlugin`。Terser 在压缩代码时，会发现那些被 Webpack 标记为 `/* unused harmony export ... */` 的代码，并将其彻底删除。

## webpack 启动慢的优化点

### **开启持久化缓存（你已经答对的核心）**

这是 Webpack 5 带来的“杀手级”特性，可以直接在配置中开启。

- **工具：** Webpack 5 内置的 `cache` 配置项。
- **原理：** 当 Webpack 第一次构建时，它会将模块的编译结果（例如被 `babel-loader` 处理后的代码）缓存到文件系统中（默认在 `node_modules/.cache/webpack`）。当你再次启动构建时，Webpack 会先检查源文件是否发生变化。如果没有，它会直接跳过所有昂贵的编译步骤（如 Babel 转译、Sass 编译等），直接从缓存中读取结果。这使得二次及后续的启动速度极快。

```javascript
module.exports = {
  // ...
  // 启用文件系统缓存
  cache: {
    type: 'filesystem', // 必须
    buildDependencies: {
      // 当配置文件或 node_modules 变动时，缓存将失效
      config: [__filename],
    },
  },
  // ...
};
```

### **开启多进程/多线程构建**

JavaScript 是单线程的，这意味着 Webpack 在执行所有 loader 和 plugin 时，默认都在一个线程里排队。对于像 Babel 转译这种 CPU 密集型任务，我们可以利用多核 CPU 的优势，并行处理。

- **工具：** `thread-loader`。
- **原理：** 你需要将 `thread-loader` 放置在你希望多线程处理的 loader（比如 `babel-loader`）之前。`thread-loader` 会为该 loader 创建一个独立的 worker 池。当有多个模块需要这个 loader 处理时，它们会被分发到不同的 worker 中并行执行，充分利用多核 CPU 资源，从而显著减少总的编译时间。

```javascript
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          // 关键：将 thread-loader 放在其他 loader 之前
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              cacheDirectory: true, // babel-loader 自身的缓存
            },
          },
        ],
      },
    ],
  },
  // ...
};
```

**注意：** 不要滥用 `thread-loader`。启动 worker 本身有开销，对于简单的、执行速度很快的 loader，使用它反而会减慢构建速度。只将它用于最耗时的操作上。

### **缩小搜索与编译的范围**

减少 Webpack 不必要的工作量，是另一种重要的优化思路。

- **工具：** `exclude`/`include`，以及 `resolve` 配置项。

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  // ...
  resolve: {
    // 尽量减少这里的数组长度
    extensions: ['.vue', '.js', '.json'],
    // 创建别名，一步到位
    alias: {
      '@': path.resolve(__dirname, 'src/'),
      vue$: 'vue/dist/vue.esm-bundler.js', // Vue 3 的推荐别名
    },
  },
  // ...
};
```

1. 精确指定 `loader` 的作用范围：
   - 使用 `exclude: /node_modules/` 是 必须的。`node_modules` 中的库都已经是编译好的 JS，我们绝不应该再用 `babel-loader` 去处理它们。
   - 使用 `include: path.resolve(__dirname, 'src')` 效果相同，但语义上更明确，只包含我们自己的源码。
2. 优化模块解析 (`resolve`)：
   - `resolve.extensions`：告诉 Webpack 在 `import` 一个文件但没有写后缀时，应该按什么顺序去尝试。列表越短、越常用，搜索就越快。
   - `resolve.alias`：为常用的模块路径创建别名。这不仅仅是为了方便，它能让 Webpack 直接定位文件，跳过复杂的逐级目录查找过程。

## 热模块替换（HMR）的工作原理

- `webpack-dev-server`后端总指挥部。它是一个 Express 服务器，负责两件事：1）提供静态资源服务；2）启动一个 WebSocket 服务，用于和浏览器双向通信。
- **Webpack:** 编译工厂。在 WDS 的命令下，进行增量编译。
- **浏览器:** 前线阵地。
- **Webpack HMR Runtime:** 潜伏在浏览器的特工。这是一段随 `bundle.js` 一起注入到浏览器的 JS 代码，它负责连接 WebSocket，并执行热更新逻辑。

**作战流程（从你按下 **`Ctrl+S`** 开始）：**

1. **文件变更:** 你修改了 `src/components/Button.vue` 并保存。WDS 的文件监听器（基于 `chokidar`）捕捉到了这个变化。
2. **增量编译:** WDS 不会重新编译所有文件，而是通知 Webpack：“只有 `Button.vue` 变了，快速对它进行增量编译！”。Webpack 迅速重新编译这个模块，并生成两个关键产物：
   - **一个更新清单 (Update Manifest):** 一个 `.json` 文件，内容类似 `{"c":["main"],"r":[],"m":["./src/components/Button.vue"]}`，告诉浏览器哪个 Chunk (c) 变化了。
   - **一个或多个更新模块 (Hot Update Chunk):** 一个 `.js` 文件，包含了 `Button.vue` 模块最新的代码。
3. **通知浏览器:** WDS 通过已经建立的 WebSocket 连接，向浏览器里的 HMR Runtime 发送一个简单的消息：“嘿，有更新了！新的编译 `hash` 是 `xxxxxxxx`”。
4. **浏览器请求更新:** HMR Runtime 收到消息后，知道自己落后了。它会立刻向 WDS 发起两次 HTTP 请求：
   - 首先请求 **更新清单** (`.json` 文件)。通过清单，它知道了是 `main` 这个 chunk 需要更新。
   - 然后请求 **更新模块** (`.js` 文件)。这个请求通常是通过动态创建 `<script>` 标签（JSONP 模式）实现的，以便执行更新模块的代码。
5. **执行热替换（魔法发生的地方）:**
   - 更新模块的 JS 代码被加载并执行。它不会直接替换旧代码，而是调用 `__webpack_require__.hmr.Update` 函数，将新模块注册到 HMR Runtime 中。
   - HMR Runtime 开始执行替换逻辑。它会顺着依赖图向上查找。从 `Button.vue` 开始，找到引用它的父模块，比如 `HomePage.vue`。
   - 它会检查 `HomePage.vue` 是否“接受”（accept）`Button.vue` 的更新。`vue-loader` 已经帮我们注入了这段逻辑。对于 Vue 组件，“接受”更新意味着：
     - 调用 `dispose` 钩子销毁旧的 `Button.vue` 实例。
     - 使用新加载的 `Button.vue` 模块，重新渲染组件，并与虚拟 DOM 进行比对（patch）。
   - 如果 `HomePage.vue` 也不能处理这个更新，它会继续向上冒泡，直到找到一个能够处理的“更新边界”，或者一直到入口文件。如果冒泡到顶层都无法处理，HMR 会失败，并最终 fallback 到刷新整个页面。

**总结:** HMR 是一个由 **WDS (监听和通信) + Webpack (增量编译) + HMR Runtime (浏览器端执行)** 共同完成的精妙闭环。

## Loader vs. Plugin 的本质区别

| 特性         | Loader (流水线工人)                                                                | Plugin (车间主任/流程总控)                                                                                        |
| :----------- | :--------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **职能**     | **转换 (Transform)**。负责将一种类型的文件（模块）转换为另一种。                   | **执行 (Execute)**。负责解决 Loader 无法完成的其他所有事情。                                                      |
| **作用域**   | **单个文件**。它一次只处理一个文件。                                               | **整个构建过程**。它能监听 Webpack 生命周期的各个阶段（`emit`, `done` 等）。                                      |
| **工作模式** | 链式调用。一个文件可以被多个 loader 依次处理（如 `sass-loader` -> `css-loader`）。 | 事件监听。在 `webpack.config.js` 的 `plugins` 数组中注册，然后 Webpack 在特定时机会调用它。                       |
| **核心**     | 它是一个 **函数**，输入是文件内容，输出是转换后的内容。                            | 它是一个 **带 **`apply`** 方法的类**。Webpack 在初始化时会调用 `plugin.apply(compiler)`，将 compiler 实例传给它。 |
| **判断标准** | “我需要 **改变一个文件** 的内容吗？” -> 用 Loader。                                | “我需要在 **构建流程中做一些事** 吗？”（如打包优化、资源管理、注入环境变量） -> 用 Plugin。                       |

#### 版权声明 plugin

- **Loader 的局限性：** 你的目标是在 **最终打包产物** 的顶部添加注释。这些产物（如 `main.js`, `vendors.js`）是 Webpack 将无数个源文件 **打包合并后** 的结果。Loader 工作在打包合并 **之前**，它只能处理单个的源文件（如 `a.js`, `b.js`）。你用 Loader 无法触及到最终的 `bundle`。
- **Plugin 的优势：** Plugin 可以在整个构建流程的最后阶段——`emit` 钩子——介入。这个钩子在 Webpack 即将把最终产物写入磁盘时触发。此时，你可以通过 `compilation.assets` 对象访问到所有即将生成的最终文件。

```javascript
class CopyrightWebpackPlugin {
  apply(compiler) {
    // emit 钩子是异步的
    compiler.hooks.emit.tapAsync(
      'CopyrightWebpackPlugin',
      (compilation, callback) => {
        // 遍历所有即将生成的资源
        for (const assetName in compilation.assets) {
          // 只给 .js 文件添加
          if (assetName.endsWith('.js')) {
            const content = compilation.assets[assetName].source(); // 获取原始内容
            const newContent = `/** Copyright by MyCompany **/\n${content}`; // 添加注释

            // 更新资源
            compilation.assets[assetName] = {
              source: () => newContent,
              size: () => newContent.length,
            };
          }
        }
        callback(); // 完成处理
      }
    );
  }
}
```

## DLL (动态链接库)

**1. 双配置的角色：分工明确**
实现 DLL 的核心思想就是 **“两步走”**，因此需要两个配置文件，各司其职。

- `webpack.dll.config.js` (第一步：预打包)
  - **核心职责：** 专门用来打包那些不常变动的第三方库（`vendors`）。它的目的**不是**为了生成一个可运行的应用，而是为了**生成 DLL 文件和清单文件**。
  - **使用插件：** `DllPlugin`。这个插件是这一步的核心，负责生成“清单”。
- `webpack.config.js`(第二步：日常开发)
  - **核心职责：** 这是你日常开发使用的配置文件。它只负责打包你自己的业务代码（`src` 目录下的代码）。
  - **使用插件：** `DllReferencePlugin`。这个插件的作用是告诉 Webpack：“当你遇到像 `import Vue from 'vue'` 这样的语句时，**不要**去 `node_modules` 里打包 Vue 的源码，而是去查阅我指定的那个‘清单’文件，使用已经预打包好的 DLL 内容。”

**一句话总结：一个负责“生产”DLL，一个负责“引用”DLL。**

### **`DllPlugin`** 的两大产物

当你运行 `webpack --config webpack.dll.config.js` 后，`DllPlugin` 会帮助你生成两个至关重要的文件（通常放在一个特定的 `dll` 目录下）：

1. DLL 包 (Bundle File)，例如 `vendor.dll.js`
   - **内容：** 这是一个巨大的 JavaScript 文件，包含了你指定的所有第三方库（如 Vue, Vuex, lodash 等）的**源代码**，经过了 Webpack 的打包和模块化处理。
   - **作用：** 这是**真正被浏览器加载和执行**的代码。它就像一个预先准备好的“依赖工具箱”。
2. 清单文件 (Manifest File)，例如 `vendor-manifest.json`
   - **内容：** 这是一个 JSON 文件，它不是给人读的，是给 `DllReferencePlugin` 读的。它内部描述了一个**映射关系**。
     - **键 (Key):** 模块的请求路径，例如 `node_modules/vue/dist/vue.runtime.esm.js`。
     - **值 (Value):** 该模块在 `vendor.dll.js` 这个大文件中的内部模块 ID。
   - **作用：** 这是一个“寻路图” 或 **“字典”**。当 `DllReferencePlugin` 看到 `import Vue from 'vue'` 时，它会把这个请求解析成一个绝对路径，然后拿着这个路径去 `vendor-manifest.json` 里查找。找到后，它就知道：“哦，这个 Vue 模块对应的是 `vendor.dll.js` 里的第 123 号模块”，从而建立起引用关系，而无需重新打包 Vue 源码。

### **`DllReferencePlugin`** 如何找到清单

在 `webpack.config.js` 中，`DllReferencePlugin` 的配置非常直接，你需要明确地告诉它清单文件的**绝对路径**。

```javascript
// webpack.config.js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  // ...
  plugins: [
    new webpack.DllReferencePlugin({
      // context: __dirname, // 可选，通常是项目根目录
      manifest: path.resolve(__dirname, 'dist/dll', 'vendor-manifest.json'),
    }),
    // ...
  ],
};
```

这里的 `manifest` 属性，就是 Host 和 Remote 之间的“连接点”。
