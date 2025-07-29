下面是一个完整的、可直接使用的企业级封装 Demo。

---

### 最终目标

- **开发环境 (`development`)**: 日志被美化后输出到控制台，方便调试。
- **生产环境 (`production`)**: 日志以 JSON 格式同时输出到控制台和持久化到文件（例如 `app.log`）。
- **封装性**: 所有日志相关的配置都集中在 `LoggingModule` 中，`AppModule` 只需导入即可，保持主模块的整洁。
- **可配置性**: 使用 `.env` 文件和 `@nestjs/config` 来管理日志级别和文件路径。

---

### 第 1 步：安装所有必要的依赖

```bash
# 核心日志库
npm install nestjs-pino pino-http

# nestjs 配置模块
npm install @nestjs/config

# 开发依赖，用于美化日志
npm install -D pino-pretty
```

### 第 2 步：创建配置文件

我们将使用 `@nestjs/config` 来管理配置，这样更加灵活。

1.  **在项目根目录创建 `.env` 文件：**

    ```.env
    # 设置应用环境: development 或 production
    NODE_ENV=development

    # 日志级别 (trace, debug, info, warn, error, fatal)
    LOG_LEVEL=debug

    # 生产环境日志文件路径
    LOG_FILE_PATH=./logs/app.log
    ```

2.  **(可选，但推荐) 创建一个类型安全的配置映射文件 `src/config/logging.config.ts`**

    这能让你的配置有智能提示和类型检查。

    ```typescript
    // src/config/logging.config.ts
    import { registerAs } from '@nestjs/config';

    export default registerAs('logging', () => ({
      env: process.env.NODE_ENV || 'development',
      level: process.env.LOG_LEVEL || 'debug',
      filePath: process.env.LOG_FILE_PATH || './logs/app.log',
    }));
    ```

### 第 3 步：创建封装的 `LoggingModule` (核心)

这是我们封装逻辑的地方。

1.  **创建目录和文件 `src/logging/logging.module.ts`**

2.  **编写 `LoggingModule` 代码：**

    ```typescript
    // src/logging/logging.module.ts
    import { Module } from '@nestjs/common';
    import { ConfigService, ConfigModule } from '@nestjs/config';
    import { LoggerModule } from 'nestjs-pino';
    import pino from 'pino';
    import { randomUUID } from 'crypto';

    @Module({
      imports: [
        LoggerModule.forRootAsync({
          // 必须导入 ConfigModule 才能使用 ConfigService
          imports: [ConfigModule],
          // 注入 ConfigService
          inject: [ConfigService],
          // 使用工厂函数来动态创建配置
          useFactory: async (configService: ConfigService) => {
            const isProduction =
              configService.get<string>('NODE_ENV') === 'production';
            const logLevel = configService.get<string>('LOG_LEVEL', 'info');
            const logFilePath = configService.get<string>(
              'LOG_FILE_PATH',
              './logs/app.log'
            );

            // 定义日志流
            const streams: pino.StreamEntry[] = [];

            if (isProduction) {
              // 生产环境：同时输出到控制台 (JSON) 和文件
              streams.push({ level: logLevel, stream: process.stdout });
              streams.push({
                level: logLevel,
                stream: pino.destination(logFilePath),
              });
            } else {
              // 开发环境：美化后输出到控制台
              streams.push({
                level: logLevel,
                stream: pino.transport({
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
                  },
                }),
              });
            }

            return {
              pinoHttp: {
                // 使用 pino.multistream 来组合多个流
                stream: pino.multistream(streams),
                customProps: (req, res) => ({
                  reqId: req.id,
                }),
                genReqId: function (req, res) {
                  const existingId = req.id ?? req.headers['x-request-id'];
                  if (existingId) return existingId;
                  const id = randomUUID();
                  res.setHeader('X-Request-Id', id);
                  return id;
                },
              },
            };
          },
        }),
      ],
      // 导出 LoggerModule 使得其他模块可以注入 PinoLogger
      exports: [LoggerModule],
    })
    export class LoggingModule {}
    ```

### 第 4 步：更新根模块 `AppModule`

现在你的 `AppModule` 会变得非常干净。

**修改 `src/app.module.ts` 文件：**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from './logging/logging.module'; // 导入我们封装的模块
import loggingConfig from './config/logging.config'; // 导入配置映射

@Module({
  imports: [
    // 1. 加载配置模块，设置为全局并加载我们的配置
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loggingConfig],
    }),
    // 2. 导入我们封装好的日志模块
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 第 5 步：更新入口文件 `main.ts`

这一步和之前的 Demo 类似，确保 NestJS 使用我们配置好的 Logger。

**修改 `src/main.ts` 文件：**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino'; // 从 nestjs-pino 导入 Logger

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 设置我们封装好的 PinoLogger 为全局 Logger
  app.useLogger(app.get(Logger));

  await app.listen(3000);

  // 启动日志也会被 Pino 正确记录
  const logger = app.get(Logger);
  logger.log('Application is running on port 3000');
}
bootstrap();
```

---

### 如何运行和验证

#### 场景 1：开发环境

1.  确保你的 `.env` 文件中 `NODE_ENV=development`。
2.  运行 `npm run start:dev`。
3.  **结果**：

    - 你将在**控制台**看到**彩色的、单行**的日志。
    - 不会创建日志文件。

    ```shell
    INFO : Application is running on port 3000
    DEBUG <...>: incoming request req: {"id":1,"method":"GET","url":"/"}
    INFO [AppController]: Handling GET / request... reqId: 1
    ```

#### 场景 2：生产环境

1.  修改你的 `.env` 文件，设置 `NODE_ENV=production`。
2.  确保你有 `logs` 目录（或者 pino 会尝试创建它）。
3.  运行 `npm run start:prod` (这会先 build 再 start)。
4.  **结果**：

    - 你将在**控制台**看到**JSON 格式**的日志。
    - 同时，在项目根目录下的 `logs/app.log` 文件中，会看到**一模一样的 JSON 日志**被写入。

    **控制台输出:**

    ```json
    {"level":30,"time":...,"pid":... ,"hostname":"...","msg":"Application is running on port 3000"}
    ```

    **`./logs/app.log` 文件内容:**

    ```json
    {"level":30,"time":...,"pid":... ,"hostname":"...","msg":"Application is running on port 3000"}
    ```

通过这种封装方式，你实现了一个健壮、可配置且易于维护的企业级日志系统。
