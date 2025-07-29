好的，我们来探索如何将 NestJS 与另一种广受欢迎的数据库——**MongoDB**——进行配对。如果你已经理解了之前关于关系型数据库 (SQL) 的集成方式，你会发现这里的思路既有相似之处，又充满了 NoSQL 数据库独有的灵活性和特色。

## 为你的应用装上“万能储物柜”：NestJS 与 MongoDB 集成指南

想象一下，你之前的图书馆（关系型数据库）管理得井井有条，每本书（数据）都有固定的“索引卡片”（严格的 Schema），放在指定类别的书架（表）上。这非常适合结构化数据。

但现在，你要管理一个“创意工坊”，里面的东西千奇百怪：有设计图纸、有模型零件、有客户笔记、有颜色样本……你很难用统一的“索引卡片”去描述所有这些物品。

你需要的是一个巨大的、灵活的“**万能储物柜**”。每个抽屉（**文档 Document**）都可以存放任何形式的东西（**JSON/BSON 对象**），你只需要给每个抽屉贴上一个标签（比如“李雷的项目”），然后把所有相关的东西都扔进去。这些抽屉被分门别类地放在不同的柜子（**集合 Collection**）里。

这个“万能储物柜”就是 **MongoDB**，一种领先的 **NoSQL 文档数据库**。

与 MongoDB 交互，我们通常会使用一个 **ODM (Object Document Mapper)**，它扮演着和 ORM 类似的角色。对于 Node.js 生态来说，最流行、最强大的 ODM 就是 **Mongoose**。

NestJS 官方提供了 `@nestjs/mongoose` 模块，让整合过程变得非常简单。

### 1. 第一步：安装“储物柜管理系统” (`@nestjs/mongoose`)

**第一步：安装必要的依赖**
```bash
# 安装 Mongoose 集成模块
npm install @nestjs/mongoose mongoose
```

**第二步：在 `AppModule` 中配置数据库连接**

和 TypeORM 非常相似，我们需要在根模块中使用 `MongooseModule.forRoot()` 来告诉 NestJS 如何连接到我们的 MongoDB 服务器。

**`.env` 文件**
```env
MONGO_URI=mongodb://localhost:27017/nest-cats-app
```

**`src/app.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // 使用 forRootAsync 来异步配置
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        // 可以添加其他 Mongoose 连接选项，比如：
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      }),
    }),
  ],
})
export class AppModule {}
```
这个过程和 TypeORM 的配置几乎一模一样，只是配置项的名称不同 (`uri` 代替了 `host`, `port` 等)。这体现了 NestJS 模块化设计的一致性。

### 2. 第二步：定义“储物柜抽屉”的蓝图 (Schema & Document)

在 Mongoose 的世界里，我们通过两个东西来定义数据结构：

*   **Schema (模式)**：这是一个**蓝图**，它定义了一个集合（Collection）中文档（Document）的**结构**、**字段类型**、**默认值**和**验证规则**。它比关系型数据库的表结构更灵活，但仍然提供了一层结构性的保障。
*   **Document (文档)**：它是由 Schema 创建出的一个**具体实例**，对应 MongoDB 中的一条记录。

让我们来为我们的猫猫创建一个 Schema。

**`src/cats/schemas/cat.schema.ts`**
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// 1. 定义一个 TypeScript 类型，代表一个 Cat 文档
export type CatDocument = Cat & Document;

// 2. @Schema() 装饰器将这个类标记为一个 Mongoose Schema 定义
@Schema({ timestamps: true }) // timestamps: true 会自动添加 createdAt 和 updatedAt 字段
export class Cat {
  // 3. @Prop() 装饰器定义了文档中的一个属性
  @Prop({ required: true }) // 可以传递选项，比如 required
  name: string;

  @Prop()
  age: number;

  @Prop()
  breed: string;
}

