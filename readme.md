# koa2-ES6-framwork 说明

一个使用 koa2+es6+pug 技术栈搭建的项目模板,可使用它快速搭建简易版的 nodejs 服务

## package.json 中各个包的作用

### koa-json

koa-json 是一个用于 Koa 框架的中间件，用于将 JavaScript 对象转换为 JSON 格式并将其作为响应主体发送给客户端。它的主要作用是简化在 Koa 应用程序中发送 JSON 响应的过程。

```js
ctx.body = JSON.stringify({ foo: 'bar' });
ctx.type = 'application/json';
使用koa-json后,可以简化为：
ctx.body = { foo: 'bar' };
```

koa-json 还提供了一些其他功能，例如指定响应的状态代码和自定义响应头。例如，以下代码将返回一个带有自定义响应头的 JSON 响应：

```js
const Koa = require("koa");
const json = require("koa-json");
const app = new Koa();
app.use(
  json({
    pretty: false, // 禁用美化输出
    param: "pretty", // 美化输出的查询参数
    spaces: 2, // 美化输出的空格数
    headers: { "X-Hello": "World" }, // 自定义响应头
  })
);
app.use(async (ctx) => {
  ctx.body = { foo: "bar" };
});
```

### debug

debug 是一个可以在 Node.js 中进行调试的小型工具包。它可以帮助开发者在应用程序中加入调试语句，以便在应用程序运行时输出有关应用程序状态的信息，而无需打开调试器或断点调试。使用 debug，开发者可以将调试语句添加到应用程序中，以便在必要时启用它们，并在不需要时禁用它们。
debug 的主要功能包括：

- 添加调试语句：使用 debug()函数添加调试语句，例如：
- 启用/禁用调试语句：使用环境变量来控制是否启用调试语句。例如，在 Linux 或 macOS 中，可以使用以下命令启用调试语句：
- 支持命名空间：使用命名空间来对调试语句进行分组和分类。例如，可以使用以下代码创建名为 myapp:server 的调试语句：
- debug('xxx')在 windows 下不会输出信息,必须通过 cross-env DEBUG=myapp nodemon bin/www.js 在设置了环境变量的基础上,才会有输出

### koa-logger

koa-logger 是一个用于记录 Koa 应用程序请求和响应的中间件。它可以输出请求和响应的信息，例如请求方法、URL、响应状态码和响应时间等，以便开发者了解应用程序的运行状况。koa-logger 还可以帮助开发者诊断请求和响应的问题，例如慢速响应或响应状态码错误等。

### koa-onerror

koa-onerror 是一个用于捕获 Koa 应用程序中错误并输出错误信息的中间件。它可以捕获应用程序中的同步错误和异步错误，并将错误信息输出到控制台或日志文件中，以便开发者了解错误的原因和位置。

- 不使用 onerror 时,如果路由中 throw new error,浏览器上会显示 500,如果使用了,浏览器会显示友好的错误信息

### koa-views

koa-views 是一个用于在 Koa 应用程序中渲染模板的中间件。它支持多种模板引擎，例如 EJS、Pug 和 Handlebars 等，可以将模板与数据结合起来生成 HTML 页面。koa-views 提供了一个简单的 API，使开发者可以轻松地将模板渲染成 HTML，并将其作为响应发送给客户端。
你也可以不使用 koa-views 来进行模板渲染,参考 noViews.js,

### log4js 日志处理

### vue3 模板

### 无头浏览器嵌入 23
