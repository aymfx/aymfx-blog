好的，我们来探讨另一种在 Web 开发中用于“记住”用户的核心技术：**会话 (Session)**。如果说 Cookie 是发给用户的“身份手环”，那么 Session 就是在服务器上为这位用户建立的一份“专属档案”。

## 为你的用户建立“专属档案”：NestJS 会话 (Session) 完全指南

再次回到我们那个大型游乐园的比喻。

我们之前讨论了用 **Cookie** 来给游客派发“身份手环”。当游客再次来到某个项目门口时，工作人员扫描手环（读取 Cookie），就知道他是谁。

但这种方式有一个问题：如果手环上需要记录的信息越来越多（比如游客的姓名、年龄、购买的所有套餐、积分、过敏信息等），把所有这些信息都写在手环上，会让手环变得又大又重，而且不安全（信息暴露在客户端）。

**会话 (Session)** 提供了一种更专业、更安全的“档案管理”模式：

1.  当游客第一次检票入园时（用户首次与服务器交互），游乐园不再发一个记录着所有信息的手环，而是只发一个非常简单的、只包含一个**唯一档案编号（Session ID）** 的手环（一个非常小的 Cookie）。
2.  同时，游乐园的**中央档案室（服务器端存储，如 Redis 或内存）** 会为这位游客创建一份**专属的个人档案（Session 对象）**，并用那个唯一的档案编号作为索引。游客的所有信息（姓名、积分等）都记录在这份服务器上的档案里。
3.  之后，游客再去任何项目时，他只需要出示那个记录着档案编号的简单手环即可。
4.  工作人员扫描到档案编号后，会通过内部系统，立刻从中央档案室调出这份编号对应的完整档案，从而获得游客的所有信息。

**Session vs. Cookie 的核心区别**：

| 特性             | Cookie                                 | Session                                            |
| :--------------- | :------------------------------------- | :------------------------------------------------- |
| **数据存储位置** | **客户端（浏览器）**                   | **服务器端**                                       |
| **安全性**       | **较低**（信息暴露在客户端，易被篡改） | **较高**（只有 Session ID 暴露，真实数据在服务器） |
| **数据大小**     | **受限**（通常每个 Cookie 不超过 4KB） | **几乎无限制**（取决于服务器存储能力）             |
| **服务器压力**   | **小**（服务器无需存储数据）           | **较大**（服务器需要为每个活跃用户维护一份档案）   |

NestJS 利用 `express-session` 这个非常成熟的 Express 中间件，来轻松地实现会话管理。

### 1. 第一步：安装“档案管理系统” (`express-session`)

**第一步：安装依赖**

```bash
npm install express-session
# 安装类型定义文件
npm install -D @types/express-session
```

**第二步：在 `main.ts` 中启用“档案管理”**

和 `cookie-parser` 一样，我们需要在 `main.ts` 中全局启用 `express-session` 中间件。

**`src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session'; // 导入 express-session

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 session 中间件
  app.use(
    session({
      secret: 'a-super-secret-key-that-no-one-knows-too', // 用于签名 session ID cookie 的密钥
      resave: false, // 强制 session 即使没有修改也保存。设为 false 以避免不必要的写入
      saveUninitialized: false, // 强制未初始化的 session 保存。设为 false 以减少存储使用
      cookie: { maxAge: 3600000 }, // session ID cookie 的有效期，这里是 1 小时
    })
  );

  await app.listen(3000);
}
bootstrap();
```

- `secret`: 这是**极其重要**的安全配置，必须是一个复杂的、随机的字符串，用于防止 Session ID 被伪造。
- `resave` 和 `saveUninitialized`: 通常建议设为 `false` 以获得更好的性能和遵循最佳实践。

现在，你的应用已经具备了为每个访客自动创建和管理“档案”的能力。

### 2. 第二步：读写“档案”内容

`express-session` 中间件启用后，它会在每个**请求 (`request`) 对象**上附加一个 `session` 属性。我们可以通过这个属性来自由地读写当前用户的专属档案。

**`src/app.controller.ts`**

```typescript
import { Controller, Get, Req, Session } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get('visit')
  visitCounter(@Req() req: Request) {
    // 访问 req.session 对象
    // 如果是第一次访问，req.session.views 会是 undefined
    req.session.views = (req.session.views || 0) + 1;

    return `这是你的第 ${req.session.views} 次访问本站！`;
  }

  // 使用 @Session() 装饰器，是更优雅、更 NestJS-style 的方式
  @Get('visit-nest')
  visitCounterNest(@Session() session: Record<string, any>) {
    session.views = (session.views || 0) + 1;
    return `这是你的第 ${session.views} 次访问本站！(Nest Way)`;
  }
}
```

