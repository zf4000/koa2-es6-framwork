import { useDebug } from "../hooks/useDebug.js";
const debug = useDebug();

// error handler
import onerror from "koa-onerror";

// 服务器端错误捕获
// 所有nodejs端的错误会汇集到下面代码中进行处理
const nodejsErrorHandler = () => {
  process.on("uncaughtException", (error) => {
    // 异常处理代码
    debug("process.on('uncaughtException') fired");
    console.error(error);
  });

  process.on("unhandledRejection", (error) => {
    // 异常处理代码
    debug("process.on('unhandledRejection') fired");
    console.error(error);
  });
};

export const useErrorHandler = (app) => {
  // 404路由错误处理中间件
  app.use(async (ctx, next) => {
    // 路由生效前的前置钩子可以这里写入
    await next();
    // 路由结束后输出,遵循后进先出的原则
    if (ctx.status == 404) {
      // 直接使用ctx.status,前端显示很low
      ctx.status = 404;
      debug("404错误", ctx.URL.href);

      //使用throw能同时被koa-onerror和app.on(error)捕获,不理解why
      // ctx.throw(404, "404错误,通过ctx.throw触发");
    }
  });

  //koa-onerror捕获错误:主要是路由错误,中间件错误
  onerror(app);

  // 例如内存泄漏、DNS解析错误、TLS握手失败等等
  app.on("error", (err, ctx) => {
    debug("app.on('error') fired", err, ctx);
  });

  //nodejs错误,
  nodejsErrorHandler();
};
