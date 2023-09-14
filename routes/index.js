// const router = require("koa-router")();
import koaRouter from "koa-router";
const router = koaRouter();

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

router.all("/pdf", async (ctx, next) => {
  await ctx.render("pdfMaker", {
    test: "节流请求,pdf的生成",
  });
});

// module.exports = router;
export default router;
