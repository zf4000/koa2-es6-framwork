// 路由模板,拷贝后参考

import koaRouter from "koa-router";
const router = koaRouter();

// post
router.post("/post", async (ctx, next) => {
  // 获得post参数
  const post = ctx.request.body;
  if (!post) {
    return;
  }
  console.log("post参数", post);
  ctx.body = { success: true, msg };
});

// 返回字符串结果
router.get("/string", async (ctx, next) => {
  ctx.body = "koa2 string";
});

// 返回json结果,会通过koa-json美化
router.get("/json", async (ctx, next) => {
  ctx.body = {
    title: "koa2 json",
    test: {
      test1: "test1",
    },
  };
});

// demoVue2.pug模板,其中使用了vue2的模板
router.get("/demo", async (ctx, next) => {
  await ctx.render("vue2", { name: "Hello, Pug111!" });
});

router.get("/vue3", async (ctx, next) => {
  await ctx.render("vue3", { name: "Hello, Pug111!" });
});

export default router;
