import koaRouter from "koa-router";
const router = koaRouter();

import { useDebug } from "../hooks/useDebug.js";
const debug = useDebug();

// 错误处理触发
router.get("/throwError", async (ctx, next) => {
  // 1.throw new error,会被koa-onerror捕获,在浏览器中显示友好的错误信息,否则只会看到500错误,
  // throw new Error("路由中抛出错误");

  // 2.语法错误,会被koa-onerror捕获,在浏览器中显示友好的错误信息,否则只会看到500错误,
  // eval("ttt()");

  // 3,异步结果异常,这种异步错误不会被koa的app.on('error')捕获,因为koa已经响应完毕了,
  // setTimeout(() => {
  //   throw new Error("timeout error");
  // }, 1000);

  // 4,status错误,会被koa-onerror捕获
  // ctx.throw(500, "500错误,会消失");
  // ctx.body = { msg: "触发错误" };

  ctx.body = "错误触发";
});
export default router;
