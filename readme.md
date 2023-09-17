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

cross-env 设置启动时的环境变量
process.env 能看到环境变量

### pdf 导出服务制作

- 场景

  > 用户可能会选择 500 个报告导出为一个 PDF 文件，一次请求 500 个报告会卡死，所以需要分批异步，通过队列或者控制并发请求数来进行控制
  > 可以看到后台的 pdf 处理进度,100%后显示预览按钮,点击显示 pdf 文件

- 前端交互

  > web 点击导出全部按钮,筛选条件传递给 php,获得所有报告 id 的集合
  > web 请求 nodejs(传递 ids),等待完成
  > 轮询 nodejs 服务,判断处理进度,全部处理完成后,显示导出按钮,
  > 点击导出按钮可打开 pdf 文件

- nodejs 服务

  > 删除 1 个月前的 pdf 文件
  > nodejs 启动 Puppeteer,在 Puppeteer 中展示一个地址,这个地址是个容器(位于前端项目的 public/目录下)
  > 直接将 ids 传入 Puppeteer 中页面.
  > 启动消费任务,等待执行完毕
  > nodejs 观察 Puppeteer 页面中的状态元素,来判断是否请求完成，
  > 完成后打印为 PDF,生成一个 pdf 文件
  > 修改状态变量 renderOver
  > nodejs 提供一个 api，可返回请求进度,供前端调用,
  > 禁止同时进行多个导出任务，后期引入队列后考虑支持多个,队列包，最好是基于 redis 的轻量队列包(有些现成的 nodejs 包的)

- puppeteer 页面:

  > 对这些报告进行分片，根据分片结果生成请求计划
  > 执行上面的请求计划(请求 php 获得报告内容)，缓流
  > 获得所有报告后,修改 vue 变量,
  > 报告内容中包括打印模板信息,异步载入 sfc  
  > 全部渲染完毕,修改状态元素
  > 可设置@print 和固定表头

- 开发须知

  > pupetter 打开的页面是一个 crm 框架中的顶级路由(#/sfcLoad),这个顶级路由只负责从 crm/public 目录下载入 sfc 文件
  > 根据项目需要开发打印预览页面-sfc 文件,放在 crm/public 目录下,
  > 这个页面可以使用 tailwindcss 等框架包,符合开发习惯
  > 在 lis 项目中,这个预览页面还需要根据报告内容中的打印模板字段,从 public 目录中再次载入打印模板(sfc)-嵌套载入 sfc,可以将 vue3-sfc-loader 作为模块传递.
  > 调整打印格式时,可以直接在 web 项目开发模式下进行调试,
  > 代码中使用 debug 可以将调试信息输出到 nodejs 控制台,很有用

### pdf 导出测试

- 如何调试 web 项目中的预览页面
  puppeteer 会打开 sfcLoader 路由,
  puppeteer 增加 window.params 对象,加入属性:{ids,sfcLoader 路由,previewUrl-public 文件}
  sfcLoader.vue 会载入预览组件: window.params.previewUrl
  预览组件再分批消费 window.params.ids

- 调试预览页面时,
  浏览器输入/sfcLoader 路由,
  sfcLoader 中判断是否 puppeteer 环境,
  如果不是 puppeteer 会自动从 /public/pdf/appendWindowMethods.ts 中载入测试数据,并绑定方法到 window 对象上
  getTestData 函数中,一般,需要加入人工设置 windows.params 变量(ids,previewUrl,等),增加 window.debug 函数等方便进行 vue 文件调试

## to do

- 导出文件目前只能时 test1.pdf,
- 页面尺寸,打印方向,边距,页码等设置和传递
