const sockets = [{ id: "111" }, { id: "222" }];
const rooms = [
  { name: "room1", sockets },
  { name: "room2", sockets },
];
const nsp = [
  { name: "namespace1", rooms },
  { name: "namespace2", rooms },
];

// 注册socket事件
const registerEvent = function (socket, cb) {
  //- 连接建立后触发,
  socket.on("connect", () => {
    cb?.();
  });

  // 接收服务器新消息-为避免和默认事件冲突加入$
  socket.on("$message", (data) => {
    console.log(socket.id, "Received message from server:", data);
    this.$set(this.newMsg, socket.id, data.msg);
  });
  // 收到新盘头-为避免和默认事件冲突加入$
  socket.on("$newPantou", (data) => {
    console.log(socket.id, "收到新盘头:", data);
    this.$set(this.newPantou, socket.id, data.pantous);
  });
  // 转发服务器的指令到PLC-为避免和默认事件冲突加入$
  socket.on("$plcCommand", (data) => {
    console.log(socket.id, "收到 plcCommand:", data);
  });
};
const __sockets = {};
new Vue({
  el: "#app",
  data() {
    return {
      nsp,
      newMsg: {}, //接收服务器端的最新消息
      newPantou: {},
      //- sockets:{}
    };
  },
  mounted() {
    //- 服务端启动需要时间,这里延迟是为了等待服务端创建完成,
    //- 自动创建一个client
    setTimeout(() => {
      this.createClient("/", "jeff room");
    }, 2000);
    //- registerEvent.bind(this);
  },
  methods: {
    //- 获得服务端命名空间结构
    getServerNsp: function () {
      axios.post("/ws/getNspLevel").then(({ data }) => {
        const { nsp } = data;
        this.nsp = nsp;
      });
    },
    //- 创建连接 nsp命名空间,roomId房间号
    createClient: function (nsp, roomId) {
      if (!this.isServerOpen()) {
        throw new Error("服务端未开启");
      }
      //- io('/')表示加入namespace '/' ,服务端可以根据namespace进行广播和发消息等
      const socket = io(nsp);
      registerEvent.apply(this, [
        socket,
        () => {
          __sockets[socket.id] = socket;
          console.log("client socket connect", `${nsp}:${roomId}/${socket.id}`);
          //- 通知服务器换房间
          roomId && socket.emit("$changeRoom", roomId);
          //- 重新获取nsp
          // this.getServerNsp();
        },
      ]);
    },
    //- 服务端是否开启
    isServerOpen: function () {
      return window.io ? true : false;
    },
    makeServerMsg: (socketId) => {
      axios.post("/ws/makeServerMsg", { socketId }).then(({ data }) => {
        console.log(data);
      });
    },
    getServerSocket: (socketId) => {
      axios.post("/ws/getServerSocket", { socketId }).then(({ data }) => {
        console.log(data);
      });
    },
    getClientSocket: (socketId) => {
      console.log(__sockets[socketId]);
    },
    makeNewPantou: (socketId) => {
      axios.post("/ws/makeNewPantou", { socketId }).then(({ data }) => {
        console.log(data);
      });
    },
    sendMsg: (id) => {
      const socket = __sockets[id];
      // 发送消息给服务器
      socket.emit("$message", "Hello, Server!");
      console.log("请在服务端控制台查看收到消息");
    },
    makeNspMsg: (nsp) => {
      axios.post("/ws/makeNspMsg", { nsp }).then((res) => {
        console.log(res);
      });
    },
    makeRoomMsg: (nsp, room) => {
      axios.post("/ws/makeRoomMsg", { nsp, room }).then((res) => {
        console.log(res);
      });
    },
  },
});
