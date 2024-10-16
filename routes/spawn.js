import koaRouter from "koa-router";
const router = koaRouter();

//#region  执行命令行 spawn 测试
router.get("/spawn", async (ctx, next) => {
  const { url, request, query: ctx_query, querystring: ctx_querystring } = ctx;
  //从request中获取GET请求
  const { origin, originalUrl, href, path, query, querystring } = request;
  await ctx.render("spawn", {
    title: "帮助",
    ctx: ctx,
  });
});
import { useSpawn } from "../hooks/useSpawn.js";
router.post("/spawn", async (ctx, next) => {
  const child = await useSpawn({
    onData: (data) => {
      ctx.body = {
        data: data.toString(),
      };
    },
  });

  ctx.body = {
    url: ctx.url,
    request对象: ctx.request,
  };
});
//#endregion  执行命令行 spawn 测试

export default router;
