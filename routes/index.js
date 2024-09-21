import koaRouter from "koa-router";
const router = koaRouter();

router.get("/", async (ctx, next) => {
  const { url, request, query: ctx_query, querystring: ctx_querystring } = ctx;
  //从request中获取GET请求
  const { origin, originalUrl, href, path, query, querystring } = request;
  await ctx.render("index", {
    title: "标题内容",
    ctx: ctx,
  });
});

router.get("/help", async (ctx, next) => {
  const { url, request, query: ctx_query, querystring: ctx_querystring } = ctx;
  //从request中获取GET请求
  const { origin, originalUrl, href, path, query, querystring } = request;
  await ctx.render("help", {
    title: "帮助",
    ctx: ctx,
  });
});

// 执行命令行
router.get("/spawn", async (ctx, next) => {
  const { url, request, query: ctx_query, querystring: ctx_querystring } = ctx;
  //从request中获取GET请求
  const { origin, originalUrl, href, path, query, querystring } = request;
  await ctx.render("spawn", {
    title: "帮助",
    ctx: ctx,
  });
});
import { useSpawn } from "../hooks/useSpawn.js";
router.post("/spawn", async (ctx, next) => {
  const child = await useSpawn({
    onData: (data) => {
      ctx.body = {
        data: data.toString(),
      };
    },
  });

  ctx.body = {
    url: ctx.url,
    request对象: ctx.request,
  };
});

//#region 定时任务测试
import schedule from "node-schedule";
// 创建计划任务
router.post("/cron/add", async (ctx, next) => {
  // 获得post参数
  const post = ctx.request.body;
  if (!post) {
    return;
  }
  console.log("post参数", post);

  console.log("* * * * * add,任务会在每小时的每分钟的0秒都会执行一次");
  schedule.scheduleJob("task1", "* * * * *", function () {
    console.log(`1-计划任务启动`);
    const promise = () => {
      return new Promise((resolve, reject) => {
        resolve();
      });
    };
    promise().then((res) => {
      simulateResourceIntensiveTask();
      console.log("promise over");
    });
    console.log("after promise");

    // simulateResourceIntensiveTask();// 如果是一个耗时长的任务,会阻塞
  });

  console.log("*/2 * * * * add,每2分钟执行一次");
  schedule.scheduleJob("task2", "*/2 * * * *", function () {
    console.log(`/2-计划任务启动`);
  });

  console.log("5秒后执行第一次,再过5s结束");
  const startTime = new Date(Date.now() + 5000); //5秒后开始
  const endTime = new Date(startTime.getTime() + 5000); //开始5s后结束
  schedule.scheduleJob(
    "task3",
    { start: startTime, end: endTime, rule: "*/1 * * * * *" },
    function () {
      console.log("Time for tea!");
    }
  );

  // 模拟一个一直占用资源的耗时任务,实测下来会阻塞
  function simulateResourceIntensiveTask() {
    console.log("开始执行资源密集型任务...");
    // 模拟一个一直占用 CPU 资源的循环
    let counter = 0;
    while (counter < 100000000000) {
      counter++;
    }
    console.log("资源密集型任务完成！");
  }
  ctx.body = { success: true, msg: "cron ok" };
});
// 输出定时任务
router.post("/cron/dump", async (ctx, next) => {
  /* 对象结构
  {
    Job: [Function: Job],
    Invocation: [Function: Invocation],
    Range: [Function: Range],
    RecurrenceRule,//规则构造函数,可通过对象构造规则,参考文档
    cancelJob(name),//取消某个任务
    rescheduleJob(name,rule),//取消后重新注册新频率
    scheduleJob(name,rule,callback),//注册任务,callback触发时的回调
    gracefulShutdown(),//取消并清空所有任务
    scheduledJobs: { //所有任务
      task1: Job {
        pendingInvocations: [Array],
        job: [Function (anonymous)],
        callback: false,
        running: 0,
        name: 'task1',
        trackInvocation: [Function (anonymous)],
        stopTrackingInvocation: [Function (anonymous)],
        triggeredJobs: [Function (anonymous)],
        setTriggeredJobs: [Function (anonymous)],
        deleteFromSchedule: [Function (anonymous)],
        cancel(),//使得任务无效并删除
        cancelNext: [Function (anonymous)],//取消下一次
        reschedule(rule),//取消等待,重新注册后等待
        nextInvocation())//返回下次执行的时间
      },
      ...
    }
  }
  */
  console.log("所有已注册任务", schedule.scheduledJobs);
  console.log(
    "task1的下次执行时间",
    schedule.scheduledJobs.task1.nextInvocation()
  );

  ctx.body = "ok";
});
// 取消定时任务
router.post("/cron/cancel", async (ctx, next) => {
  const post = ctx.request.body;
  if (!post.name) {
    //取消所有
    schedule.gracefulShutdown().then(() => {
      console.log("全部任务取消");
    });
  }
  const { name } = post;

  schedule.cancelJob(name); //取消并从清单中删除,和以下语句等效
  // schedule.scheduledJobs[name].cancel();
  console.log(`取消${name}`, schedule.scheduledJobs);
  ctx.body = "取消" + name;
});
// 修改执行计划
router.post("/cron/update", (ctx) => {
  console.log(
    "task2原始执行时间",
    schedule.scheduledJobs.task2.nextInvocation()
  );
  schedule.scheduledJobs.task2.reschedule("* * * * *");
  console.log(
    "重新注册为 *****,修改后下次执行时间为:",
    schedule.scheduledJobs.task2.nextInvocation()
  );
  ctx.body = "ok";
});
//#endregion 定时任务测试

