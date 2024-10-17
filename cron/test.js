// 必须使用export default来声明函数
import { logger } from "../app.js";

import socketIo from "../hooks/useSocketIo.js";
const { broadcast, getIoLevel, getScocket, broadcastNsp, broadcastRoom } =
  socketIo;

export default () => {
  logger.info("test.js fired");

  // 往房间(dingding/zhizao)的所有客户端的 新盘头频道 发布消息
  // _socket?.emit("$newPantou", { pantous: ["盘头1", "盘头2"] });
  broadcastNsp("/jeff", "asdfasdf");
  broadcastNsp("/", "bbbb");
  // broadcast("broadcast msg");
};
