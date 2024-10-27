import http from "http";
import dayjs from "dayjs";

const _cache = [];
let _key = 0;
// 生产者
const produce = () => {
  setInterval(() => {
    // console.log("========产生消息");
    _cache.push({ key: _key++, time: dayjs().format("YYYY-MM-DD HH:mm:ss") });
    if (_cache.length > 10) {
      _cache.shift();
    }
    worker.postMessage(_cache);
  }, 500);
};

// 另开线程消费
import { Worker } from "worker_threads";
let worker = null;
const consume = () => {
  // 创建一个新的 Worker, 持续允许直到 显式终止/主线程退出/出现异常
  // 如果要传递变量,必须是 {workerData:...}对象,注意这个参数是值参,无法直接共享内存
  worker = new Worker("./worker.js", { workerData: "asdf" });

  // 监听 worker 的消息
  worker.on("message", (message) => {
    console.log("收到子线程消息:", message);
  });
  worker.on("error", (err) => {
    console.log("worker error", err);
  });
  worker.on("exit", (exitcode) => {
    console.log("监听到worker exit");
  });
  // worker.on("online", () => {
  //   console.log("worker online");
  // });

  // 向 worker 发送消息
  // worker.postMessage("Hello from main thread!");

  // 模拟结束子线程
  setTimeout(() => {
    // worker.terminate();
    // console.log("主线程中 Worker 主动退出");

    worker.postMessage("最后一次发送消息");
  }, 5000);
};

const server = http.createServer();
server.listen(3000, () => {
  console.log("listen 3000");
  produce();
  consume();
});
