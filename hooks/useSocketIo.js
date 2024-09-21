import { Server } from "socket.io";
let _httpServer = null;
let _io = null;

/**
 * 增加新的命名空间
 */
const initNamespace = (nsp, cb) => {
  const rootPath = nsp == "/" ? "" : `/${nsp}`;
  // 客户端连接到nsp时触发
  // io.on('xxx') 等同于 io.of('/').on('xxx')
  _io.of(nsp).on("connection", (socket) => {
    console.log(`${rootPath}/${socket.id} connection`);
    // 失联时触发
    socket.on("disconnect", (reason) => {
      console.log(`${rootPath}/${socket.id} disconnect`, reason);
    });

    // ====================自定义事件(以$开头避免冲突)=======================
    // 改变房间事件
    socket.on("$changeRoom", (roomId) => {
      console.log(`${rootPath}/${socket.id} changeRoom to ${roomId}`);
      // console.log(socket.id, "changeRoom to ", roomId);
      socket.leave(socket.id);
      socket.join(roomId);
    });
    // 收到消息事件
    socket.on("$message", (data) => {
      console.log(`${rootPath}/${socket.id} get message`, data);
      // console.log("Received message:", data);
    });
    // 回调,可声明其他事件
    cb?.(socket);
  });
};
export const useSocketIo = () => {
  //将socket server和http服务绑在一起,
  //绑定成功后会创建虚拟js文件,方便网页客户端作为js资源载入
  const bindHttpServer = (httpServer) => {
    if (_httpServer !== null) {
      throw new Error("禁止重复绑定");
    }
    _httpServer = httpServer;
  };

  // 创建socket server
  const createSocketServer = () => {
    if (!_httpServer) {
      throw new Error("_httpServer 不能为空");
    }
    // 创建io实例,
    const io = new Server(_httpServer, {
      /* options */
    });
    //io实例创建后,会自动生成一个虚拟js文件: http://localhost:3000/socket.io/socket.io.js,用来在html页面中作为js资源加载,这使得客户端连接异常简单

    console.log("socket server created");
    _io = io;

    // 初始化默认命名空间
    initNamespace("/", (socket) => {
      console.log("/命名空间初始化成功回调");
    });
    // 增加新的nsp,每个nsp有独立的事件
    initNamespace("jeff");
  };

  // 得到服务器端所有的命名空间的层级结构
  const getIoLevel = () => {
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

  // 得到io实例
  const getIo = () => _io;

  //定向推送消息
  const sendMsg = (targetId, msg) => {
    console.log("发送消息", { targetId, msg });
  };

  // 得到所有客户端
  const getAllClients = () => {
    const clientIds = [];
    // 方法一:使用allSockets
    // const sockets = await _io.of("/").allSockets();
    // sockets.forEach((item) => clientIds.push(item));

    // 方法二:使用 sockets属性
    const sockets = _io?.of("/").sockets;
    sockets?.forEach((_socket, key) => {
      clientIds.push(key);
    });

    return clientIds;
  };

  // 广播消息
  const broadcast = (msg) => {
    _io.emit("message", msg);
  };
  return {
    createSocketServer,
    bindHttpServer,
    sendMsg,
    getAllClients,
    broadcast,
    getIo,
    getIoLevel,
    getScocket: (id) => {
      const io = getIo();
      const namespaces = io._nsps.keys();
      for (const namespace of namespaces) {
        const socketNamespace = io.of(namespace).sockets.get(id);
        if (socketNamespace) {
          // 找到特定命名空间中的socket实例
          return socketNamespace;
        }
      }
      return null;
    },
    broadcastNsp: (nsp, msg) => {
      const io = getIo();
      io.of(nsp).emit("$message", msg);
    },
    broadcastRoom: (nsp, room, msg) => {
      const io = getIo();
      io.of(nsp).to(room).emit("$message", msg);
    },
  };
};
