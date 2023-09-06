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

## todo

### vue3 模板

### tailwind 支持

### 生产环境下,定义 log4js 的 logger 级别为 debug,输出一些 debug 级别的信息

cross-env 设置启动时的环境变量
process.env 能看到环境变量

### pdf 导出服务制作

用户可能会选择 500 个报告导出为一个 PDF 文件，一次请求 500 个报告会卡死，所以需要分批异步，通过队列或者控制并发请求数来进行控制，
队列包，最好是基于 redis 的轻量队列

通过筛选条件筛选出需要处理的报告 id
将这些 id 传给服务,服务对这些报告进行分片，根据分片结果生成请求计划
启动 Puppeteer,在 Puppeteer 中展示一个地址,这个地址可能是 php 页面也可能是前端页面(vue 页面)
Puppeteer 观察页面中的状态元素来判断是否请求完成，完成后打印为 PDF，
这个页面做的事情:

- 执行上面的请求计划，注意缓流，减少并发请求数，
- 页面中根据每次请求的报告结果，修改 vue 变量，也可以获得所有报告结果后，一次性渲染到页面中，渲染完成后修改状态元素

服务提供一个 api，可查看请求进度，下载 PDF，删除 pdf 功能，
禁止同时进行多个导出任务，后期引入队列后考虑支持多个
