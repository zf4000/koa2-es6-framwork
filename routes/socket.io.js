import koaRouter from "koa-router";
const router = koaRouter();

// 创建ws server
import socketIo from "../hooks/useSocketIo.js";
const { broadcast, getIoLevel, getScocket, broadcastNsp, broadcastRoom } =
  socketIo;
// const  =
//   useSocketIo();

// 得到服务端的层级结构
router.post("/ws/getNspLevel", (ctx) => {
  const nsp = getIoLevel();
  ctx.body = {
    success: true,
    nsp,
  };
});

// 服务端向客户端发送消息
router.post("/ws/makeServerMsg", (ctx) => {
  const { socketId } = ctx.request.body;
  const _socket = getScocket(socketId);
  _socket?.emit("$message", { msg: "服务端新消息" });
  ctx.body = "服务端处理完毕";
});
// 模拟服务端创建新盘头
router.post("/ws/makeNewPantou", (ctx) => {
  const { socketId } = ctx.request.body;
  const _socket = getScocket(socketId);
  _socket?.emit("$newPantou", { pantous: ["盘头1", "盘头2"] });
  ctx.body = "服务端处理完毕";
});

//获得服务端socket
router.post("/ws/getServerSocket", (ctx) => {
  const { socketId } = ctx.request.body;
  const socket = getScocket(socketId);
  console.log(socket);
  // 服务端对象不能直接传递给前端,必须在服务端控制台查看输出结果
  ctx.body = {
    success: true,
    msg: "服务器处理完毕,请在服务端控制台查看输出结果",
  };
});

// 命名空间内广播消息
router.post("/ws/makeNspMsg", (ctx) => {
  const { nsp } = ctx.request.body;
  broadcastNsp(nsp, "这是命名空间内的广播消息");
  ctx.body = "广播完毕";
});
router.post("/ws/makeRoomMsg", (ctx) => {
  const { room, nsp } = ctx.request.body;
  broadcastRoom(nsp, room, "这是房间内的广播消息");
  ctx.body = "广播完毕";
});
router.post("/ws/broadcast", (ctx) => {
  broadcast("这是广播消息");
  ctx.body = "广播消息";
});
// 使用浏览器客户端连接server,并发送消息
router.get("/ws/client", async (ctx) => {
  await ctx.render("ws", {
    ctx,
  });
});

export default router;
