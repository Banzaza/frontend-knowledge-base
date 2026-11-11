# TypeScript面试题

## 说说你对 typescript 的理解？与 javascript 的区别？

TypeScript 在JS基础上增加了静态类型系统以及对最新 ECMAScript 特性的支持，最终通过编译器（tsc）编译成纯 JavaScript 代码在浏览器或 Node.js 中运行。

1. 将错误拦截在“编译期”而非“运行时”

- JavaScript 是动态弱类型语言，拼写错误、传参类型不对、读取 undefined 的属性等问题，往往要等到代码上线、用户真正点击触发时才会崩溃（如经典的 Cannot read properties of undefined）。
- TypeScript 能在写代码（IDE 实时划线报错）和构建打包阶段就提前暴露绝大多数低级与逻辑类型错误。

2. 类型即文档（提升团队协作与可维护性）

- 在中大型项目或多人协作中，接口（interface）和类型别名（type）清晰地约束了函数入参、返回值以及后端 API 数据结构。开发者无需翻看底层实现或询问他人，直接通过类型定义就能看懂数据结构。

3. 极致的开发体验（IDE 智能提示与安全重构）

- 得益于静态类型推导，编辑器（如 VS Code）能提供极其精准的代码自动补全、参数提示和跨文件跳转。在修改某个字段名或函数签名时，全项目所有受影响的位置都会立刻标红，重构代码更有底气。

4. 渐进式采用（Zero-Cost Runtime Abstraction）

- TS 的所有类型标注在编译后都会被彻底擦除（Type Erasure），不会给运行时增加任何额外的性能负担或体积开销。同时允许与现有的 JS 文件混用（逐步迁移）。

## 说说 typescript 的数据类型有哪些？

### 一、 继承自 JavaScript 的基础类型（8 种）

- string：字符串类型（如 'hello'、模板字符串）。
- number：数字类型（包含整数、浮点数、十六进制、NaN、Infinity）。
- boolean：布尔值（true / false）。
- null 与 undefined：在开启严格空值检查（strictNullChecks: true，现代项目默认开启）时，它们各自是独立的类型，不能随意赋值给其他类型。
- bigint：大整数类型（如 100n），用于表示超出 Number.MAX_SAFE_INTEGER 的整数。
- symbol：全局唯一标识符（如 Symbol('id')）。
- object：表示非原始类型（即除上述 7 种原始类型以外的所有值，如普通对象、数组、函数）。注：日常开发中更推荐用 `interface`、`type` 或 `Record<string, unknown>` 精确描述对象结构，而非宽泛的 object。

### 二、 复合与引用类型

- 数组（Array）：有两种等效写法，例如 number[] 或泛型写法 `Array<number>`；只读数组可用 `readonly number[]`。
- 函数（Function）：用于约束参数类型与返回值类型，例如 (x: number, y: number) => number。
- 对象字面量 / 接口（interface）/ 类型别名（type）：用于描述具体对象的键值结构、可选属性（?）和只读属性（readonly）。

### 三、 TypeScript 独有的特殊类型（核心考点）

1. 顶级类型（Top Types）

- any（任意类型）：关闭对该变量的所有类型检查，允许访问任意属性、调用任意方法，也可赋值给任何其他类型。相当于退化回纯 JS，应尽量避免滥用。
- unknown（未知类型，安全版的 any）：任何值都可以赋值给 unknown，但在对它执行任何操作（如调用方法、读取属性）或赋值给其他具体类型之前，必须先进行类型收窄（如 typeof、instanceof 或类型断言）。

2. 底层与空返回类型

- void（空类型）：通常用于表示函数没有返回值（默认返回 undefined）。
- never（永不存在的值的类型）：表示永远不会有正常返回值的状态，是所有类型的子类型。常见于两种情况：函数内部直接抛出异常（throw new Error()）或陷入死循环（while (true) {}）；联合类型在条件分支中被穷尽收窄后的剩余兜底分支（常用于穷尽性检查 Exhaustiveness Checking）。

3. 特定结构类型

- tuple（元组）：限制了元素数量和每个位置对应类型的特殊数组。例如 let pair: [string, number] = ['age', 18]（支持可选元素 [string, number?] 和标签元组 [name: string, age: number]）。
- enum（枚举）：用于定义一组带名字的常量集合（支持数字枚举、字符串枚举和常量枚举 const enum），在编译后通常会被转换为双向映射的 JS 对象（字符串枚举为单向）。
- 字面量类型（Literal Types）：将具体的值本身作为类型，例如 'success' | 'error' 或 200 | 404 | 500，常与联合类型搭配使用。

### 四、 常见组合与高级类型概念

- 联合类型（Union Types |）：表示取值可以是多种类型中的一种，例如 string | number。
- 交叉类型（Intersection Types &）：将多个类型合并为一个新类型（兼具所有类型的成员），例如 Person & Serializable。

## 对象字面量 / 接口（interface）/ 类型别名（type）区别？分别适合什么场景？

### 一、 三者的核心定义与直观对比

1. 对象字面量类型（Object Literal Type）：直接在变量、参数或返回值位置写死的结构（如 user: { name: string; age: number }），没有名字，属于“一次性匿名结构”。
2. 接口（interface）：专门用于描述对象、类（Class）和函数结构的契约，支持面向对象式的继承（extends）和同名自动合并。
3. 类型别名（type）：用于给任意类型起一个新名字，不仅能描述对象，还能表示基本类型、联合类型、元组、映射类型等所有 TS 类型。

### 二、 、 关键差异代码演示

1. 声明合并（interface 独有能力）

当多个同名 interface 出现时，TypeScript 会自动把它们的成员合并为一个完整接口（这也是第三方库和全局 Window 对象扩展类型的核心机制）：

```typescript
interface User {
  name: string;
}

interface User {
  age: number;
}

// 合法：User 自动合并为 { name: string; age: number }
const u: User = { name: "Alice", age: 25 };

// 报错：标识符“Person”重复
type Person = { name: string };
type Person = { age: number };
```

2. 表达非对象与复杂计算类型（type 独有能力）

interface 只能描述“对象长什么样”，而 type 可以操作和组合任何类型：

```typescript
// 联合类型（interface 无法表达）
type Status = "pending" | "success" | "error";
type ID = string | number;

// 元组类型（interface 无法直接定义固定长度元组）
type Coordinate = [number, number];

// 映射类型 / 工具类型（interface 无法使用 in 运算符）
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};
```

3. 扩展冲突时的处理差异（extends vs &）

- interface 使用 extends 继承时，如果父子接口存在同名但类型不兼容的属性，TS 会在定义阶段立刻报错，安全性更高。
- type 使用交叉类型 & 合并同名不兼容属性时，不会在定义时报错，而是会把该属性悄悄合并为 never 类型，直到实际赋值时才报错。

### 三、使用场景

1. 对象字面量 的场景：

- 局部、一次性且结构极简的数据（例如某个内部工具函数的配置参数 options?: { silent?: boolean }），没必要专门抽离命名以减少代码噪音。

2. interface 的场景：

- 描述业务实体与 API 数据模型（如 User、OrderDetail、ProductItem）。
- 定义 React 组件的 Props 和 State（业界主流约定，语义清晰且报错提示更友好）。
- 面向对象的类契约（implements）以及公共库/SDK 的对外类型暴露（方便使用方利用 interface 的声明合并特性自行扩展类型）。

3. type 的场景：

- 定义联合类型、字面量枚举替代品、元组或函数回调签名（如 type ClickHandler = (e: MouseEvent) => void）。
- 使用工具类型（Pick、Omit、Partial）或编写高级类型体操（映射类型、条件类型）来派生新类型。

