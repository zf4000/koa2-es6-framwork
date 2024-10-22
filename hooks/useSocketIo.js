import { Server } from "socket.io";
import { useLogger } from "./useLogger.js";
const logger = useLogger();
let _isBind = false;
let _io = null;

/**
 * 客户端连接后,需要迁入的房间
 * 为简化逻辑,一般不需要,
 * 以下场景可能用到:
 * 新消息下发给某个部门的人,按部门建立房间
 * 待完善,
 */
const _room = null;
const _clientEvents = ["$message"]; //客户端event

//遍历所有的nsp,找到指定的socket客户端
const getScocket = (id) => {
  const io = getIo();
  const namespaces = io._nsps.keys();
  for (const namespace of namespaces) {
    const socket = io.of(namespace).sockets.get(id);
    if (socket) {
      // 找到特定命名空间中的socket实例
      return socket;
    }
  }
  return null;
};

// 得到io实例
const getIo = () => _io;

// 得到服务器端所有的命名空间的层级结构
const getAllNsp = () => {
  const io = getIo();
  const nsp = [];
  // 所有ns
  io._nsps.forEach((item, key) => {
    // 所有room
    const rooms = [];
    item.adapter.rooms.forEach((_item, _key) => {
      rooms.push({
        name: _key,
        sockets: Array.from(_item).map((_) => {
          return { id: _ };
        }),
      });
    });
    nsp.push({ name: key, rooms });
  });
  return nsp;
};

// 服务器端io的层次结构
const getAllNspDesc = () => {
  let ret = "所有命名空间层次结构:\n";
  const obj = getAllNsp();
  obj.forEach((nsp) => {
    ret += "  " + JSON.stringify(nsp) + "\n";
  });
  return ret;
};

/**
 *
 * @param {object} target 配置项{nsp, room, clientId, channel}
 * @param {string} msg 消息内容
 * @returns
 */
const publish = (target, msg) => {
  // 设置默认值
  const { nsp, room, clientId, channel } = {
    nsp: "/",
    channel: "$message",
    ...target,
  };
  if (!msg) {
    throw new Error("必须设置msg");
  }
  console.log(">>> 尝试发送消息", msg, "到:", JSON.stringify(target));

  const io = getIo();
  // 检测nsp是否存在
  if (!io._nsps.has(nsp)) {
    throw new Error(`未发现命名空间${nsp}`);
  }
  // 向房间所有客户端发消息
  if (room) {
    // 检测room是否存在
    if (!io.of(nsp).adapter.rooms.has(room)) {
      console.error(`未发现房间:${nsp}/${room}`);
    }
    io.of(nsp).to(room).emit(channel, msg);
    return;
  }
  // 向某个具体的client发消息
  if (clientId) {
    let socket = null;
    if (target.nsp) {
      socket = io.of(nsp).sockets.get(clientId);
    } else {
      socket = getScocket(clientId);
    }
    if (!socket) {
      throw new Error(`未发现客户端socket:${nsp}/${clientId}`);
    }
    socket?.emit(channel, msg);
    return;
  }
  // 向命名空间内容所有client发消息
  io.of(nsp).emit(channel, msg);
};

const useSocketIo = (httpServer) => {
  if (_isBind && httpServer) {
    throw new Error("socket server已经创建过了,禁止重复绑定");
  }
  //将socket server和http服务绑在一起,
  //绑定成功后会创建虚拟js文件,方便网页客户端作为js资源载入
  if (httpServer) {
    const io = new Server(httpServer, {
      /* options */
    });
    io.on("connection", (socket) => {
      throw new Error("客户端必须使用 io(`/nsp-xxx`) 进行连接");
    });
    _io = io;
    _isBind = true;
    logger.info(
      "socket.io服务端创建成功(客户端必须使用io('/nsp-xxx')连接动态命名空间)"
    );
    logger.info("可以访问 http://localhost:3000/socketio 来进行测试学习");

    //命名空间初始化,在每个空间有新的client_socket连接时,注册的每个client的事件(频道)
    io.of(/^\/nsp-\S+$/).on("connection", (socket) => {
      const nspName = socket.nsp.name;
      console.log(
        `${nspName}/${socket.id} 已连接,总连接数: ${
          io.of(nspName).sockets.size
        }`
      );

      // 离开原放假,进入设置房间,---待完善
      if (_room) {
        socket.leave(socket.id);
        socket.join(_room);
        console.log(`将${socket.id}移入房间${_room}`);
      }

      // 输出整体结构:
      console.log(getAllNspDesc());
      // 失联时触发
      socket.on("disconnect", (reason) => {
        socket.removeAllListeners();
        console.log(
          `${nspName}/${socket.id} 断开连接,原因:${reason},总连接数: ${
            io.of(nspName).sockets.size
          }`
        );
        console.log(getAllNspDesc());
      });

      // ============ 监听客户端发布的消息 ==================
      _clientEvents.forEach((evt) => {
        // 收到消息事件
        socket.on(evt, (data) => {
          console.log(`${nspName}/${socket.id}@${evt} get message:`, data);
        });
      });
    });
  }

  return { publish, getIo };
};
const test = () => {
  const clientId = getIo().of("/compDingding").sockets.keys().next().value;

  // 测试用例:向命名空间内容所有client发消息
  console.log("向命名空间内容所有client发消息");
  publish({ nsp: "/compDingding" }, ["向命名空间内容所有client发消息"]);

  // 测试用例:向房间所有客户端发消息
  console.log("向房间所有客户端发消息");
  publish({ nsp: "/compDingding", room: _room }, ["向房间所有客户端发消息"]);

  // 测试用例:向命名空间内某个具体的client发消息

  console.log("向命名空间内某个具体的client发消息", clientId);
  publish({ nsp: "/compDingding", clientId }, [
    "向命名空间内某个具体的client发消息",
  ]);

  // 测试用例:向某个client发消息
  console.log("向某个client发消息,需要遍历定位nsp", clientId);
  publish({ clientId }, ["向某个client发消息,需要遍历定位nsp"]);
};
setTimeout(() => {
  test();
}, 4000);

export default useSocketIo;
