import { Server } from "socket.io";
import { logger } from "../app.js";
let _httpServer = null;
let _io = null;
const _room = "zhizaoChejian";
const _nspNames = ["/", "compDingding", "compChaoren"];
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
 * @param {发送对象位置} target {nsp, room, clientId, channel}
 * @param {消息内容} msg string
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
  //将socket server和http服务绑在一起,
  //绑定成功后会创建虚拟js文件,方便网页客户端作为js资源载入
  if (httpServer) {
    if (_httpServer !== null) {
      throw new Error("禁止重复绑定");
    }
    _httpServer = httpServer;

    // createSocketServer();
    const io = new Server(_httpServer, {
      /* options */
    });
    _io = io;
    logger.info(
      "socket.io服务端创建成功,可以访问 http://localhost:3000/socketio 来进行测试学习"
    );

    //命名空间初始化,在每个空间有新的client_socket连接时,注册的每个client的事件(频道)

    _nspNames.forEach((nsp) => {
      io.of(nsp).on("connection", (socket) => {
        const rootPath = nsp == "/" ? "" : `/${nsp}`;
        console.log(`${rootPath}/${socket.id} 已连接`);

        // 离开原放假,进入设置房间,
        if (_room) {
          socket.leave(socket.id);
          socket.join(_room);
          console.log(`将${socket.id}移入房间${_room}`);
        }

        // 输出整体结构:
        console.log(getAllNspDesc());
        // 失联时触发
        socket.on("disconnect", (reason) => {
          console.log(`${rootPath}/${socket.id} 断开连接`, reason);
          console.log(getAllNspDesc());
        });

        // ============ 监听客户端发布的消息 ==================
        _clientEvents.forEach((evt) => {
          // 收到消息事件
          socket.on(evt, (data) => {
            console.log(`${rootPath}/${socket.id}@${evt} get message:`, data);
          });
        });
      });
    });
    console.log(`已注册命名空间:`, io._nsps.keys());
  }

  return { publish };
};

setTimeout(() => {
  // publish({ nsp: "/compDingding" }, ["盘头1", "盘头2"]);//向命名空间内容所有client发消息
  // publish({ nsp: "/compDingding", room: _room }, ["盘头1", "盘头2"]); //向房间所有客户端发消息

  //向某个具体的client发消息
  const clientId = getIo().of("/compDingding").sockets.keys().next().value;
  // publish({ nsp: "/compDingding", clientId }, ["盘头1", "盘头2"]);//指定nsp clientId
  publish({ clientId }, ["盘头1", "盘头2"]); //只指定clientId
}, 2000);
export default useSocketIo;