## 说说你对 TypeScript 中枚举类型的理解？应用场景？

TypeScript 中的枚举（enum）是一种用于定义一组命名常量集合的特殊数据类型，它能将业务中缺乏语义的“魔法数字”或零散字符串映射为具有清晰可读性的具名标识符。 与普通 TS 类型在编译后被完全擦除不同，普通 enum 在编译后会生成真实的 JavaScript 对象，属于兼具“类型约束”和“运行时值”的双向特性。

### 一、 枚举的 4 种主要形态与底层特征

1. 数字枚举（Numeric Enums）

- 默认自增：如果不指定初始值，默认从 0 开始依次递增；若为某一项指定了数字，后续成员会在此基础上继续 +1。
- 双向映射（核心特性）：编译成 JS 后，不仅可以通过枚举名获取值（Direction.Up === 0），还可以通过值反向查找到枚举名（Direction[0] === 'Up'）。

```typescript
enum Direction {
  Up = 1, // 指定初始值为 1
  Down, // 自动递增为 2
  Left, // 3
  Right, // 4
}
console.log(Direction.Up); // 1
console.log(Direction[1]); // 'Up'（反向映射）
```

2. 字符串枚举（String Enums）

- 显式初始化：每个成员都必须用字符串字面量进行初始化（不支持自增）。
- 单向映射：编译后的 JS 对象没有反向映射，但在调试或查看网络请求日志时，其值为可读的字符串（如 'SUCCESS'），语义清晰，比数字更易排查问题。

```typescript
enum OrderStatus {
  Pending = "PENDING",
  Paid = "PAID",
  Shipped = "SHIPPED",
}
```

3. 异构枚举（Heterogeneous Enums）

- 混合了数字和字符串成员的枚举（如 enum Mix { No = 0, Yes = 'YES' }）。官方与业界均不推荐使用，容易导致逻辑混乱。

4. 常量枚举（const enum）

- 编译期完全内联：在 enum 前加上 const 关键字后，编译器不会生成任何运行时 JS 对象，而是直接将引用处替换为对应的字面量常量（零运行时体积开销）。

```typescript
const enum HttpCode {
  OK = 200,
  NotFound = 404,
}
const code = HttpCode.OK;
// 编译后的 JS 仅剩一行：const code = 200;
```

- 使用限制：不能访问反向映射；在开启 isolatedModules: true（如 Vite、Babel 或单文件转译环境）或发布跨包 .d.ts 类型声明时存在兼容性陷阱（若跨模块引用，开启 preserveConstEnums 才安全）。

### 二、 典型应用场景

1. 替代业务代码中的“魔法数字”与硬编码字符串

- 例如用户角色权限（Admin = 1、Editor = 2）、订单状态流转、支付渠道标识、HTTP 状态码等。使用 UserRole.Admin 代替裸写的 1，能大幅提升代码可读性和重构安全性。

2. 需要“运行时枚举遍历”与“表单下拉选项映射”的场景

- 当页面上的 `<Select>` 下拉框选项、状态标签文案映射表（如 `Record<OrderStatus, string>`）需要与后端约定的状态值严格对齐时，enum 既能做函数入参的类型校验，又能直接作为运行时对象被 Object.values() 遍历渲染。

3. 位运算权限组合（Bitmask Flags）

- 利用数字枚举配合左移位运算符（1 << 0、1 << 1、1 << 2），可以用单个整数高效存储和校验多项组合权限（常见于底层引擎、文件系统权限或复杂富文本状态控制）。

### 三、 现代 TS 工程中的争议与替代方案

在现代前端工程（尤其是追求极致 Tree-shaking 和兼容 erasableSyntaxOnly / Node.js 原生类型剥离运行环境的项目）中，原生 enum 常因生成额外运行时 IIFE 闭包代码、不利于 Tree-shaking 以及数字枚举在旧版 TS 中存在类型安全漏洞而受到审视。
业界普遍推荐用 as const 对象 + 联合类型 作为更轻量的现代替代方案：

```typescript
// 现代替代方案：as const 对象 + 派生联合类型（零额外闭包、完美 Tree-shaking、原生支持 Node 直接运行）
export const OrderStatus = {
  Pending: "PENDING",
  Paid: "PAID",
  Shipped: "SHIPPED",
} as const;

// 自动提取出联合类型：'PENDING' | 'PAID' | 'SHIPPED'
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

function updateOrder(status: OrderStatus) {
  // 既支持直接传入 'PAID'，也支持传入 OrderStatus.Paid，兼具提示与严格校验
}
```

## 说说你对 TypeScript 中接口的理解？应用场景？

TypeScript 中的接口（interface）是用于定义对象形状（Shape）与行为契约的核心抽象机制。 它的本质是“鸭子类型”（Duck Typing / 结构化类型系统）的体现——只要一个对象具备接口所要求的所有属性和对应类型，TypeScript 就认为它符合该接口，而无需显式声明它们之间的继承关系。所有 interface 仅存在于编译期，编译成 JavaScript 后会被完全擦除，不产生任何运行时代码开销。

### 一、 对 interface 核心特性的理解

1. 结构化类型检查（Structural Typing）

- 与 Java/C# 等名义类型语言不同，TS 的接口不关心对象是由哪个具体类实例化出来的，只关心对象的“内部结构”是否匹配。

2. 精细化的属性控制

- 可选属性（?）：允许某些字段在对象中缺失（如 email?: string）。
- 只读属性（readonly）：限制属性仅在对象创建时赋值，后续不可修改（如 readonly id: number）。
- 索引签名（Index Signature）：用于描述键名动态变化的字典对象（如 [key: string]: unknown）。

3. 支持函数签名与可索引类型

- 接口不仅能描述普通对象，还能描述函数结构（调用签名 (source: string): boolean）和数组/类数组结构。

4. 继承（extends）与声明合并（Declaration Merging）

- 支持单继承与多继承（interface C extends A, B），能够将多个基础契约优雅组合成复杂模型。
- 同名接口在同一个作用域下会自动合并属性，这为扩展第三方库类型或全局对象提供了极大的灵活性。

### 二、 interface 的典型应用场景

1. 定义前后端交互的 API 数据模型（DTO / Entity）

在前端项目中，接口最常见的用途是清晰刻画后端接口返回的 JSON 结构或表单提交的请求体结构，让 IDE 在读取字段时提供精准自动补全：

```typescript
interface UserProfile {
  readonly id: string;
  username: string;
  avatar?: string;
  roles: string[];
}
```

2. 约束前端框架组件的 Props 与事件回调

在 React、Vue 等现代框架中，使用 interface 声明组件的输入参数（Props）是业界标准做法，能让组件调用方在传错属性名或漏传必填参数时立刻收到编译器警告：

```typescript
interface ButtonProps {
  label: string;
  disabled?: boolean;
  onClick: (event: MouseEvent) => void;
}
```

3. 面向对象编程中的类契约（implements）

当多个不同的类需要对外暴露统一的行为规范（如不同的支付方式、不同的日志上报器、不同的存储引擎）时，可以用 interface 定义统一标准，强制要求类实现指定的方法和属性：

```typescript
interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string) {
    return localStorage.getItem(key);
  }
  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }
}
```

4. 编写第三方库声明文件（.d.ts）与全局类型扩展

当你封装公共 SDK 或需要为全局对象（如 window、第三方插件配置项）挂载自定义属性时，利用 interface 的声明合并特性，可以在不修改原库源码的前提下无缝补充类型定义：

```typescript
// 扩展浏览器全局 Window 对象
interface Window {
  __APP_VERSION__: string;
}

window.__APP_VERSION__ = "2.1.0"; // 类型安全，不再报错
```

