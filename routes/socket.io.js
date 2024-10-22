import koaRouter from "koa-router";
const router = koaRouter();
import useSocketIo from "../hooks/useSocketIo.js";
const { publish, getIo } = useSocketIo();

// 使用浏览器客户端连接server
router.get("/socketio", async (ctx) => {
  await ctx.render("socket.io", {
    ctx,
  });
});

router.get("/socketio/test", async (ctx) => {
  const nsp = "/nsp-dingding";
  const clientId = getIo().of(nsp).sockets.keys().next().value;

  // 测试用例:向命名空间内容所有client发消息
  console.log("向命名空间内容所有client发消息");
  publish({ nsp }, ["向命名空间内容所有client发消息"]);

  // 测试用例:向房间所有客户端发消息--------room待完善,
  // console.log("向房间所有客户端发消息");
  // publish({ nsp, room: _room }, ["向房间所有客户端发消息"]);

  // 测试用例:向命名空间内某个具体的client发消息

  console.log("向命名空间内某个具体的client发消息", clientId);
  publish({ nsp, clientId }, ["向命名空间内某个具体的client发消息"]);

  // 测试用例:向某个client发消息
  console.log("向某个client发消息,需要遍历定位nsp", clientId);
  publish({ clientId }, ["向某个client发消息,需要遍历定位nsp"]);
  ctx.body = "publish完成";
});

export default router;
