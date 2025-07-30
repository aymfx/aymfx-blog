# pnpm + Turborepo 实现 monorepo

## Monorepo 是什么？我们为什么需要它？

### 项目现状：

- 一个主应用 main-app。
- 一个共享的组件库 shared-ui。
- 一个存放工具函数和配置的 utils 包。
- 管理后台 admin-app。

### 问题：

- 每个包都有自己的依赖，导致重复安装。
- 每次修改 shared-ui 后，需要手动重新构建 main-app 和 admin-app。
- 每个包的测试、构建、部署都是独立进行的，没有统一的流程。

这个过程繁琐、耗时且极易出错。Monorepo 的核心就是要解决代码复用和工程协同的根本问题。

## 两大核心：pnpm 和 Turborepo

我们的新方案由两个关键部分组成：pnpm 作为包管理器和工作区（Workspace）的基础，Turborepo 作为构建系统和任务调度器。它们各司其职，相辅相成。

### pnpm：高效、正确的依赖管理基石

- 磁盘空间效率的极致优化：
  - 工作原理：pnpm 使用一个全局的、内容寻址的存储（content-addressable store）来存放所有包的实体文件。当你在项目中安装一个依赖（比如 react），pnpm 不会复制一份到你的 node_modules，而是通过硬链接 (hard link) 的方式指向全局存储。
  - 带来的好处：无论你有多少个项目都依赖了 react@18.2.0，它在你的磁盘上永远只占一份空间。对于大型 Monorepo 项目，这能节省几十 GB 的磁盘空间。
- 杜绝“幻影依赖” (Phantom Dependencies)：
  - 这是什么问题？：npm 和 yarn v1 会把所有依赖“平铺”在 node_modules 的根目录。这导致你的代码可以引用到那些你没有在 package.json 中声明、但却是你依赖的依赖所依赖的包（比如你依赖了 A，A 依赖了 B，你的代码可以直接 require('B')）。这是非常危险的，一旦 A 升级后不再依赖 B，你的项目就会崩溃。
  - pnpm 的解决方案：pnpm 创建了一个嵌套的、非平铺的 node_modules 结构。只有你在 package.json 中明确声明的依赖，才能在代码中被直接引用。这从结构上保证了依赖的确定性和正确性。
- 安装速度快：
  得益于其独特的**依赖解析**和**链接机制**，pnpm 在大部分场景下，尤其是存在大量缓存时，安装速度非常快。

**生态兼容性问题（已基本解决）**：早期，一些设计不够规范的包可能无法适应 pnpm 的非平铺结构。但随着 pnpm 的普及，这个问题在今天已经非常罕见了。
**需要一点点心智转变**：习惯了扁平化 node_modules 的同学需要理解它的新结构，但这个学习成本非常低。

### Turborepo：为 Monorepo 而生的智能“指挥官”

- 智能的任务流水线 (Task Pipelines)：
  - 工作原理：你可以在根目录的 turbo.json 文件中，定义任务之间的依赖关系。比如，"build": { "dependsOn": ["^build"] }。这里的 ^build 是一个关键，它告诉 Turborepo：“在构建某个应用（如 main-app）之前，必须先构建完它所依赖的所有内部包（如 shared-ui, utils）”。
  - 带来的好处：你再也不用手动去想应该先 build 哪个包了。只需在根目录运行 turbo run build，它会自动分析依赖图，并以最高效的并行方式去执行所有任务。
- 终极武器：远程缓存 (Remote Caching)：
  - 工作原理：Turborepo 会为你每个任务的产物（比如 build 后的 dist 目录）生成一个哈希值。当你第二次运行同一个任务，如果输入（代码、依赖、环境变量等）没有改变，它会直接跳过任务执行，瞬间从缓存中恢复产物。
  - 远程缓存的魔力：它可以将这个缓存共享给整个团队！比如，CI/CD 服务器构建了一次 shared-ui，当你在本地拉下最新代码后，你运行 turbo run build，Turborepo 会发现你的 shared-ui 代码和远程缓存中的版本一致，于是它会直接从云端下载构建好的产物，而不是在你的电脑上再跑一遍构建流程。对于大型项目，这能将 CI/CD 和本地构建时间从十几分钟缩短到几十秒。
