# 配置管理 (Configuration)

当然！我们来探讨一个构建任何严肃应用程序都必不可少的环节——**配置管理 (Configuration)**。一个专业的应用，其关键信息绝不能硬编码在代码里。NestJS 官方提供了一个极其强大和灵活的包 `@nestjs/config`，它能让你的配置管理变得既优雅又安全。

## 餐厅的“运营手册”：精通 NestJS 配置管理

想象一下你开了一家高级餐厅。

为了让餐厅正常运转，你需要一本“运营手册”，上面记录了所有关键信息：

- **数据库密码**：顶级食材供应商的保密电话。
- **服务器端口**：餐厅的营业时间。
- **API 密钥**：用来预订稀有松露的特殊代码。
- **运行环境 (`NODE_ENV`)**：今天是以“米其林星级”模式运营，还是以“员工内部试吃”模式运营？

你绝对不会把这些信息用马克笔直接写在餐厅大门上（硬编码在代码里）。这样做既不安全，也不灵活。如果供应商换了电话，你总不能把整个大门换掉吧？

你需要一个**独立、安全、易于管理**的“运营手册”。在 NestJS 中，`@nestjs/config` 模块就是你那本专业的、数字化的运营手册。

### 1. 告别混乱：为什么需要 `@nestjs/config`？

在没有标准方案之前，开发者可能会：

- 将配置写在 `.json` 文件里。
- 使用 `dotenv` 库直接读取 `.env` 文件。
- 将配置定义为巨大的常量对象。

这些方法都能用，但 `@nestjs/config` 提供了“官方最佳实践”，带来了诸多好处：

- **与 NestJS 生态无缝集成**：可以像注入任何其他服务一样注入 `ConfigService`。
- **环境感知**：轻松加载不同环境（开发、生产、测试）的配置。
- **配置校验**：能在应用启动时就验证配置是否完整、合法，避免运行时出错（“fail-fast”原则）。
- **灵活的配置源**：不仅能加载 `.env` 文件，还能加载自定义的 `json`, `yml` 文件，并将其合并。
- **类型安全**：提供获取强类型配置值的方法。

### 2. 基础入门：从 `.env` 文件开始

这是最常见的用例。我们希望将敏感信息或环境变量放在项目根目录的 `.env` 文件中。

#### **前置知识：`.env` 文件**

`.env` 是一个纯文本文件，用于存储键值对形式的环境变量。它应该被添加到你的 `.gitignore` 文件中，以确保敏感信息（如数据库密码、API 密钥）不会被提交到 Git 仓库。

**`.env`**

```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
API_KEY="a-very-secret-key"
```

**第一步：安装依赖**

```bash
npm install @nestjs/config
```

**第二步：在 `AppModule` 中注册 `ConfigModule`**

这是最关键的一步。我们使用 `ConfigModule.forRoot()` 来加载和解析 `.env` 文件。

**`src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 使用 .forRoot() 进行配置
    ConfigModule.forRoot({
      isGlobal: true, // 关键！将 ConfigModule 设为全局模块
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- `isGlobal: true`: 这是一个非常有用的选项。它将 `ConfigService` 注册为全局可用的提供者。这意味着，你不需要在每个需要使用它的模块中都 `imports: [ConfigModule]`，只需在根模块中设置一次，任何地方都可以直接注入 `ConfigService`。

**第三步：注入并使用 `ConfigService`**

现在，我们可以在任何服务中注入 `ConfigService`，并使用它的 `get()` 方法来获取配置值。

**`src/app.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  // 注入 ConfigService
  constructor(private readonly configService: ConfigService) {
    // 使用 get() 方法获取配置
    const dbUrl = this.configService.get<string>('DATABASE_URL');
    const apiKey = this.configService.get<string>('API_KEY');

    console.log(`数据库连接地址: ${dbUrl}`);
    console.log(`我的 API 密钥是: ${apiKey}`);
  }

  getHello(): string {
    const port = this.configService.get<number>('PORT');
    return `Hello World! Application is running on port ${port}.`;
  }
}
```

- `configService.get<T>('KEY')`: 注意这里的泛型 `<string>` 或 `<number>`。它能帮助我们获得带有类型的配置值，提升代码的健壮性。

### 3. 增加“保险”：使用 Joi 进行配置校验

如果你的同事忘了在 `.env` 文件里添加 `DATABASE_URL` 怎么办？应用可能会在某个不经意的时刻崩溃。我们希望应用在**启动时**就进行检查，如果缺少关键配置，就立刻报错并退出。

[Joi](https://joi.dev/) 是一个非常流行的对象模式描述和验证库。`@nestjs/config` 与它完美集成。

**第一步：安装 Joi**

```bash
npm install joi
```

**第二步：在 `ConfigModule` 中配置校验规则**

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 在这里添加 validationSchema
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(), // 标记为必需
        API_KEY: Joi.string().required(), // 标记为必需
      }),
    }),
  ],
  // ...
})
export class AppModule {}
```

现在，如果你启动应用时，`.env` 文件中缺少 `DATABASE_URL` 或 `API_KEY`，NestJS 会立刻抛出一个清晰的错误并终止启动，告诉你哪个配置项缺失了。这极大地提高了应用的可靠性。

### 4. “高级定制”：加载自定义配置文件

有时候，配置不仅仅是简单的键值对，可能会有更复杂的嵌套结构。我们可能更喜欢使用 YAML 或 JSON 文件。`@nestjs/config` 同样支持。

**第一步：创建自定义配置文件**

**`config/app.config.yml`**

```yaml
app:
  name: My Awesome App
  version: 1.0.2

database:
  host: localhost
  port: 5432
```

**第二步：创建一个加载该文件的函数**

**`src/config/configuration.ts`**

````typescript
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME = 'app.config.yml';

export default () => {
  return yaml.load(
    readFileSync(join(__dirname, '..', '..', 'config', YAML_CONFIG_FILENAME), 'utf8'),
  ) as Record<string, any>;
};```
*   你需要安装 `js-yaml`：`npm install js-yaml`

**第三步：在 `ConfigModule` 中使用 `load` 选项**

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 使用 load 选项来加载自定义配置文件
      load: [configuration],
    }),
  ],
  // ...
})
export class AppModule {}```

**第四步：通过“点表示法”访问嵌套配置**

```typescript
// app.service.ts
export class AppService {
  constructor(private readonly configService: ConfigService) {
    // 使用点表示法来访问嵌套的值
    const dbPort = this.configService.get<number>('database.port');
    const appName = this.configService.get<string>('app.name');

    console.log(`数据库端口是: ${dbPort}`); // 输出: 5432
    console.log(`应用名称是: ${appName}`); // 输出: My Awesome App
  }
}
````

### 总结

`@nestjs/config` 是一个功能全面、设计精良的配置管理解决方案。

| 当你想要...                            | 你应该使用...                              |
| :------------------------------------- | :----------------------------------------- |
| 快速开始，使用 `.env` 文件             | `ConfigModule.forRoot({ isGlobal: true })` |
| 确保关键配置不缺失，让应用启动更可靠   | `validationSchema` 选项配合 `Joi`          |
| 管理复杂的、嵌套的配置（如 YAML/JSON） | `load` 选项配合一个自定义的加载函数        |
| 获取类型安全的配置值                   | `configService.get<Type>('key.path')`      |

正确地管理配置，是区分“玩具项目”和“生产级应用”的重要标志之一。掌握 `@nestjs/config`，就是掌握了构建健壮、可维护和安全 NestJS 应用的关键一步。
