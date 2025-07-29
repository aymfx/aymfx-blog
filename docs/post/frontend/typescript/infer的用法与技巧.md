# infer 的用法与技巧

## 什么是 infer
`infer` 关键字用于在条件类型中推断类型变量。它只能在条件类型的 `extends` 子句中使用，可以帮助我们提取和推断类型信息。

## 基础用法

### 1. 提取函数返回值类型
```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// 示例
function foo() { return 42; }
type FooReturn = ReturnType<typeof foo>; // number
```

### 2. 提取数组元素类型
```typescript
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// 示例
type NumberArray = number[];
type Element = ArrayElement<NumberArray>; // number
```

### 3. 提取 Promise 值类型
```typescript
type PromiseType<T> = T extends Promise<infer U> ? U : T;

// 示例
type PromiseNumber = Promise<number>;
type Result = PromiseType<PromiseNumber>; // number
```

## 高级技巧

### 1. 提取函数参数类型
```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 示例
function greet(name: string, age: number) {}
type GreetParams = Parameters<typeof greet>; // [string, number]
```

### 2. 提取构造函数参数类型
```typescript
type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never;

// 示例
class Person {
  constructor(name: string, age: number) {}
}
type PersonConstructorParams = ConstructorParameters<typeof Person>; // [string, number]
```

### 3. 递归类型推断
```typescript
type UnpackNested<T> = T extends Promise<infer U>
  ? UnpackNested<U>
  : T;

// 示例
type NestedPromise = Promise<Promise<Promise<string>>>;
type Final = UnpackNested<NestedPromise>; // string
```

## 实际应用场景

### 1. 提取对象属性类型
```typescript
type PropType<T, K extends keyof T> = T extends { [P in K]: infer R } ? R : never;

// 示例
interface User {
  name: string;
  age: number;
}
type NameType = PropType<User, 'name'>; // string
```

### 2. 元组转联合类型
```typescript
type TupleToUnion<T> = T extends (infer U)[] ? U : never;

// 示例
type Tuple = [string, number, boolean];
type Union = TupleToUnion<Tuple>; // string | number | boolean
```

## 注意事项

1. `infer` 只能在条件类型的 `extends` 子句中使用
2. 同一个类型参数可以有多个 `infer` 声明
3. `infer` 推断的类型变量只能在条件类型的 true 分支中使用

## 总结

1. 使用有意义的类型变量名（如 `R` 表示返回值类型，`P` 表示参数类型）
2. 配合联合类型和交叉类型使用可以实现更复杂的类型推断
3. 在处理复杂的泛型类型时，可以使用多个 `infer` 语句来逐步推断类型