三、 使用接口时的最佳实践建议

- 遵循最小接口原则（接口隔离）：避免定义一个包含几十个可选字段的“巨无霸接口”，应按业务职责拆分为多个小接口，再通过 extends 按需组合。
- 优先使用 readonly 保护不可变数据：对于后端返回的原始 ID、时间戳或状态配置，合理添加 readonly 修饰符，从编译层面防止业务代码意外篡改数据。

## 说说你对 TypeScript 中类的理解？应用场景？

TypeScript 中的类（class）在完全兼容 ES6 原生 class 语法的基础上，引入了完整的静态类型约束与面向对象（OOP）修饰符。 它既是一个运行时的构造函数（值），同时又自动生成一个同名的实例结构类型，极大增强了代码的封装性、可维护性与多态扩展能力。

一、 对 TypeScript 类核心增强特性的理解

相比原生的 JavaScript class，TypeScript 赋予了类以下关键编译期能力：

1. 访问修饰符（Access Modifiers）—— 强化封装性
   - public（默认）：公开成员，在类内部、子类以及类外部实例上均可自由访问。
   - protected（受保护）：仅允许在当前类内部及其子类内部访问，外部实例无法直接调用。
   - private（TS 编译期私有）：仅允许在当前类内部访问（子类和外部均不可访问）。注意：TS 的 private 仅在编译阶段检查，编译成 JS 后依然是普通属性（若需运行时真正的硬私有，可使用 ES 原生的 #field 私有字段语法）。
2. 只读与参数属性简写（readonly & Parameter Properties）
   - readonly：限制属性只能在声明时或 constructor 构造函数内初始化，之后不可篡改。
   - 参数属性简写：在 constructor 参数前直接加上访问修饰符或 readonly，TS 会自动声明同名属性并完成 this.xxx = xxx 赋值，大幅减少样板代码。
3. 抽象类（abstract class）—— 模板方法与多态基石
   - 抽象类不能被直接 new 实例化，只能作为基类被其他类继承。
   - 内部可以包含已实现的具体通用方法，也可以定义不带实现的抽象方法（abstract method()），强制要求所有非抽象子类必须各自实现这些方法。
4. 接口实现（implements）与明确赋值断言（!）
   - 通过 class A implements InterfaceB 强制校验类的结构是否满足外部契约。
   - 在开启严格属性初始化检查（strictPropertyInitialization）时，类的实例属性必须在声明时或构造函数中赋值（除非使用 !: 明确告知编译器该属性将由外部框架注入初始化）。

二、 综合代码示例

```typescript
abstract class BaseService {
  // 参数属性简写：自动创建 protected readonly serviceName 属性并赋值
  constructor(protected readonly serviceName: string) {}

  // 具体通用方法
  protected log(msg: string): void {
    console.log(`[${this.serviceName}] ${msg}`);
  }

  // 抽象方法：强制子类实现具体执行逻辑
  abstract execute(): Promise<void>;
}

class PaymentService extends BaseService {
  private retryCount = 0; // 仅限本类内部访问

  async execute(): Promise<void> {
    this.retryCount++;
    this.log(`正在执行第 ${this.retryCount} 次支付校验...`);
  }
}

const payment = new PaymentService("Alipay");
payment.execute();
// payment.log('test'); // 编译报错：属性“log”受保护，只能在类“BaseService”及其子类中访问
// payment.retryCount = 5; // 编译报错：属性“retryCount”为私有属性
`

三、 典型应用场景

1. 后端 Node.js 架构与全栈服务层（如 NestJS、TypeORM）
   - 在企业级 Node.js 框架中，class 是绝对的核心载体：控制器（Controller）、业务服务（Service）、数据实体模型（Entity）均基于类构建，配合修饰符和装饰器（Decorators）实现依赖注入（DI）、路由映射和数据库表结构绑定。
2. 复杂状态管理、SDK 封装与底层引擎开发
   - 当需要封装具有内部私有状态和生命周期的对象时（例如：WebSocket 连接管理器、Axios 请求拦截器实例、Canvas/WebGL 渲染引擎、自定义缓存池），使用 class 可以将内部连接池、重连计数器等状态用 private 彻底隐藏，只对外暴露干净的公共 API。
3. 跨平台多态适配器（抽象类 + 接口契约）
   - 当业务需要对接多种底层实现时（例如：文件上传需要同时支持阿里云 OSS、AWS S3 和本地存储；或者多端登录适配），可以定义一个 abstract class Uploader 封装统一的进度计算和校验逻辑，再由各个子类分别实现具体的上传细节。
4. 自定义业务错误体系
   - 通过继承原生 Error 类（如 class ApiError extends Error），挂载 statusCode、errorCode 等强类型业务字段，配合 instanceof ApiError 实现精准的全局异常捕获与分类处理。

四、 现代前端开发中的选型建议

- UI 组件层（React / Vue 3）：现代前端更推崇函数式组件 + Hooks / Composition API，因为纯函数组合在状态复用、逻辑拆分和 Tree-shaking 上比类组件（如早期的 React Class Component）更轻量灵活。
- 领域模型（Domain Model）、工具 SDK 与服务端架构：凡是涉及封装内部状态、继承多态、面向对象设计模式（单例、策略、工厂模式）的场景，TypeScript 的 class 依然是不可替代的最佳选择。

## 说说你对 TypeScript 中函数的理解？与 JavaScript 函数的区别？

TypeScript 中的函数是在完全兼容 JavaScript 函数运行时行为的基础上，为其参数、返回值、上下文（this）以及调用模式加上了静态类型契约。 它让函数从单纯的“可执行代码块”变成了具有严格输入/输出边界的“强类型接口”，在编译期就能拦截参数数量不匹配、传参类型错误或返回值漏处理等隐患。

一、 对 TypeScript 函数核心特性的理解

1. 完整的输入与输出签名约束
   - 可以为每个参数指定类型，并显式声明（或由 TS 自动推导）返回值类型。无返回值时使用 void，永远抛错或死循环时使用 never。
2. 显式的可选参数与默认参数规则
   - 可选参数（?）：必须放在必选参数之后（例如 (a: string, b?: number)），其类型会自动变为 T | undefined。
   - 默认参数（=）：带默认值的参数会被 TS 自动识别为可选参数，且不强制要求必须放在最后（若在前面，调用时传 undefined 即可触发默认值）。
3. 函数重载（Function Overloads）—— 精确表达多态签名
   - 当一个函数根据传入参数的类型或数量不同，会返回不同类型的结果时，可以通过编写多个“重载签名”和一个“实现签名”来提供极其精准的类型推导（外部调用者只能看到重载签名）。
4. 显式约束 this 参数（Fake this Parameter）
   - TS 允许在函数参数列表的第一位写一个假参数 this: SomeType（编译成 JS 时会被彻底删除），用于强制约束调用该函数时的上下文指向，防止回调函数中 this 丢失引发 Bug。
5. 类型谓词（Type Predicates is）
   - 函数的返回值类型可以写成 param is Type，使其成为自定义类型守卫，在 if 判断后自动帮编译器收窄变量类型。

二、 TypeScript 函数与 JavaScript 函数的核心区别

