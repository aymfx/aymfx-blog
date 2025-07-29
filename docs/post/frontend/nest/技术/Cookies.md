当然！我们来聊聊一个在 Web 开发中用于“记住”用户的经典技术：**Cookies**。这就像是为你的应用派发一种神奇的“身份手环”，让它能在访客再次光临时，立刻认出对方是谁。

## 为你的应用派发“身份手环”：NestJS Cookie 全攻略

想象你的应用是一个大型的游乐园。

每天都有成千上万的游客（用户）进进出出。游乐园的大门（你的服务器）有一个天生的“健忘症”：它无法记住谁是谁。每一次游客穿过大门（发送一次 HTTP 请求），在它看来都是一个全新的、陌生的人。这种特性被称为 **HTTP 的无状态性 (Statelessness)**。

这会带来很多麻烦。比如，一个游客买了一张“VIP 全天畅玩票”（用户登录），他每次去玩一个新的项目时，难道都要重新出示一次身份证和购票记录吗？这太低效了！

**Cookies** 就是为了解决这个问题而发明的“**身份手环**”。

- 当游客第一次检票入园时（用户成功登录），游乐园会发给他一个特制的、带有唯一编码的手环（服务器通过 `Set-Cookie` Header 发送一个 Cookie 到浏览器）。
- 浏览器会妥善地保管这个手环。
- 之后，这位游客再去任何一个项目时（向服务器发送后续请求），他都会亮出手环（浏览器会自动在请求的 `Cookie` Header 中带上这个手环）。
- 项目的工作人员（服务器）一看手环，立刻就知道：“哦，是这位尊贵的 VIP 客人，请进！”

NestJS 本身不直接处理 Cookie，但因为它底层通常运行在 Express 或 Fastify 之上，所以我们可以非常轻松地利用这些平台的中间件生态来管理 Cookie。

### 1. 第一步：安装“手环扫描仪” (`cookie-parser`)

为了让我们的服务器能读懂游客手环上的信息，我们需要安装一个“手环扫描仪”。对于 Express 平台（NestJS 的默认平台），最标准的扫描仪就是 `cookie-parser` 中间件。

**第一步：安装依赖**

```bash
npm install cookie-parser
# 同时安装它的类型定义文件，以获得更好的代码提示
npm install -D @types/cookie-parser
```

**第二步：在 `main.ts` 中启用“扫描仪”**

我们需要将 `cookie-parser` 作为一个中间件，在应用启动时就全局启用。

**`src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // 导入 cookie-parser

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 cookie-parser 中间件
  // 这会让应用能够自动解析传入请求中的 Cookie
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
```

好了，现在我们的“游乐园大门”已经配备了先进的手环扫描仪。

### 2. 第二步：读取“手环”信息 (Reading Cookies)

当游客亮出手环时，我们得能读取上面的信息。在 `Controller` 中，我们可以通过 `@Req()` 装饰器来访问原始的请求对象。

**`src/app.controller.ts`**

```typescript
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
  @Get('profile')
  getProfile(@Req() req: Request): string {
    // cookie-parser 会将解析后的 cookies 放在 req.cookies 对象上
    const theme = req.cookies['theme']; // 读取名为 'theme' 的 cookie

    if (theme) {
      return `欢迎回来！我们知道你喜欢的主题是: ${theme}`;
    }
    return '欢迎，新朋友！';
  }
}
```

这种方式可行，但每次都写 `req.cookies['...']` 有点繁琐。我们可以创建一个自定义装饰器 `@Cookie()` 来让代码更优雅，但这在官方文档中已经不是主流推荐，因为现代的适配器（如`@fastify/cookie`）通常会提供开箱即用的解决方案。但为了理解其原理，我们知道它是通过 `@Req()` 封装的即可。

### 3. 第三步：派发“手环” (Setting Cookies)

当一位新游客购买了“主题皮肤”（比如选择了网站的暗色模式）时，我们就需要给他派发一个记录着这个偏好的手环。

