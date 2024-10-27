import { workerData, parentPort } from "node:worker_threads";
console.log("> 父线程传递参数:", workerData);

// 在子线程中访问传递的变量,
// console.log("> 子线程接收到的消息:", workerData);

let _data = null;

// 监听主线程的消息
parentPort.on("message", (message) => {
  console.log("> 接收到来自主线程的消息,最新数据", message.length);

  // 更新_data
  _data = [...message];
  // 在这里执行耗时的操作
  // const result = performHeavyTask();

  // 将结果发送回主线程
  // parentPort.postMessage("最新数据已更新");

  // 错误会导致主线程自动退出
  // throw new Error("error in worder");
});

// 每一秒轮询消费:根据最新消息判断是否需要报警:
setInterval(() => {
  console.log(">>>>>> 每2s触发一次,当前队列数量", _data);
  parentPort.postMessage("这是主进程发给子进程的消息");
}, 2000);