对比维度 JavaScript 函数 TypeScript 函数
参数个数校验 极度宽松：多传参数会被忽略（可通过 arguments 获取），少传参数自动变为 undefined，均不报错。 严格校验：传入的参数个数必须与函数签名声明的必选/可选参数范围严格匹配，多传或少传都会编译报错。
参数与返回值类型 无静态限制：任何类型都能传入，返回值全靠开发者自觉保证或运行时判断。 强类型约束：参数类型不匹配直接报红；若声明了返回值类型，函数体内所有分支必须返回对应类型。
函数重载支持 原生不支持：只能在一个函数体内用 typeof / arguments.length 手动判断，调用方无法获得精确的返回类型提示。 原生支持编译期重载：通过多条重载签名，让不同入参自动映射到对应的精确返回值类型。
this 上下文检查 运行时动态决定：写错 this 指向只有在代码真正执行时才会报错。 编译期静态检查：可通过假参数 this: Context 锁定调用上下文，调用方式不对直接编译报错。
泛型（Generics）支持 不支持：无法建立“输入参数类型”与“返回值类型”之间的动态关联。 支持（<T>）：能让函数在保持通用性的同时，自动捕获输入类型并原样推导给返回值（如 identity<T>(arg: T): T）。

三、 核心特性代码对比示例

```typescript
// 1. 函数重载（Overloads）：根据入参精确推导返回类型
function formatInput(val: number): string;
function formatInput(val: string): number;
// 实现签名（对外隐藏，需兼容上述所有重载）
function formatInput(val: number | string): string | number {
  return typeof val === "number" ? val.toFixed(2) : Number(val);
}

const strRes = formatInput(100); // TS 精确推导出 strRes 为 string 类型
const numRes = formatInput("42"); // TS 精确推导出 numRes 为 number 类型
// formatInput(true); // 编译报错：没有与此调用匹配的重载

// 2. 显式约束 this 参数（编译后自动擦除）
interface Button {
  label: string;
  onClick(this: Button): void;
}

const btn: Button = {
  label: "提交",
  onClick() {
    console.log(this.label);
  },
};

btn.onClick(); // 正常
const fn = btn.onClick;
// fn(); // 编译报错：类型为“void”的“this”上下文不能分配给类型为“Button”的方法的“this”
`

四、 最佳实践建议

- 参数类型必写，返回值类型按需显式声明：内部简单工具函数可依赖 TS 自动推导返回值以保持简洁；但对外暴露的公共 API、库函数或复杂业务函数，建议显式标注返回值类型，防止内部修改逻辑时意外改变了返回结构而不自知。
- 优先使用联合类型 + 泛型替代过度重载：只有当“入参类型”与“返回类型”存在明确的对应映射关系时才使用函数重载；若不同入参都返回相同类型，直接用联合类型（如 fn(x: string | number): void）更简洁。

## 说说你对 TypeScript 中泛型的理解？应用场景？

TypeScript 中的泛型（Generics）是一种“类型参数化”机制——它允许我们在定义函数、接口、类或类型别名时不预先指定具体的类型，而是像传递函数参数一样传入“类型变量”（如 <T>），直到实际调用或实例化时才确定具体类型。 它的核心价值在于：在保证最大程度代码复用的同时，完全保留完整的静态类型推导与安全检查（避免退化为失去类型保护的 any）。

一、 对泛型核心机制的理解

1. 建立“输入”与“输出”之间的类型联动
   - 如果用 any 写一个通用函数 function identity(arg: any): any，虽然能接收任何参数，但返回值类型信息也彻底丢失了。
   - 使用泛型 function identity<T>(arg: T): T，TS 会在调用时自动捕获传入实参的具体类型赋值给 T，并将同样的类型精确推导给返回值。
2. 泛型约束（Generic Constraints extends）
   - 默认情况下，泛型变量 T 代表“可能是任何类型”，因此不能直接访问它的特定属性（如 arg.length）。
   - 通过 <T extends { length: number }>，可以限制传入的类型必须具备某些最小结构特征，既保证了内部访问的安全性，又保留了泛型的灵活性。
3. 泛型默认类型（Default Type Parameters）
   - 类似于函数的默认参数，泛型支持设置默认类型（如 interface ApiResponse<T = any>），当调用方未显式传入类型参数且无法自动推导时，自动回退到默认类型，降低使用门槛。
4. 多类型参数与 keyof 联动
   - 支持同时声明多个关联的泛型变量（如 <T, K extends keyof T>），实现对象键名与对应属性值的严格类型联动校验。

二、 泛型的四大典型应用场景

1. 封装通用的后端接口响应包装器（最常见业务场景）

后端 API 通常有统一的外层结构（code、message），只有核心业务数据 data 随不同接口变化。使用泛型接口可以避免为每个接口重复写外层结构：

```typescript
interface ApiResponse<TData = unknown> {
  code: number;
  message: string;
  data: TData;
}

interface UserInfo {
  id: number;
  name: string;
}

// 复用外层结构，同时精确约束 data 为 UserInfo 类型
async function fetchUser(): Promise<ApiResponse<UserInfo>> {
  const res = await fetch("/api/user");
  return res.json();
}
`

2. 编写类型安全的通用工具函数与容器类

例如编写一个安全读取对象属性的工具函数，通过 <T, K extends keyof T> 防止拼写不存在的属性名，并精确推导出返回值类型：

```typescript
function getProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
): T[K] {
  return obj[key];
}

const user = { id: 101, name: "Alice" };
const userName = getProperty(user, "name"); // TS 自动推导出 userName 为 string 类型
// getProperty(user, 'age'); // 编译报错：类型“"age"”的参数不能赋给类型“"id" | "name"”的参数
`

3. 构建高复用性的前端组件与自定义 Hooks（React / Vue）

在封装通用表格（Table<T>）、下拉选择器（Select<T>）或数据请求 Hook（useRequest<T>）时，泛型能让组件内部渲染逻辑与外部传入的数据项结构无缝对齐：

```typescript
// 通用列表组件 Props 约束
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
// 当传入 items={users} 时，renderItem(item) 的参数 item 会自动获得 User 类型提示
`

4. 构建高级类型体操与内置工具类型（Utility Types）

TypeScript 内置的 Partial<T>、Pick<T, K>、Omit<T, K>、Record<K, V> 等核心工具类型，底层全部是基于泛型 + 映射类型 / 条件类型实现的，用于对现有类型进行批量转换与派生。

三、 泛型 vs any vs 联合类型 选型对比

维度 any 联合类型 (string | number) 泛型 (<T>)
类型安全性 无（完全跳过检查） 高（限定在枚举出的几种类型内） 极高（自动锁定调用时的具体类型）
输入输出关联性 无法关联 无法锁定（输入 string 时，输出依然是宽泛的 string | number） 精确锁定（输入 string，输出必然推导为 string）
适用场景 临时兼容无类型遗留代码 明确只允许某几种固定类型传入 通用组件、数据结构容器、工具库及异步请求封装

## 说说你对 TypeScript 中高级类型的理解？有哪些？

TypeScript 中的高级类型，本质上是基于基础类型进行“类型编程”的机制，旨在让类型系统能够动态描述 JavaScript 中复杂多变的数据结构与运行逻辑。它们在保持静态类型安全的同时，极大地提升了代码的复用性与灵活性。
可以参考 TypeScript 中文手册 和 freeCodeCamp TypeScript 高级类型清单 深入了解，常见的高级类型主要分为以下几类：

1. 组合与分支类型

- 联合类型（Union Types）： 使用 | 连接多个类型（如 string | number），表示变量可以是其中任意一种类型。常配合类型守卫缩小范围。
- 交叉类型（Intersection Types）： 使用 & 合并多个类型（如 A & B），新类型将同时拥有所有类型的成员属性。常用于对象混入（Mixin）场景。
- 可辨识联合（Discriminated Unions）： 结合字面量类型、联合类型与类型守卫的模式。多个接口拥有相同的单例特征字段（如 kind: 'circle' | 'square'），编译期可根据该字段精准收窄类型。