设置 Cookie 是通过**响应 (Response)** 对象来完成的。我们需要在 `Controller` 的方法中注入响应对象。

**`src/app.controller.ts`**

```typescript
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  // ... getProfile 方法 ...

  @Get('theme/dark')
  setDarkTheme(@Res({ passthrough: true }) res: Response) {
    // 使用 res.cookie() 来设置一个 cookie
    // 参数：name, value, options
    res.cookie('theme', 'dark', {
      maxAge: 3600 * 24 * 30, // 有效期 30 天 (单位：毫秒)
      httpOnly: true, // httpOnly: true 确保 cookie 不能被客户端脚本访问，更安全
    });

    return { message: '主题已设置为暗色模式！' };
  }
}
```

#### **至关重要的 `passthrough: true`**

- **`@Res()`**: 当你注入 `@Res()` 时，你实际上接管了 NestJS 的响应处理流程。默认情况下，NestJS 会认为“好的，这位开发者要自己发送响应了，我的工作到此为止”。如果你不手动调用 `res.send()` 或 `res.json()`，请求就会被挂起。
- **`@Res({ passthrough: true })`**: 这个选项告诉 NestJS：“我只是想用一下 `response` 对象来设置个 Header 或 Cookie，**但响应的发送工作还是请你来完成**。” 这是一个“借过”模式。这样，你就可以在不破坏 NestJS 标准响应流程的情况下，安全地设置 Cookie。**在绝大多数情况下，你都应该使用这个选项。**

### 4. 增加“防伪标识”：签名 Cookie (Signed Cookies)

普通的手环谁都可以伪造。如果一个游客自己做了一个假的“VIP 手环”怎么办？我们需要一种防伪技术。

**签名 Cookie** 就是带有“防伪标识”的手环。服务器在派发手环时，会用一个**秘密密钥 (secret)** 对手环的内容进行签名。当游客再次出示手环时，服务器会用同一个密钥来验证签名。如果签名不匹配，说明手环被篡改过，无效！

**第一步：在 `main.ts` 中提供密钥**

```typescript
// main.ts
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 在启用中间件时，传入一个密钥
  app.use(cookieParser('a-super-secret-key-that-no-one-knows'));

  await app.listen(3000);
}
bootstrap();
```

**第二步：设置和读取签名 Cookie**

```typescript
// app.controller.ts
@Controller()
export class AppController {
  @Get('login')
  login(@Res({ passthrough: true }) res: Response) {
    // 设置一个签名的 cookie
    res.cookie('user_id', '12345', { signed: true });
    return { message: '登录成功！' };
  }

  @Get('whoami')
  whoAmI(@Req() req: Request) {
    // 签名的 cookie 会被放在 req.signedCookies 对象里
    // 普通的 cookie 依然在 req.cookies 里
    const userId = req.signedCookies['user_id'];

    if (userId) {
      return `你的用户 ID 是: ${userId}`;
    }
    return '你还没有登录。';
  }
}
```

### 总结

Cookie 是实现会话管理、个性化推荐等功能的基础。在 NestJS 中操作 Cookie 非常简单直接。

| 当你想要...               | 你应该...                                                       | 核心代码/概念                      |
| :------------------------ | :-------------------------------------------------------------- | :--------------------------------- |
| **让应用能解析 Cookie**   | 在 `main.ts` 中 `app.use(cookieParser())`                       | **中间件 (Middleware)**            |
| **读取一个传入的 Cookie** | 在 Controller 中注入 `@Req()`，访问 `req.cookies`               | `req.cookies['cookie_name']`       |
| **设置一个 Cookie**       | 在 Controller 中注入 `@Res({ passthrough: true })`              | `res.cookie(name, value, options)` |
| **使用防篡改的 Cookie**   | 在 `cookieParser` 中提供密钥，并在设置时使用 `{ signed: true }` | 读取时访问 `req.signedCookies`     |

掌握了 Cookie 的使用，就等于掌握了让你的应用“记住”用户的基本技能，为构建更复杂、更人性化的用户系统打下了坚实的基础。