**工作流程**:

1.  **第一次**访问 `/visit` 或 `/visit-nest`：
    - `express-session` 发现这是一个新用户，没有 Session ID。
    - 它会创建一个新的、空的 `session` 对象，并附加到 `req` 上。
    - 你的代码向 `session` 对象中写入了 `views: 1`。
    - 在响应发送时，`express-session` 会生成一个唯一的 Session ID，并通过 `Set-Cookie` Header 将这个 ID 发送给浏览器。
2.  **第二次**访问：
    - 浏览器自动带上之前收到的包含 Session ID 的 Cookie。
    - `express-session` 读取到这个 ID，然后去服务器端的存储中找到对应的“档案”（`{ views: 1 }`），并将其附加到 `req.session` 上。
    - 你的代码读取 `req.session.views` (值为 1)，将其加一，变成 `2`。
    - 因为 `session` 对象被修改了，所以在响应发送时，`express-session` 会将更新后的档案保存回服务器存储。

### 3. “档案室”的升级：将会话存储到 Redis

默认情况下，`express-session` 将会话数据存储在**服务器的内存**中。这有几个致命的缺点：

- **应用重启后数据丢失**：所有用户的登录状态都会消失。
- **无法水平扩展**：如果你启动了多个应用实例（多进程或多台服务器），用户第一次的请求可能落在 A 服务器，第二次落在 B 服务器。B 服务器的内存中没有这个用户的会话数据，会导致会话失效。

**企业级方案**是将会话存储在一个**集中的、持久化的存储服务**中，**Redis** 是最理想的选择。

**第一步：安装 Redis 存储引擎**

```bash
npm install connect-redis redis
```

- `connect-redis`: 这是一个专门为 `express-session` 设计的，用于将其与 Redis 对接的库。
- `redis`: Node.js 的 Redis 客户端库。

**第二步：配置 `main.ts` 使用 RedisStore**

```typescript
// main.ts
import * as session from 'express-session';
import RedisStore from 'connect-redis'; // 导入 RedisStore
import { createClient } from 'redis'; // 导入 redis 客户端

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. 创建 Redis 客户端
  const redisClient = createClient({
    url: 'redis://localhost:6379', // 你的 Redis 连接地址
  });
  await redisClient.connect().catch(console.error);

  // 2. 初始化 RedisStore
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp-session:', // 在 Redis 中的 key 的前缀，方便管理
  });

  // 3. 在 session 配置中使用 store 选项
  app.use(
    session({
      store: redisStore, // 指定使用 RedisStore
      secret: 'a-super-secret-key-that-no-one-knows-too',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 },
    })
  );

  await app.listen(3000);
}
bootstrap();
```

现在，你的应用就拥有了一个健壮的、生产级的会话管理系统。所有用户的“档案”都会被安全地存储在 Redis 中，无论你启动多少个应用实例，它们都共享同一个“中央档案室”，实现了真正的无状态和高可用。

### 总结

会话 (Session) 是实现有状态交互的核心机制，它将数据存储在服务端，通过一个简单的 Cookie 来识别用户。

| 当你想要...                           | 你应该...                                              | 核心概念/代码                                |
| :------------------------------------ | :----------------------------------------------------- | :------------------------------------------- |
| **让应用能管理会话**                  | 在 `main.ts` 中 `app.use(session({...}))`              | **中间件 (Middleware)**                      |
| **读/写当前用户的会话数据**           | 在 Controller 中注入 `@Session()`，操作 `session` 对象 | `@Session()`, `session.myKey = 'value'`      |
| **在开发或单实例应用中使用**          | **使用默认的内存存储 (MemoryStore)**                   | 简单，但数据易失且不可扩展。                 |
| **构建生产级、高可用的应用 (企业级)** | **将会话存储到 Redis (使用 `connect-redis`)**          | **集中化、持久化、可扩展**，是行业标准方案。 |

对于需要管理用户登录状态、购物车等复杂场景的应用，基于 Redis 的 Session 方案，是一种比单独使用 Cookie 更安全、更强大的选择。它让你能够为每一位用户维护一份丰富而私密的“专属档案”。