2. 类型查询与映射机制

- 类型索引（keyof 与索引访问）： keyof T 用于获取类型 T 所有公共属性名的联合类型；T[K] 则用于查询属性 K 对应的具体类型。
- 映射类型（Mapped Types）： 通过 in 关键字遍历联合类型（通常是 keyof T），批量生成新的对象类型。例如将所有属性变为只读或可选：

```ts
type ReadonlyObj<T> = { readonly [P in keyof T]: T[P] };
`

- 条件类型（Conditional Types）： 形如 T extends U ? X : Y，根据类型兼容性进行三元判断，在类型层面上实现分支逻辑。常配合 infer 关键字提取内部类型（如提取函数返回值）。

3. 类型收窄与安全控制

- 类型守卫（Type Guards）： 在运行时通过 typeof、instanceof、in 或自定义谓词（param is Type）检查变量，让编译器在特定代码块内自动缩小类型范围。
- 类型别名（Type Aliases）： 使用 type 为复杂类型起别名，支持泛型和递归引用，常用于简化嵌套结构或联合类型。

4. 内置实用工具类型（Utility Types）

TypeScript 基于映射类型和条件类型内置了大量开箱即用的工具类型：

- 属性修饰： Partial<T>（全可选）、Required<T>（全必填）、Readonly<T>（全只读）。
- 结构裁剪与重组： Pick<T, K>（提取指定属性）、Omit<T, K>（剔除指定属性）、Record<K, T>（构造键值对映射）。
- 联合过滤： Exclude<T, U>（从联合中排除）、Extract<T, U>（提取交集）、NonNullable<T>（剔除 null 和 undefined）。

## 说说你对 TypeScript 装饰器的理解？应用场景？

TypeScript 装饰器（Decorators）是一种特殊的声明语法（@expression），本质上是在编译或运行时对类及其成员进行拦截、包装与元编程（Metaprogramming）的高阶函数。它允许开发者在不修改原始类内部代码的前提下，声明式地注入横切关注点（AOP）逻辑或附加元数据。

1. 核心理解与运行机制

- 本质是高阶函数： 装饰器在代码加载/类定义阶段（而非实例化阶段）执行，接收目标对象（如构造函数、原型、属性名或描述符）作为参数，并可选择返回新的定义来替换原实现。
- 两套规范并存：
  - 传统实验性装饰器（Legacy）： 需开启 experimentalDecorators: true。支持类、方法、访问器、属性和参数装饰器，通常配合 reflect-metadata 库实现运行时类型反射。
  - 标准装饰器（TC39 Stage 3 / TS 5.0+）： TypeScript 5.0 原生支持的标准实现（无需额外配置开关），提供统一的 context 上下文对象（如 addInitializer），语义更规范，但不支持参数装饰器。
- 执行顺序： 当多个装饰器修饰同一目标时，遵循“由上至下求值，由下至上执行”的洋葱模型（类似函数组合 f(g(x))）。

2. 五种装饰器类型（以经典规范为例）

- 类装饰器（Class Decorators）： 应用于类构造函数，可用于监视、修改或替换类定义（如注册全局单例、注入静态属性）。
- 方法装饰器（Method Decorators）： 接收目标原型、方法名和属性描述符（PropertyDescriptor），常用于劫持并重写原方法逻辑。
- 访问器装饰器（Accessor Decorators）： 应用于 get / set 访问器，用于控制属性的读写拦截。
- 属性装饰器（Property Decorators）： 声明在类属性上，通常用于记录属性元数据（如校验规则、字段映射）。
- 参数装饰器（Parameter Decorators）： 应用于构造函数或方法的参数位置，主要配合元数据记录参数索引（仅实验性规范支持）。

3. 典型应用场景

- 依赖注入（IoC / DI）与框架架构： 现代服务端框架（如 NestJS）和前端框架（如 Angular）的核心基石。通过 @Injectable()、@Controller() 自动管理类的实例化与依赖装配。
- 声明式路由与接口定义： 在 Node.js 后端开发中，利用 @Get('/users')、@Body() 将 HTTP 请求路径与参数自动映射到控制器方法上。
- AOP 切面逻辑（日志、权限与缓存）： 通过方法装饰器实现 @Log()（自动记录入参和耗时）、@Auth('admin')（接口鉴权拦截）或 @Memoize()（结果缓存），彻底剥离非业务代码。
- 数据校验与序列化（ORM / DTO）： 配合 class-validator 或 TypeORM，使用 @IsEmail()、@Column() 定义字段约束与数据库表结构映射。
- 防抖、节流与错误边界： 在前端交互或异步请求中，直接通过 @Debounce(300) 或 @CatchError() 修饰类方法，简化状态管理。

## 说说对 TypeScript 中命名空间与模块的理解？区别？

在 TypeScript 中，模块（Module）是遵循现代 ES 模块标准、以单个文件为作用域的代码组织方式，而命名空间（Namespace）是 TypeScript 早期为了在全局作用域下解决命名冲突而设计的内部代码分组机制。 现代 TypeScript 开发中，模块是绝对的主流和推荐标准，命名空间仅在极少数全局类型声明或兼容旧代码的场景下使用。

一、 核心概念理解

1. 模块（Module，即外部模块）
   - 文件即模块：在 TypeScript 中，只要一个文件顶部包含顶级的 import 或 export，它就会被视为一个独立的模块；否则，它的内容会被视为全局可见（脚本模式）。
   - 独立作用域：模块内部定义的变量、函数、类默认是私有的，只有显式 export 导出后，其他文件才能通过 import 引入，彻底杜绝了全局命名空间污染。
   - 依赖解析：依赖关系在代码层面清晰可见，打包工具（如 Vite、Webpack、Rollup）可以据此构建依赖图谱并执行 Tree-shaking（摇树优化）。
2. 命名空间（Namespace，早期称为“内部模块”）
   - 逻辑包裹容器：使用 namespace Name { ... } 关键字包裹代码，外部需要通过 Name.xxx 的点语法访问其内部通过 export 暴露的成员。
   - 本质是运行时对象：编译成 JavaScript 后，namespace 会被转换为一个立即执行函数（IIFE），并将成员挂载到一个全局或外层变量对象上。
   - 跨文件合并：多个同名 namespace（即使分布在不同文件中）会自动合并成一个完整的命名空间对象。

二、 模块与命名空间的核心区别

对比维度 模块（Module） 命名空间（Namespace）
作用域隔离机制 基于文件：每个文件天然拥有独立的词法作用域。 基于代码块：依赖 namespace {} 语法包裹，本质仍挂载在所属作用域的单一对象下。
标准规范 遵循标准 ECMAScript Modules (ESM) 规范。 TypeScript 特有的非标准历史语法（Node.js 原生类型剥离运行模式默认禁止非类型 namespace）。
依赖管理方式 显式声明依赖（import ... from '...'），结构清晰。 依赖全局引入顺序（如 <script> 标签先后顺序或 /// <reference path="..." /> 三斜线指令），隐式耦合严重。
打包与 Tree-shaking 完美支持：构建工具可静态分析未使用的导出并安全剔除。 支持极差：由于编译为单一挂载对象，打包工具很难安全剔除对象内部未使用的属性/方法。
同文件多模块支持 不支持（一个文件对应一个模块）。 支持（可在同一个文件内定义多个 namespace 甚至嵌套命名空间）。

三、 代码形态直观对比

1. 模块写法（现代标准推荐）

```typescript
// math.ts
export function add(a: number, b: number): number {
  return a + b;
}

// app.ts
import { add } from "./math";
console.log(add(1, 2));
```

2. 命名空间写法及编译产物

