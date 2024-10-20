import koaRouter from "koa-router";
const router = koaRouter();
import useSocketIo from "../hooks/useSocketIo.js";
const { publish } = useSocketIo();

// 使用浏览器客户端连接server
router.get("/socketio", async (ctx) => {
  await ctx.render("socket.io", {
    ctx,
  });
});

export default router;
