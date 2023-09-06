// const router = require("koa-router")();
import koaRouter from "koa-router";
const router = koaRouter();

import { useDebug } from "../hooks/useDebug.js";
const debug = useDebug();

router.get("/", async (ctx, next) => {
  // await ctx.render("index", {
  //   title: "Hello Koa 2!",
  // });
  const { url, request, query: ctx_query, querystring: ctx_querystring } = ctx;
  //从request中获取GET请求
  const { origin, originalUrl, href, path, query, querystring } = request;

  console.log(ctx);

  // ctx.body = {
  //   url: ctx.url,
  //   request对象: ctx.request,
  // };
  await ctx.render("index", {
    title: "标题内容",
    ctx: ctx,
  });
});

// module.exports = router;
export default router;