```typescript
// validation.ts
namespace Validation {
  const lettersRegexp = /^[A-Za-z]+$/; // 内部私有
  export function isLettersOnly(s: string): boolean {
    return lettersRegexp.test(s);
  }
}

console.log(Validation.isLettersOnly("Hello"));

// 编译后的 JS 产物（生成 IIFE 闭包挂载对象）：
// var Validation;
// (function (Validation) {
// const lettersRegexp = /^[A-Za-z]+$/;
// function isLettersOnly(s) { return lettersRegexp.test(s); }
// Validation.isLettersOnly = isLettersOnly;
// })(Validation || (Validation = {}));
`

四、 适用场景与选型建议

- 99% 的业务与库开发 —— 严格使用模块（Module）：
  - 所有现代前端项目（React、Vue、Angular）、Node.js 后端服务以及 npm 第三方包开发，都应直接使用 ES 模块（import/export）。不需要在模块文件内部再套一层多余的 namespace（这会导致访问路径变成冗余的 import { Foo } from './foo'; Foo.Foo.bar()）。
- 命名空间（Namespace）仅剩的合理应用场景：
  1.  编写全局库的类型声明文件（.d.ts）：当你要为一个通过 <script> 标签引入、在全局挂载单一变量（如 jQuery 的 $ 或 AMap 高德地图 SDK）的第三方库编写 declare namespace 类型声明时，命名空间非常契合其全局挂载结构。
  2.  合并函数/类与附属子类型（声明合并）：在同一个模块内部，有时会利用同名的 function/class 与 namespace 进行声明合并，为函数或类挂载额外的静态子类型（例如 export function createStore() {} 搭配 export namespace createStore { export interface Options {} }）。

## 说说如何在React项目中应用TypeScript？

在 React 项目中应用 TypeScript 的核心，是为组件（Props/State）、Hooks、事件处理器（Events）以及全局状态/网络请求建立清晰的类型契约。 现代 React 结合 TypeScript 推崇“尽量利用类型自动推导，只在边界处显式标注”的原则，既能避免写过多冗余代码，又能彻底消除传参错误和空值崩溃。

一、 核心场景实战指南

1. 组件（Components）与 Props 类型约束

现代 React 推荐使用纯函数组件配合 interface 定义 Props（不建议再使用旧式的 React.FC，因为它曾隐式包含 children 且对泛型支持不佳）：

```tsx
import React from "react";

interface UserCardProps {
  name: string;
  age?: number; // 可选属性
  role: "admin" | "guest"; // 字面量联合类型，精准提示
  children?: React.ReactNode; // 显式声明子元素类型
  onSelect: (userName: string) => void; // 回调函数签名
}

export function UserCard({
  name,
  age = 18,
  role,
  children,
  onSelect,
}: UserCardProps) {
  return (
    <div onClick={() => onSelect(name)}>
      <h3>
        {name} ({role}) - {age}岁
      </h3>
      {children}
    </div>
  );
}
`

- 继承原生 HTML 属性：封装基础 UI 组件（如自定义按钮、输入框）时，可使用 React.ComponentPropsWithoutRef<'button'> 自动继承原生标签的所有属性（如 disabled、className、type）：

```tsx
interface CustomButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "danger";
}
```

2. 常用 Hooks 的类型标注

- useState：基础类型可直接依赖自动推导；当初始值为 null 或联合类型时，需显式传入泛型参数：

```tsx
const [count, setCount] = useState(0); // 自动推导为 number
const [user, setUser] = useState<UserProfile | null>(null); // 显式指定联合类型
```

- useRef：分为“DOM 元素引用”和“可变普通变量容器”两种用法：

```tsx
// 1. 获取 DOM 元素（初始传 null，且元素类型需匹配）
const inputRef = useRef<HTMLInputElement>(null);
const focusInput = () => inputRef.current?.focus();

// 2. 存储不触发重渲染的可变值（注意与 DOM ref 区分，不传 null 即可变）
const timerIdRef = useRef<number | undefined>(undefined);
```

- useReducer：利用可辨识联合类型（Discriminated Unions）约束 Action，让 switch 分支拥有极致的类型收窄提示：

```tsx
type CounterAction = { type: "INCREMENT"; step: number } | { type: "RESET" };

function reducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case "INCREMENT":
      return state + action.step; // 自动推导 action 含有 step
    case "RESET":
      return 0;
  }
}
```

3. DOM 事件处理（Event Handlers）

React 封装了合成事件（SyntheticEvent），在编写独立事件处理函数时，需指定对应的事件泛型与目标元素类型：

```tsx
// 表单输入变化事件
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value); // e.target.value 自动推导为 string
};

// 按钮点击事件
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
};

// 表单提交事件
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};
```

(小技巧：如果直接把回调写在 JSX 内联中，如 onChange={(e) => ...}，TS 会自动推导出 e 的类型，无需手动标注。)

4. 全局上下文（useContext）与自定义 Hooks

- createContext 空值安全封装：创建 Context 时通常没有合适的默认实例，推荐搭配自定义 Hook 消除每次使用时的 null 判空：

```tsx
interface AuthContextType {
  token: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 内部使用");
  }
  return context; // 返回值收窄为非空的 AuthContextType
}
```

- 自定义 Hook 返回值：若返回数组形式（类似 useState），务必加上 as const 断言，否则 TS 会将其推导为宽泛的联合数组而非固定位置的元组：

```tsx
function useToggle(initial = false) {
  const [state, setState] = useState(initial);
  const toggle = () => setState((prev) => !prev);
  return [state, toggle] as const; // 精确推导为 readonly [boolean, () => void]
}
`

二、 工程化配置与目录组织最佳实践

1. 开启严格模式（tsconfig.json）
   - 务必开启 "strict": true（尤其是 strictNullChecks）以及 "noUncheckedIndexedAccess": true（防止数组越界访问未判空），从源头杜绝运行时 Cannot read properties of undefined。
2. 类型文件分层管理
   - 组件私有 Props：直接写在当前 .tsx 文件顶部，无需单独抽离。
   - 领域模型与 API 接口类型：按业务模块存放在 src/types/ 或 src/api/types/ 下（如 user.types.ts、order.types.ts），配合泛型 Axios 封装（request.get<UserInfo>('/api/user')）实现从接口请求到页面渲染的全链路类型打通。
3. 泛型组件与高阶抽象
   - 对于通用的 <Table<T> />、<VirtualList<T> /> 组件，利用泛型 <T extends { id: string | number }> 约束列表数据项，让调用方在写 renderRow={(item) => ...} 时直接获得完整的行数据字段提示。

## 说说如何在Vue项目中应用TypeScript？

在 Vue 3 项目中应用 TypeScript 的核心模式是结合 <script setup lang="ts"> 与组合式 API（Composition API），通过编译期宏（如 defineProps、defineEmits）和响应式泛型，为组件通信、状态管理及模板引用提供端到端的静态类型保护。

一、 工程环境初始化与基础配置

1. 脚手架创建：使用官方推荐的 npm create vue@latest，在交互选项中直接勾选 TypeScript（底层自动集成 Vite + vue-tsc）。
2. IDE 插件：在 VS Code 中安装官方插件 Vue - Official（原 Volar），它能在 .vue 单文件组件的 <template> 模板中直接提供与 TS 同步的类型检查与自动补全。
3. 类型检查命令：Vite 默认仅做语法转译不做类型检查，因此构建脚本通常配置为 "build": "vue-tsc --noEmit && vite build"，确保打包前执行全量类型校验。

二、 核心组件开发与类型标注实战

在 Vue 3.3+ / 3.5+ 中，结合 <script setup lang="ts"> 的标准写法如下：

