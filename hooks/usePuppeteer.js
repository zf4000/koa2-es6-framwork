//- 传递参数
//- const myArray = [1, 2, 3, 4, 5];
//- await page.evaluate((myArray) => {
//-   window.myArray = myArray;
//- }, myArray);

import puppeteer from "puppeteer";
import { useLogger } from "./useLogger.js";
const logger = useLogger();

// 打开 Puppeteer
const openPuppeteer = async (_options) => {
  const { url, saveAs, pageSize, landscape, params, onSave, onResponse } =
    _options;
  logger.info("open Puppeteer", url);

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  /*
    networkidle0：当没有网络连接时认为页面已完成加载。这意味着在页面的主框架不再发出网络请求（没有挂起的请求）或没有活动的网络连接（没有正在进行的请求）时，认为页面加载完成。这可能意味着在异步请求完成之前页面就被认为已加载完成了。
    networkidle2：当最多有两个网络连接（网络请求数）时认为页面已完成加载。这意味着在页面的主框架最多有两个挂起的请求时，或者在主框架的网络连接数不再增加且持续一段时间后（默认是 500 毫秒），认为页面加载完成。
    一般来说，如果你的页面包含大量的异步请求（例如 AJAX 请求或资源加载），并且你希望等待这些请求全部完成后再继续操作，那么使用 networkidle2 会更合适。但如果你的页面没有异步请求，或者你希望在页面的初始请求完成后立即进行操作，那么使用 networkidle0 可能更适合。

    await page.goto(url, { waitUntil: "networkidle2" });
    logger.info(url, "主框架的网络连接数不再增加且持续了500ms");

    await page.goto(url, { waitUntil: "load" });
    logger.info(url, " waitUntil: load");

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    logger.info(
      "waitForNavigation,networkidle2主框架的网络连接数不再增加且持续了500ms"
  );
  */

  // 监听控制台消息
  // page.on("console", async (message) => {
  //   // console.log(`控制台输出: ${message.text()}`, message.args().jsonValue());
  //   for (let i = 0; i < message.args().length; ++i) {
  //     const value = await message.args()[i].jsonValue();
  //     console.log(`控制台输出: ${value}`);
  //   }
  // });

  // 挂载一个调试方法到window对象,第二个参数会在nodejs中执行
  await page.exposeFunction("debug", (...args) => {
    logger.warn(...args);
  });
  // 挂在一个方法到window对象,每次批量获得报告内容后触发
  // const tttt = () => {
  //   console.log(111);
  //   onResponse();
  // };
  await page.exposeFunction("onGetReports", onResponse);

  // 打开url
  await page.goto(url);

  // 传递参数,并启动消费
  await page.evaluate((_params) => {
    // 将params参数挂在到 window.params 变量中
    window.setparam(_params);
    // 开始消费
    window.startConsume();
  }, params);

  await page.waitForSelector(".is-rend-over", { timeout: 0 });
  console.log("发现 .is-rend-over 元素");

  // 打印为pdf
  await page.pdf({
    path: "public/pdfFiles/" + saveAs,
    format: pageSize || "A5",
    landscape: landscape,
  });
  logger.info("保存pdf成功", saveAs);

  onSave?.(saveAs);

  await browser.close();
  console.log("puppeteer关闭");
};
export const usePuppeteer = () => {
  return { openPuppeteer };
};
