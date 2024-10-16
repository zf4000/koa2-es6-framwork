import koaRouter from "koa-router";
const router = koaRouter();

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

export default router;