1. 响应式数据标注（ref 与 reactive）

- ref：基础类型通常自动推导；复杂对象或联合类型通过泛型指定（如 ref<User | null>(null)）。
- reactive：直接通过接口约束变量类型（不建议直接写 reactive<User>()，因为若内部包含嵌套 ref 解包，显式标注 const state: User = reactive(...) 类型更精准）。

```html
<script setup lang="ts">
  import { ref, reactive, computed } from "vue";

  interface User {
    id: number;
    name: string;
  }

  // 1. ref 联合类型
  const currentUser = ref<User | null>(null);

  // 2. reactive 状态对象
  const formState: { keyword: string; page: number } = reactive({
    keyword: "",
    page: 1,
  });

  // 3. computed 自动推导返回类型，也可显式指定 computed<string>(() => ...)
  const displayName = computed(() => currentUser.value?.name ?? "游客");
</script>
```

1. 组件通信：defineProps 与 defineEmits（纯类型声明）

利用编译期泛型宏，无需编写繁琐的运行时 PropType，还可直接解构 Props 并赋予默认值（Vue 3.5+ 原生支持响应式 Props 解构）：

```html
<script setup lang="ts">
  // 1. 声明 Props 接口并直接解构赋默认值
  interface CardProps {
    title: string;
    count?: number;
    status?: "active" | "disabled";
  }

  const { title, count = 0, status = "active" } = defineProps<CardProps>();

  // 2. 声明 Emits 事件签名（支持元组简写语法）
  const emit = defineEmits<{
    update: [id: number, value: string];
    close: []; // 无参数事件
  }>();

  function handleSave() {
    emit("update", 101, title); // 参数类型与数量严格校验
  }
</script>
`

3. 模板引用（useTemplateRef / ref）与组件实例类型

- 原生 DOM 元素：使用 useTemplateRef<HTMLInputElement>('inputRef')（Vue 3.5+）或 ref<HTMLInputElement | null>(null)。
- 子组件实例类型：使用 InstanceType<typeof ChildComponent> 获取子组件通过 defineExpose 暴露的方法与属性类型。

```html
<script setup lang="ts">
  import { useTemplateRef, onMounted } from "vue";
  import ChildModal from "./ChildModal.vue";

  // 获取原生 DOM 节点类型
  const inputEl = useTemplateRef<HTMLInputElement>("myInput");

  // 获取子组件实例类型
  const modalRef = useTemplateRef<InstanceType<typeof ChildModal>>("myModal");

  onMounted(() => {
    inputEl.value?.focus();
    modalRef.value?.openModal(); // 自动提示子组件 defineExpose 暴露的方法
  });
</script>

<template>
  <input ref="myInput" />
  <ChildModal ref="myModal" />
</template>
`

三、 生态集成与常见工程场景

1. 依赖注入（provide / inject）：使用 Vue 提供的 InjectionKey<T> 包装 Symbol，让跨层级注入的数据自动携带类型，无需手动类型断言。

```typescript
// keys.ts
import type { InjectionKey, Ref } from "vue";
export const ThemeKey: InjectionKey<Ref<"light" | "dark">> = Symbol("theme");
`

1. 状态管理（Pinia）：Pinia 原生对 TS 极度友好，在 Setup Store 写法中（defineStore('user', () => { ... })），所有 ref、computed 和方法会自动完成类型推导，无需额外编写复杂的 Action/Mutation 类型模板。
2. DOM 事件处理：在模板中绑定原生事件时，事件对象通常会自动推导；若抽离为独立处理函数，可显式标注 (e: Event) 并收窄目标元素 (e.target as HTMLInputElement).value。

四、 Vue + TS 最佳实践建议

- 抽取跨组件公共类型：将复用的 Props 接口或后端 API 数据模型抽离到独立的 .ts 文件（如 types/user.ts）中并导出，避免单文件组件过于臃肿。
- 开启模板严格类型检查：在 tsconfig.json 的 vueCompilerOptions 中开启 "strictTemplates": true，确保 <template> 中向子组件传递的属性名和类型同样受到 TS 编译器的严格校验

## 在 Typescript 中如何实现类型标记 Pick 与 Omit

在 TypeScript 中，Pick 和 Omit 都是内置的泛型工具类型，底层基于“映射类型（Mapped Types）”和“索引访问类型”实现。 Pick 用于从源对象类型中挑选指定属性构成新类型，而 Omit 则通过组合 Pick 和 Exclude 来剔除指定属性。

一、 Pick<T, K> 的手写实现与原理解析

源码实现

```typescript
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
`

核心机制拆解

- K extends keyof T：泛型约束。确保传入的键名联合类型 K 必须是源对象类型 T 中真实存在的属性名，防止拼写不存在的字段。
- [P in K]：映射类型遍历。逐个遍历联合类型 K 中的每一个属性名 P。
- T[P]：索引访问类型。原封不动地取出源类型 T 中对应属性 P 的值类型（同时保留原属性的可选性 ? 和只读性 readonly 修饰符）。

二、 Omit<T, K> 的手写实现与原理解析

源码实现

```typescript
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

(注：如果不依赖内置 Pick 和 Exclude，完全展开的写法如下：)

```typescript
type MyOmitStandalone<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};
`

核心机制拆解

- K extends keyof any：keyof any 等价于 string | number | symbol。这里故意不写成 K extends keyof T，是为了允许开发者安全地剔除 T 中原本可能不存在的冗余属性名，提高工具类型的容错性与灵活性。
- Exclude<keyof T, K>：底层利用分布式条件类型（T extends U ? never : T），从 T 的所有键名中过滤掉属于 K 的键名，得到“保留下来的剩余键名”。
- Pick<T, ...>：将过滤后剩余的键名交由 Pick 重新映射出完整对象类型。

三、 实战使用示例

```typescript
interface User {
  readonly id: number;
  name: string;
  email: string;
  password?: string;
}

// 1. 使用 MyPick：仅挑选用于列表展示的字段
type UserPreview = MyPick<User, "id" | "name">;
// 等价于: { readonly id: number; name: string; }

// 2. 使用 MyOmit：剔除敏感字段 password，生成前端安全模型
type SafeUser = MyOmit<User, "password">;
// 等价于: { readonly id: number; name: string; email: string; }
`

四、 常见注意事项（同态映射特性）

- 修饰符自动保留：由于 [P in K] 属于同态映射类型（Homomorphic Mapped Type），源对象中的 readonly 和 ?（可选）标记会自动继承到新生成的类型中，无需手动重新声明。
- 严格键名校验版本（StrictOmit）：如果团队希望在调用 Omit 写错字段名时也能像 Pick 一样立即编译报错，可以自定义一个严格约束版本：type StrictOmit<T, K extends keyof T> = Omit<T, K>;。

## 什么是协变与逆变

协变（Covariance）与逆变（Contravariance）是描述复杂类型（如函数、数组、泛型）之间的子类型关系，如何随其内部组件的子类型关系而变化的规则。简单来说，它决定了在 TypeScript 中，什么情况下可以将一个子类型安全地赋值给父类型（里氏替换原则在类型系统中的体现）。
为了方便理解，先设定一个基础继承关系：Dog 是 Animal 的子类型（即 Dog extends Animal，狗比动物拥有更多具体特征）。

1. 协变（Covariance）：保持方向一致

- 核心定义： 如果 Dog 是 Animal 的子类型，那么 Container<Dog> 也是 Container<Animal> 的子类型。子类型关系的传递方向与原类型完全一致。
- 常见场景： 普通对象属性、数组（Array<T>）、Promise（Promise<T>）以及函数的返回值。
- 代码示例：

``ts
  interface Animal { name: string; }
  interface Dog extends Animal { bark(): void; }

// 1. 变量赋值（协变）：Dog 赋值给 Animal
let dog: Dog = { name: '旺财', bark: () => {} };
let animal: Animal = dog; // 安全：Dog 拥有 Animal 的所有属性

// 2. 函数返回值（协变）：返回 Dog 的函数可以赋值给返回 Animal 的函数
type GetAnimal = () => Animal;
type GetDog = () => Dog;

let getDog: GetDog = () => dog;
let getAnimal: GetAnimal = getDog; // 安全：调用者期望得到 Animal，实际拿到 Dog 完全满足需求
`

