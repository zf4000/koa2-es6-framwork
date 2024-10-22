# socket.io 相关说明

- 官方参考文档 <https://socket.io/zh-CN/docs/v4/>

## 原理

- namespace 和 room 的区别
  参考 <https://blog.csdn.net/linwenhao/article/details/114384584>
  每个命名空间的事件,房间等都是隔离开
  一个 server(io)对应多个 namespace(频道/地区)
  Socket.IO 中的命名空间提供了一种将应用程序划分为不同通信通道的方法。当你想在同一应用程序中支持不同类型的交互或数据交换，而又不想让它们相互干扰时
  这种设计可节约 tcp 连接开销,如聊天室应用中的独立聊天室
  一个 namespace 包含多个 room
  每个 socket 连接时都会有个默认 room(默认以 socket.id 命名),
  每个 room 包含多个 socket,1 个 socket 可能存在于多个 room 中
  1 个 server 对应多个 client
  1 个 client 对应多个 socket(比如聊天室中一个用户进入多个房间)
  参考 <https://socket.io/zh-CN/docs/v4/server-api/>

## 服务器端

- 创建并返回某个命名空间,如果命名空间已经初始化，它会立即返回它。
  io.of(nsp),
- 向某个房间的所有 client 的 频道发布消息
  io.to("room").emit("channel",'message');
- 向多个房间发送消息
  io.to(["room-101", "room-102"]).emit("foo", "bar");
- Socket.IO 房间功能 当只想与特定用户组通信而不想让连接到命名空间的每个人都参与时非常有用
  应用场景包括：
  聊天室：在聊天室中，用户可以加入不同的房间，与房间中的其他用户进行聊天。
  在线游戏：在在线游戏中，用户可以加入不同的游戏房间，与房间中的其他玩家进行游戏。
  实时数据分析：在实时数据分析中，用户可以加入不同的分析房间，与房间中的其他用户共享实时数据并进行分析。
  通知定向发送: 新的通知只想下发给某个部门的人

## 客户端

- 房间是仅服务器的概念（即客户端无权访问其已加入的房间列表）。
  一个 socket 可能存在于多个房间中

## to do

> 动态命名空间
> 在通信过程中整合用户身份验证。

```js
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error("Authentication error"));
  }
});
```

> 将客户端缓存,方便针对性发送消息

```js
let connectedClients = {};
io.on("connection", (socket) => {
  connectedClients[socket.id] = socket;
  socket.on("disconnect", () => {
    delete connectedClients[socket.id];
  });
});
```
