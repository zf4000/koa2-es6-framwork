# socket.io 相关说明

## 服务器端

- 创建并返回某个命名空间,如果命名空间已经初始化，它会立即返回它。
  io.of(nsp),
- 向某个房间的所有 client 的 频道发布消息
  io.to("room").emit("channel",'message');
- 向多个房间发送消息
  io.to(["room-101", "room-102"]).emit("foo", "bar");

## 客户端

- 房间是仅服务器的概念（即客户端无权访问其已加入的房间列表）。
  一个 socket 可能存在于多个房间中
