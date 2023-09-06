import Koa from "koa";
const app = new Koa();

//允许跨域
import koa2 from "koa2-cors";
app.use(koa2());

// 获取 __dirname 的 ESM 写法
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

// nodejs错误处理
import { useErrorHandler } from "./hooks/useErrorHandler.js";
useErrorHandler(app);

// middlewares
import bodyparser from "koa-bodyparser";
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);

// 美化json的输出
import json from "koa-json";
app.use(
  json({
    pretty: true, // 禁用美化输出
    param: "pretty", // 美化输出的查询参数
    spaces: 2, // 美化输出的空格数
    // headers: { "X-Hello": "World" }, // 自定义响应头
  })
);

// 每次路由请求在控制台打印日志
import koaLogger from "koa-logger";
app.use(koaLogger());

// 静态资源
import _static from "koa-static";
app.use(_static(__dirname + "/public"));

// 定义模板引擎类型和模板路径
import views from "koa-views";
app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// 路由请求在控制台显示日志
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 自动载入routes所有的路由
import useRoute from "./hooks/useRoute.js";
const { loadAllRoute } = useRoute();
loadAllRoute(app);

export default app;
