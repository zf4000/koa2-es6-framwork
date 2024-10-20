// 必须使用export default来声明函数
import { logger } from "../app.js";

import useSocketIo from "../hooks/useSocketIo.js";
const { publish } = useSocketIo();

export default () => {
  logger.info("test.js fired");

  // 往房间(dingding/zhizao)的所有客户端的 新盘头频道 发布消息
  // _socket?.emit("$newPantou", { pantous: ["盘头1", "盘头2"] });
  // publish("/jeff", "asdfasdf");
  // 往丁丁项目/织造车间所有的客户端,发送新盘头
  publish({ nsp: "dingding", room: "zhizaoChejian" }, ["盘头1", "盘头2"]);
  // publish("/", "bbbb");
  // broadcast("broadcast msg");
};
