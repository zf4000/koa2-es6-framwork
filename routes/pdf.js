import koaRouter from "koa-router";
const router = koaRouter();

let isProcessing = false;
let totalTask = 0;
// let totalBlock = 0;
let overTask = 0;
// 是否可以下载文件;
// let exportable = false;
let pdfFilePath = "";

/*
开始消费,
打开无头浏览器生成pdf文件
1.接受post过来的ids -----ok
2,进行切片,形成请求计划  -----ok
2.打开无头浏览器 -----ok
3.传递ids参数, -----ok
4.获得进度信息
5.监视状态元素的变化,变化后,生成pdf文件,
6.传递pdf到前端
*/
import { usePuppeteer } from "../hooks/usePuppeteer.js";

const _startConsum = (post) => {
  console.log("开始消费", post.ids.length, "个id");

  // 初始化状态
  isProcessing = true;
  // totalBlock = idBlocks.length;
  overTask = 0;

  // 打开无头浏览器
  openPuppeteer({
    url: post.sfcLoader,
    saveAs: "test1.pdf",
    pageSize: "A5",
    landscape: false, //是否横向
    // 需要传入到窗口的参数
    params: {
      ...post,
    },
    // 每次从后台请求报告内容后的处理,改变进度内容
    onResponse(reports) {
      console.log("php返回了", reports.length, "个报告结果");
      overTask += reports.length;
    },
    // 导出pdf完成后触发
    onSave(path) {
      console.log("onsave fired", path);
      pdfFilePath = path;
    },
  });
};
const _resetStatus = () => {
  isProcessing = false;
  totalTask = 0;
  // totalBlock = 0;
  overTask = 0;
  pdfFilePath = "";
};

const { openPuppeteer } = usePuppeteer();

// 浏览器可访问
router.all("/pdf", async (ctx, next) => {
  await ctx.render("pdfMaker", {
    test: "节流请求,pdf的生成",
  });
});

// 导出按钮点击后触发请求
router.post("/pdfmake", async (ctx, next) => {
  //判断是否处理中
  if (isProcessing) {
    ctx.body = { success: false, msg: "有任务正在处理中" };
    return;
  }

  const post = ctx.request.body;

  // post中包含以下参数
  // { ids, sfcLoader, previewUrl }
  // ids([]),需要处理的报告id
  // sfc载入器(vue文件),puppeteer打开的地址,一般放在web项目的public目录中
  // previewUrl(vue文件):载入器默认载入的报告预览页面,一般放在web项目的public目录中

  totalTask = post.ids.length;

  _startConsum(post);

  ctx.body = {
    post,
    // ids,
  };
});

// 得到当前服务状态
router.post("/getSeviceStatu", async (ctx, next) => {
  // console.log("响应进度请求,完成/总数", overTask, totalTask);
  ctx.body = {
    success: true,
    data: { isProcessing, overTask, totalTask, pdfFilePath },
  };
});

// 重置状态
router.post("/reset", async (ctx, next) => {
  _resetStatus();
  // 判断是否有正在运行的无头浏览器,如果有,关掉 todo
  let msg = "";
  if (isProcessing) {
    msg = "发现正常处理的任务,关闭";
  }
  ctx.body = { success: true, msg: msg + ",重置成功" };
});

// 删除1个月前的pdf
router.post("/removePdf", async (ctx, next) => {
  ctx.body = { success: true, msg: "删除成功" };
});
export default router;
