import koaRouter from "koa-router";
const router = koaRouter();

router.get("/", async (ctx, next) => {
  const { url, request, query: ctx_query, querystring: ctx_querystring } = ctx;
  //从request中获取GET请求
  const { origin, originalUrl, href, path, query, querystring } = request;
  await ctx.render("index", {
    title: "标题内容",
    ctx: ctx,
  });
});

router.get("/help", async (ctx, next) => {
  const { url, request, query: ctx_query, querystring: ctx_querystring } = ctx;
  //从request中获取GET请求
  const { origin, originalUrl, href, path, query, querystring } = request;
  await ctx.render("help", {
    title: "帮助",
    ctx: ctx,
  });
});

// 连接mysql测试

// 连接sqlite测试

router.all("/all", async (ctx, next) => {
  await ctx.render("pdfMaker", {
    test: "节流请求,pdf的生成",
  });
});

// module.exports = router;
export default router;