// 4. 使用 SchemaFactory 从 Cat 类创建出 Mongoose Schema
export const CatSchema = SchemaFactory.createForClass(Cat);
```
这个文件做了几件重要的事情：
*   我们用 `@Schema()` 和 `@Prop()` 这两个 NestJS 提供的装饰器，以一种非常 TypeScript-friendly 的方式来定义 Mongoose Schema。
*   我们导出了一个 `CatDocument` 类型，它结合了我们的 `Cat` 类和 Mongoose 的 `Document` 类型，这在后续的服务中会给我们带来很好的类型提示。
*   我们用 `SchemaFactory` 这个工具函数，将我们的类定义“编译”成 Mongoose 能理解的真正 Schema。

### 3. 第三步：为特定“柜子”创建管理员 (Model)

在 Mongoose 中，与 Repository（仓库）对等的概念是 **Model (模型)**。

Model 是由 Schema “编译”而来的一个构造函数。它封装了对一个特定数据库集合（Collection）进行创建、查询、更新、删除（CRUD）的所有业务逻辑。你可以把它看作是“猫猫储物柜”的专属管理员。

**如何在模块中使用 Model？**

和 `TypeOrmModule.forFeature()` 类似，我们使用 `MongooseModule.forFeature()` 来注册我们的 Schema。

**`src/cats/cats.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { Cat, CatSchema } from './schemas/cat.schema'; // 导入 Schema 和类

@Module({
  imports: [
    // 使用 forFeature 注册 Schema
    // Mongoose 会在后台为我们创建和准备好 CatModel
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
  ],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```
*   `name: Cat.name`: 这个 `name` 属性非常重要，它将作为我们之后注入 Model 的**令牌 (Token)**。

### 4. 第四步：在服务中注入并使用 Model

现在，我们可以在 `CatsService` 中注入 `CatModel`，并用它来操作 MongoDB 了！

**`src/cats/cats.service.ts`**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cat, CatDocument } from './schemas/cat.schema';
import { CreateCatDto } from './dto/create-cat.dto';

@Injectable()
export class CatsService {
  // 使用 @InjectModel() 装饰器来注入 Cat 的 Model
  constructor(
    @InjectModel(Cat.name) // 使用 Cat.name 作为令牌
    private readonly catModel: Model<CatDocument>,
  ) {}

  // 创建一只猫 (Create)
  async create(createCatDto: CreateCatDto): Promise<Cat> {
    const createdCat = new this.catModel(createCatDto);
    return createdCat.save(); // .save() 是 Mongoose Document 的方法
  }

  // 查找所有猫 (Read All)
  async findAll(): Promise<Cat[]> {
    return this.catModel.find().exec(); // .exec() 返回一个真正的 Promise
  }

  // 查找一只猫 (Read One)
  async findOne(id: string): Promise<Cat> {
    const cat = await this.catModel.findById(id).exec();
    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }
    return cat;
  }

  // 删除一只猫 (Delete)
  async remove(id: string): Promise<void> {
    await this.catModel.findByIdAndRemove(id).exec();
  }
}
```
*   `@InjectModel(Cat.name)`: 我们使用在模块中定义的 `name` 作为令牌来注入正确的 Model。
*   `Model<CatDocument>`: 强烈建议为你的 Model 指定泛型类型，这样 TypeScript 就能为你提供所有 Mongoose 方法的强大代码提示和类型检查。
*   `.exec()`: Mongoose 的许多查询方法返回的不是一个标准的 Promise，而是一个可链式调用的 `Query` 对象。调用 `.exec()` 可以将其转换为一个标准的、可 `await` 的 Promise。

### 总结

尽管 MongoDB (NoSQL) 和 PostgreSQL (SQL) 在底层哲学上有很大差异，但 NestJS 通过其模块化的集成方式，提供了一套惊人地相似且符合直觉的工作流程。

| 步骤 | TypeORM (SQL) | Mongoose (MongoDB) | 核心概念 |
| :--- | :--- | :--- | :--- |
| **1. 全局配置** | `TypeOrmModule.forRootAsync` | `MongooseModule.forRootAsync` | 配置数据库连接 |
| **2. 结构定义** | `@Entity` | `@Schema` 和 `@Prop` | 定义数据模型 |
| **3. 模块注册** | `TypeOrmModule.forFeature` | `MongooseModule.forFeature` | 在模块中声明要操作的模型 |
| **4. 注入使用** | `@InjectRepository` | `@InjectModel` | 获取数据操作的句柄 (Handler) |

掌握了这个模式，你就不仅能为你的应用装上“记忆硬盘”，还能根据业务需求，灵活地选择是需要结构严谨的“图书馆”，还是灵活多变的“万能储物柜”。