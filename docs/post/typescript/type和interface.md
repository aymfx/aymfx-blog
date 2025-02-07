# type 和 interface

## 1. 基本概念

### type (类型别名)

类型别名用来给一个类型定义新的名字,它并不是创建一个新的类型。

```typescript
// 1. 基础类型别名
type Message = string;
type ID = string | number;

// 2. 对象类型
type Point = {
  x: number;
  y: number;
};

// 3. 泛型
type Container<T> = { value: T };

// 4. 函数类型
type Callback = (data: string) => void;

// 5. 联合类型
type Status = 'loading' | 'success' | 'error';

// 6. 元组类型
type Coordinate = [number, number];
```

### interface (接口)

接口是一种规范,用于定义对象的类型,描述对象的结构。

```typescript
// 1. 基本接口
interface User {
  name: string;
  age: number;
  sayHi(): void;
}

// 2. 可选属性
interface Config {
  color?: string;
  width?: number;
}

// 3. 只读属性
interface Point {
  readonly x: number;
  readonly y: number;
}

// 4. 函数接口
interface SearchFunc {
  (source: string, subString: string): boolean;
}
```

## 2. 核心区别

### 2.1 声明合并

interface 可以多次声明,会自动合并为单个接口。type 不支持重复声明。

```typescript
// Interface 声明合并
interface User {
  name: string;
}
interface User {
  age: number;
}
const user: User = {
  name: 'Tom',
  age: 20,
}; // ✅ 正确

// Type 不支持重复声明
type User = {
  name: string;
};
type User = {
  age: number;
}; // ❌ 错误：标识符"User"重复
```

### 2.2 扩展方式

interface 使用 extends 继承,type 使用交叉类型(&)。

```typescript
// Interface 继承
interface Animal {
  name: string;
}
interface Dog extends Animal {
  bark(): void;
}

// Type 交叉
type Animal = {
  name: string;
};
type Dog = Animal & {
  bark(): void;
};

// Interface 也可以继承 Type
type Name = {
  name: string;
};
interface User extends Name {
  age: number;
}
```

### 2.3 实现方式

两者都可以被 class 实现,但实现方式略有不同。

```typescript
// Interface 实现
interface Printable {
  print(): void;
}
class Document implements Printable {
  print() {
    console.log('printing...');
  }
}

// Type 实现
type Drawable = {
  draw(): void;
};
class Circle implements Drawable {
  draw() {
    console.log('drawing circle...');
  }
}
```

## 3. 高级特性

### 3.1 type 独有特性

```typescript
// 1. 计算属性
type Keys = 'firstname' | 'surname';
type DudeType = {
  [key in Keys]: string;
};

// 2. 条件类型
type TypeName<T> = T extends string
  ? 'string'
  : T extends number
  ? 'number'
  : T extends boolean
  ? 'boolean'
  : 'object';

// 3. 类型映射
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 4. 元组和数组
type StringNumberPair = [string, number];
type StringArray = string[];
```

### 3.2 interface 独有特性

```typescript
// 1. 声明合并
interface Box {
  height: number;
  width: number;
}
interface Box {
  scale: number;
}

// 2. 接口继承类
class Control {
  private state: any;
}
interface SelectableControl extends Control {
  select(): void;
}
```

## 4. 使用场景

### 4.1 使用 interface 的场景

- 定义对象的标准结构
- 需要利用声明合并
- 定义类的实现契约
- 开发库时需要扩展性

```typescript
// 对象标准结构
interface ApiResponse {
  code: number;
  data: any;
  message: string;
}

// 类实现契约
interface Repository<T> {
  find(id: string): Promise<T>;
  save(entity: T): Promise<void>;
}
```

### 4.2 使用 type 的场景

- 需要使用联合类型或交叉类型
- 需要使用元组类型
- 需要使用映射类型或条件类型
- 定义函数类型或复杂类型

```typescript
// 联合类型
type Status = 'draft' | 'published' | 'deleted';

// 函数类型
type Handler<T> = (event: T) => void;

// 映射类型
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

## 5. 总结

1. 优先使用 interface

   - 更符合面向对象设计
   - 更好的类型提示
   - 更容易扩展

2. 以下情况使用 type

   - 需要使用联合类型或交叉类型
   - 需要使用元组类型
   - 需要使用映射类型或条件类型
   - 需要使用其他高级类型特性

3. 保持一致性
   - 在项目中统一风格
   - 编写文档说明使用规范
   - 团队成员遵循相同的准则

## 6. 注意事项

1. 性能考虑

   - interface 的类型检查速度可能比 type 快
   - 过度使用联合类型可能影响类型检查性能

2. 可读性

   - 保持类型定义简单清晰
   - 适当添加注释说明
   - 避免过度复杂的类型运算

3. 维护性
   - 合理使用声明合并
   - 避免过度使用类型体操
   - 保持代码结构清晰

```