- 简洁的开发体验 (DX)：
  - 它的命令行工具非常清爽，输出信息聚焦于重点。
  - 可以通过 --filter 参数轻松地只运行某个特定应用或包的任务，如 turbo run dev --filter=main-app。

好的，完全没问题。

接上我们刚刚的分享，理解了“是什么”和“为什么”之后，最重要的就是“怎么用”。这一部分，我会带大家一步步地、手把手地把我们的新工作流跑起来。我会尽量用最直接的命令和最常见的场景来演示。

---

## 上手实践

这部分是纯粹的实战指南。大家可以跟着我的步骤，在自己的机器上尝试。

### 环境准备

首先，请确保你的电脑上安装了 **Node.js (v18+)** 和 **pnpm**。

如果你还没安装 pnpm，执行以下命令：

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm
```

### Step 1: 初始化我们的项目骨架

我们来从零开始创建一个 Monorepo 项目。

1.  **创建项目目录并初始化**

    ```bash
    mkdir my-awesome-monorepo
    cd my-awesome-monorepo
    # 初始化 pnpm 项目，会生成一个 package.json
    pnpm init
    ```

2.  **定义工作区 (Workspace)**
    这是激活 pnpm Monorepo 能力的关键。在根目录创建一个 `pnpm-workspace.yaml` 文件，并写入以下内容：

    ```yaml
    packages:
      # 所有在 apps/ 目录下的都是我们的应用
      - 'apps/*'
      # 所有在 packages/ 目录下的都是我们的共享包
      - 'packages/*'
    ```

3.  **创建目录结构**
    按照上面的配置，创建对应的文件夹：

    ```bash
    mkdir apps
    mkdir packages
    ```

    - `apps/`：存放最终可以被部署的应用，比如我们的主网站、后台管理系统等。
    - `packages/`：存放可以被复用的代码，比如 UI 组件库、工具函数、配置文件等。

4.  **安装 Turborepo**
    我们需要把 `turbo` 安装到项目的根目录，作为开发依赖。

    ```bash
    # -w 标志告诉 pnpm，这个依赖是安装在根(workspace-root)目录的
    pnpm add turbo --save-dev -w
    ```

5.  **配置 Turborepo**
    在根目录创建一个 `turbo.json` 文件。这是 Turborepo 的“大脑”，我们先从一个基础但强大的配置开始：
    ```json
    {
      "$schema": "https://turbo.build/schema.json",
      "pipeline": {
        "build": {
          "dependsOn": ["^build"],
          "outputs": ["dist/**", ".next/**"]
        },
        "lint": {},
        "dev": {
          "cache": false,
          "persistent": true
        },
        "test": {
          "inputs": [
            "src/**/*.tsx",
            "src/**/*.ts",
            "test/**/*.ts",
            "test/**/*.tsx"
          ]
        }
      }
    }
    ```
    - `pipeline`: 定义了我们项目中的所有任务。
    - `build`: 构建任务。
      - `dependsOn: ["^build"]`: **这是核心！** `^`符号表示“拓扑依赖”。这句话的意思是：在构建一个应用（如 `apps/web`）之前，必须先成功构建它在 `package.json` 中依赖的所有内部包（如 `packages/ui`）。
      - `outputs`: 告诉 Turbo 构建产物在哪里。这是实现缓存的关键，Turbo 会缓存这些目录。
    - `dev`: 开发任务。`cache: false` 和 `persistent: true` 通常用于不会退出的常驻进程，比如启动开发服务器。
    - `lint`/`test`: 其他常规任务。

到此，我们的 Monorepo 骨架就搭好了！

### Step 2: 创建我们的第一个应用和共享包

1.  **创建共享 UI 包** (`packages/ui`)

    ```bash
    # 进入 packages 目录并创建一个叫 ui 的文件夹
    mkdir packages/ui
    cd packages/ui

    # 初始化 package.json 并添加一些基本文件
    pnpm init
    # 创建一个简单的 React 组件
    mkdir src
    echo "export const Button = () => <button>Boop</button>;" > src/Button.tsx
    # （为了示例，我们还需要安装 React）
    pnpm add react
    ```

    现在 `packages/ui/package.json` 应该看起来像这样（注意 name）：

    ```json
    {
      "name": "ui",
      "version": "1.0.0",
      "main": "src/Button.tsx", // 简化示例
      ...
    }
    ```

2.  **创建 Web 应用** (`apps/web`)

    ```bash
    # 回到根目录
    cd ../..
    # 创建一个 Vite + React 项目作为我们的主应用
    pnpm create vite apps/web --template react-ts
    ```

3.  **建立内部依赖关系**
    这是 Monorepo 的魅力所在。我们想让 `web` 应用使用 `ui` 包里的组件。

    ```bash
    # 使用 --filter 来指定在哪个包里执行命令
    # 这会在 apps/web/package.json 中添加 "ui": "workspace:*"
    pnpm add ui --filter web
    ```

    `"workspace:*"` 是 pnpm 的魔法。它告诉 Node.js，当你在 `web` 应用里 `import { Button } from 'ui'` 时，去工作区里找那个叫 `ui` 的包，而不是去 npm 官网上下载。

4.  **在应用中使用共享组件**
    修改 `apps/web/src/App.tsx`：

    ```tsx
    import './App.css';
    import { Button } from 'ui'; // <-- 从我们的共享包中导入！

    function App() {
      return (
        <>
          <h1>Web App</h1>
          <Button />
        </>
      );
    }

    export default App;
    ```

5.  **安装所有依赖**
    回到项目根目录，运行一次 `pnpm install`。pnpm 会分析所有 `package.json` 并把所有依赖都正确地链接好。
    ```bash
    cd ../..
    pnpm install
    ```

### Step 3: 日常命令实战

现在，所有命令都应该**从项目根目录执行**，让 Turborepo 来指挥。

- **启动所有开发服务器**:

  ```bash
  turbo run dev
  ```

  Turborepo 会找到所有定义了 `dev` 脚本的 `package.json` 文件（比如我们的 `apps/web`），并同时把它们运行起来。由于我们在 `web` 中引用了 `ui`，现在你修改 `packages/ui` 里的组件代码，`web` 应用的页面会**实时热更新**！这极大地提升了调试效率。

- **构建整个项目**:

  ```bash
  turbo run build
  ```

  Turborepo 会：

  1.  分析依赖图，发现 `web` 依赖 `ui`。
  2.  先执行 `ui` 的 `build` 任务。
  3.  再执行 `web` 的 `build` 任务。
  4.  如果任务是并行安全的，它会同时运行。
  5.  **第一次**构建后，它会把产物（`dist/` 目录）缓存起来。
  6.  **第二次**运行 `turbo run build`，如果代码没变，你会看到类似 `FULL TURBO` 的信息，整个过程耗时不到 1 秒。这就是缓存的威力。

- **只运行某个包的任务**:
  想单独构建 `ui` 包？使用 `--filter`。

  ```bash
  turbo run build --filter=ui
  ```

- **添加/删除依赖**:
  - 给 `web` 应用添加 `axios`：
    ```bash
    pnpm add axios --filter web
    ```
  - 给 `ui` 包添加 `classnames`：
    ```bash
    pnpm add classnames --filter ui
    ```
  - 给所有包都安装 `prettier` 作为开发依赖：
    ```bash
    pnpm add prettier -D -w
    ```

### 总结与速查表 (Cheatsheet)

| 任务              | 命令                                        | 解释                                       |
| :---------------- | :------------------------------------------ | :----------------------------------------- |
| **安装所有依赖**  | `pnpm install`                              | 在克隆项目或更新了 `package.json` 后运行。 |
| **启动开发**      | `turbo run dev`                             | 并行启动所有应用的开发服务器。             |
| **构建项目**      | `turbo run build`                           | 智能、并行、带缓存地构建所有包和应用。     |
| **运行测试/Lint** | `turbo run test`<br>`turbo run lint`        | 在所有包中运行测试或 Lint。                |
| **添加依赖**      | `pnpm add <pkg_name> --filter <app_or_pkg>` | 为**特定**的包添加依赖。                   |
| **添加根依赖**    | `pnpm add <pkg_name> -D -w`                 | 为根项目添加开发依赖（如 lint 工具）。     |
| **清理构建产物**  | `turbo run clean`                           | (需自行在`package.json`中定义`clean`脚本)  |
| **聚焦单个包**    | `turbo run <task> --filter=<app_or_pkg>`    | 只在指定的包里执行任务。                   |