//#region ws测试
// 创建ws server
import { useSocketIo } from "../hooks/useSocketIo.js";
const { broadcast, getIoLevel, getScocket, broadcastNsp, broadcastRoom } =
  useSocketIo();

// 测试代码

// 得到服务端的层级结构
router.post("/ws/getNspLevel", (ctx) => {
  const nsp = getIoLevel();
  ctx.body = {
    success: true,
    nsp,
  };
});

// 服务端向客户端发送消息
router.post("/ws/makeServerMsg", (ctx) => {
  const { socketId } = ctx.request.body;
  const _socket = getScocket(socketId);
  _socket?.emit("$message", { msg: "服务端新消息" });
  ctx.body = "服务端处理完毕";
});
router.post("/ws/makeNewPantou", (ctx) => {
  const { socketId } = ctx.request.body;
  const _socket = getScocket(socketId);
  _socket?.emit("$newPantou", { pantous: ["盘头1", "盘头2"] });
  ctx.body = "服务端处理完毕";
});

//获得服务端socket
router.post("/ws/getServerSocket", (ctx) => {
  const { socketId } = ctx.request.body;
  const socket = getScocket(socketId);
  console.log(socket);
  // 服务端对象不能直接传递给前端,必须在服务端控制台查看输出结果
  ctx.body = {
    success: true,
    msg: "服务器处理完毕,请在服务端控制台查看输出结果",
  };
});

// 命名空间内广播消息
router.post("/ws/makeNspMsg", (ctx) => {
  const { nsp } = ctx.request.body;
  broadcastNsp(nsp, "这是命名空间内的广播消息");
  ctx.body = "广播完毕";
});
router.post("/ws/makeRoomMsg", (ctx) => {
  const { room, nsp } = ctx.request.body;
  broadcastRoom(nsp, room, "这是房间内的广播消息");
  ctx.body = "广播完毕";
});
router.post("/ws/broadcast", (ctx) => {
  broadcast("这是广播消息");
  ctx.body = "广播消息";
});
// 使用浏览器客户端连接server,并发送消息
router.get("/ws/client", async (ctx) => {
  await ctx.render("ws", {
    ctx,
  });
});
//#endregion ws测试

// 连接mysql测试

// 连接sqlite测试

router.all("/all", async (ctx, next) => {
  await ctx.render("pdfMaker", {
    test: "节流请求,pdf的生成",
  });
});

// module.exports = router;
export default router;
