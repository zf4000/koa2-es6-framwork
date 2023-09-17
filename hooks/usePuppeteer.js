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

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  /*
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
  await page.exposeFunction("onGetReports", onResponse);

  // 打开url
  await page.goto(url);
  logger.info("open Puppeteer", url);

  // 传递参数,并启动消费,以下方法在vue的mounted方法后才会执行
  console.log("nodejs传递参数到窗口", params);
  await page.evaluate((_params) => {
    //_params = {ids,sfcLoader,previewUrl}
    Object.keys(_params).forEach((key) => {
      window.params ??= {};
      window.params[key] = _params[key];
    });
    window.debug("puppeteer设置windows.params完成");
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