1. 逆变（Contravariance）：方向完全反转

- 核心定义： 如果 Dog 是 Animal 的子类型，那么 Handler<Animal> 反而是 Handler<Dog> 的子类型。子类型关系的传递方向与原类型相反。
- 常见场景： 函数的参数类型（在开启 strictFunctionTypes: true 时生效）。
- 代码示例：

```typescript
type FeedAnimal = (animal: Animal) => void;
type FeedDog = (dog: Dog) => void;

let feedAnimal: FeedAnimal = (a) => console.log(a.name);
let feedDog: FeedDog = (d) => d.bark();

// 逆变：接收父类型(Animal)的函数，可以赋值给接收子类型(Dog)的函数
feedDog = feedAnimal; // 安全：feedAnimal 只需要 name 属性，传入 Dog 绰绰有余

// 反过来则不安全：
// feedAnimal = feedDog; //  报错：feedDog 内部会调用 d.bark()，若传入一只普通 Animal（如 Cat）会运行时崩溃
```

1. 四种变型（Variance）快速对比

变型类型 类型关系方向（假设 Sub 是 Super 的子类） 典型应用场景
协变 (Covariant) T<Sub> 是 T<Super> 的子类（同向） 对象属性、数组、函数返回值
逆变 (Contravariant) T<Super> 是 T<Sub> 的子类（反向） 函数参数（严谨模式下）
双向协变 (Bivariant) 两者互为子类（既可同向也可反向） TS 关闭严格模式时的函数参数、类的方法声明（为兼容 JS 生态）
不变 (Invariant) 两者毫无继承关系，不可互相赋值 既读又写的可变引用（如同时作为参数和返回值的泛型 <T>(x: T) => T）

4. 一句话记忆口诀

- “产出协变，消费逆变”：当类型处于输出位置（如函数返回值、只读属性）时，允许传入更具体的子类型（协变）；当类型处于输入位置（如函数参数）时，只能接收更宽泛的父类型（逆变），这样才能保证运行时绝对不会因为缺少属性或方法而报错。

## 在 ts 中如何实现 Partial

在 TypeScript 中，内置的 Partial<T> 工具类型通过“映射类型（Mapped Types）”实现，它遍历目标对象类型的所有属性，并在每个属性后添加可选修饰符 ?，从而将所有属性变为可选。

一、 Partial<T> 的标准手写实现

```typescript
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};
```

核心语法拆解

- keyof T：索引类型查询，获取类型 T 中所有公共属性名组成的联合类型。
- [P in keyof T]：映射类型遍历，依次迭代 keyof T 中的每一个属性名 P。
- ?：可选属性修饰符，为每一个遍历出的属性添加可选标记（等价于 T[P] | undefined）。
- T[P]：索引访问类型，保留原属性 P 对应的值类型（同时会自动保留原属性的 readonly 修饰符）。

二、 实际使用示例

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// 经过 MyPartial 处理后，所有属性均变为可选
type UpdateUserDto = MyPartial<User>;
// 等价于: { id?: number; name?: string; email?: string; }

// 常用于局部更新（PATCH）接口，无需传入完整对象
function updateUser(id: number, fields: UpdateUserDto) {
  // ...
}

updateUser(1, { name: "Bob" }); // 合法
```

三、 进阶扩展：递归实现深层可选 DeepPartial<T>

内置的 `Partial<T>` 属于浅层转换（仅作用于第一层属性）。如果对象内部包含嵌套子对象，需要结合条件类型进行递归处理：

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function // 排除函数类型（函数在 TS 中也是 object 的子类型）
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

interface Config {
  server: {
    host: string;
    port: number;
  };
  debug: boolean;
}

// 嵌套的 server.port 也可以省略
const customConfig: DeepPartial<Config> = {
  server: {
    host: "localhost",
  },
};
`

## 在 ts 中什么是 infer，并实现 Parameters 与 ReturnType

在 TypeScript 中，infer 是用于在条件类型（extends）中进行“类型模式匹配与提取”的关键字。 它允许你在 extends 子句中声明一个待推断的局部类型变量，自动从传入的复杂类型（如函数签名、Promise、数组、元组等）内部“抠出”某一部分的类型，并在条件为真的分支（? 之后）中直接引用它。

一、 对 infer 核心机制的理解

你可以把 infer 理解为类型层面的“解构赋值”或“正则捕获组”：

- 使用位置限制：infer R 只能出现在条件类型的 extends 子句右侧，且推断出的变量 R 只能在条件成立的分支（True 分支）中使用。
- 多位置推断的合并规则：如果同一个 infer R 变量在多个位置被同时捕获：
  - 处于协变位置（如函数返回值、对象属性）时，推断结果为联合类型（A | B）。
  - 处于逆变位置（如函数参数）时，推断结果为交叉类型（A & B）。

二、 手写实现 Parameters<T> 与 ReturnType<T>

这两个内置工具类型正是 infer 最经典的应用：

1. 实现 Parameters<T>（提取函数参数元组类型）

```typescript
type MyParameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;
`

- 原理解析：
  - T extends (...args: any) => any：泛型约束，确保传入的 T 必须是一个函数类型。
  - (...args: infer P) => any：用剩余参数语法搭配 infer P 匹配函数的整个参数列表，将其捕获为一个元组类型 P。
  - 若匹配成功则返回参数元组 P，否则返回 never。

2. 实现 ReturnType<T>（提取函数返回值类型）

```typescript
type MyReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;
`

- 原理解析：
  - (...args: any) => infer R：忽略参数列表的具体类型，专门在返回值位置放置 infer R 捕获函数的返回类型。
  - 若匹配成功则返回 R（注：TS 官方内置源码的假分支兜底写的是 any，你也可以根据需要写 never）。

三、 实战使用示例

```typescript
function createUser(name: string, age: number, isAdmin?: boolean) {
  return {
    id: Date.now(),
    name,
    age,
    isAdmin: Boolean(isAdmin),
  };
}

// 1. 提取参数列表元组类型
type CreateUserParams = MyParameters<typeof createUser>;
// 结果: [name: string, age: number, isAdmin?: boolean | undefined]

// 2. 提取返回值对象类型（无需手动单独定义 User 接口）
type CreatedUser = MyReturnType<typeof createUser>;
// 结果: { id: number; name: string; age: number; isAdmin: boolean; }

// 实际应用：封装高阶日志函数，完整透传原函数参数与返回值类型
function withLog<T extends (...args: any[]) => any>(fn: T) {
  return (...args: MyParameters<T>): MyReturnType<T> => {
    console.log("调用参数:", args);
    return fn(...args);
  };
}
`

四、 infer 的其他常见高频用法速览

- 提取数组元素类型：type ElementType<T> = T extends (infer U)[] ? U : T;
- 提取 Promise 内部值：type PromiseValue<T> = T extends Promise<infer V> ? V : T;
- 字符串模板匹配提取：type TrimLeft<S extends string> = S extends ${infer Rest} ? TrimLeft<Rest> : S;
