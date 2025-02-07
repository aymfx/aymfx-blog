# TSConfig 配置文件

## 完整配置示例

```json
{
  "compilerOptions": {
    // ===== 模块导入配置 =====
    "baseUrl": "./", // 模块基础路径
    "paths": {
      // 路径别名
      "@/*": ["src/*"]
    },
    "moduleResolution": "node", // 模块解析策略
    "module": "ESNext", // 模块系统
    "allowJs": true, // 允许编译 JS 文件
    "resolveJsonModule": true, // 允许导入 json 模块
    "esModuleInterop": true, // ES6 模块互操作性
    "allowSyntheticDefaultImports": true, // 允许从没有默认导出的模块中默认导入
    "isolatedModules": true, // 确保每个文件都可以安全地进行转译

    // ===== 编译输出配置 =====
    "target": "ESNext", // 编译目标版本
    "lib": [
      // 编译需要包含的库文件
      "ESNext",
      "DOM",
      "DOM.Iterable",
      "ScriptHost"
    ],
    "jsx": "react-jsx", // JSX 编译
    "outDir": "dist", // 输出目录
    "rootDir": "src", // 源码根目录
    "sourceMap": true, // 生成源码映射
    "declaration": true, // 生成声明文件
    "declarationDir": "dist/types", // 声明文件输出目录
    "removeComments": true, // 删除注释
    "noEmit": false, // 不输出文件
    "importHelpers": true, // 从 tslib 导入辅助工具函数

    // ===== 类型检查配置 =====
    "strict": true, // 启用所有严格类型检查
    "alwaysStrict": true, // 以严格模式解析
    "noImplicitAny": true, // 禁止隐式 any 类型
    "noImplicitThis": true, // 禁止 this 隐式 any 类型
    "strictNullChecks": true, // 严格的空值检查
    "strictFunctionTypes": true, // 严格的函数类型检查
    "strictBindCallApply": true, // 严格的 bind/call/apply 检查
    "strictPropertyInitialization": true, // 严格的属性初始化检查
    "noUnusedLocals": true, // 未使用的局部变量报错
    "noUnusedParameters": true, // 未使用的参数报错
    "noImplicitReturns": true, // 每个分支都要有返回值
    "noFallthroughCasesInSwitch": true, // switch 语句全面性检查
    "allowUnreachableCode": false, // 禁止无法达到的代码

    // ===== 实验性功能 =====
    "experimentalDecorators": true, // 启用装饰器
    "emitDecoratorMetadata": true, // 为装饰器提供元数据支持

    // ===== 其他配置 =====
    "skipLibCheck": true, // 跳过库文件的类型检查
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    "preserveConstEnums": true, // 保留 const enum 声明
    "pretty": true, // 美化错误信息
    "incremental": true, // 增量编译
    "tsBuildInfoFile": "./buildcache" // 增量编译文件的存储位置
  },

  // ===== 项目配置 =====
  "include": [
    // 需要编译的文件
    "src/**/*",
    "types/**/*"
  ],
  "exclude": [
    // 排除的文件
    "node_modules",
    "dist",
    "**/*.spec.ts"
  ],
  "files": [
    // 指定要编译的文件列表
    "core.ts",
    "types.ts"
  ],
  "extends": "./tsconfig.base.json", // 继承其他配置文件
  "references": [
    // 项目引用
    { "path": "../common" }
  ]
}
```

## 常用配置场景说明

### 1. 路径和模块配置

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    },
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

使用场景：

- 简化模块导入路径
- 更好的代码组织和管理
- 处理不同类型模块的互操作性

### 2. React 项目配置

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "target": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true
  }
}
```

使用场景：

- React 项目开发
- 现代浏览器应用
- 使用最新的 ECMAScript 特性

### 3. Node.js 后端项目配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

使用场景：

- Node.js 服务端开发
- 使用装饰器模式
- 需要元数据反射

### 4. 库开发配置

```json
{
  "compilerOptions": {
    "target": "ES5",
    "module": "ESNext",
    "declaration": true,
    "declarationDir": "dist/types",
    "sourceMap": true,
    "strict": true,
    "noImplicitAny": true,
    "importHelpers": true
  }
}
```

使用场景：

- 开发 NPM 包
- 需要生成类型声明文件
- 需要良好的兼容性

### 5. 严格模式配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

使用场景：

- 大型项目开发
- 需要高代码质量
- 团队协作开发

## 注意事项

1. 配置项的选择要根据项目实际需求，不是配置项越多越好

2. 建议团队项目统一 TSConfig 配置，确保代码规范一致性

3. 不同的项目类型（前端、后端、库）可能需要不同的配置

4. 开发环境和生产环境可以使用不同的 TSConfig 配置

5. 可以通过 extends 继承基础配置，然后根据具体需求覆盖或添加配置
