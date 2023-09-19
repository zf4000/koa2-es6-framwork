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

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox", // linux系统中必须开启
      "--no-zygote",
      "--single-process", // 此处关掉单进程
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--disable-extensions",
      "--disable-file-system",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-sync", // 禁止同步
      "--disable-translate",
      "--hide-scrollbars",
      "--metrics-recording-only",
      "--mute-audio",
      "--safebrowsing-disable-auto-update",
      "--ignore-certificate-errors",
      "--ignore-ssl-errors",
      "--ignore-certificate-errors-spki-list",
      "--font-render-hinting=medium",
    ],
  });

  try {
    const page = await browser.newPage();

    logger.info("open Puppeteer", url);
    // 对于大的PDF生成，可能会时间很久，这里规定不会进行超时处理
    await page.setDefaultNavigationTimeout(0);

    // 挂载一个调试方法到window对象,第二个参数会在nodejs中执行
    await page.exposeFunction("debug", (...args) => {
      logger.warn(...args);
    });
    // 挂在一个方法到window对象,每次批量获得报告内容后触发
    await page.exposeFunction("onGetReports", onResponse);

    // 打开url
    await page.goto(url);
    logger.info("open Puppeteer", url);

    /*
    page.goto中常用等待时间设置
    await page.goto(url, { waitUntil: "networkidle2" });
    logger.info(url, "主框架的网络连接数不再增加且持续了500ms");

    await page.goto(url, { waitUntil: "load" });
    logger.info(url, " waitUntil: load");

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    logger.info(
      "waitForNavigation,networkidle2主框架的网络连接数不再增加且持续了500ms"
    );
    */

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
    // 页眉模板（图片使用base64，此处的src的base64为占位值）
    const headerTemplate = `<div
style="width: calc(100% - 28px); margin-top: -13px; font-size:8px;border-bottom:2px solid #e1dafb;padding:6px 14px;display: flex; justify-content: space-between; align-items:center;">
<span style="color: #9a7ff7; font-size: 12px; font-family: my-font;">李钟航的报告模板</span>
<img style="width: 80px; height: auto;" src="data:image/png;base64,iVBORw0KGgoAAAxxxxxx" />
</div>`;
    // 页脚模板（pageNumber处会自动注入当前页码）
    const footerTemplate = `<div 
style="width:calc(100% - 28px);margin-bottom: -20px; font-size:8px; padding:15px 14px;display: flex; justify-content: space-between; ">
<span style="color: #9a7ff7; font-size: 10px;">这里是页脚文字</span>
<span style="color: #9a7ff7; font-size: 13px;" class="pageNumber"></span> /<span class='totalPages'></span>
</div>`;
    const pdfOptions = {
      // pdf存储单页大小
      format: "a4",
      // 页面缩放比例
      scale: 1,
      // 是否展示页眉页脚,详细参考:https://mp.weixin.qq.com/s/JGEL_3ktDK3a4bUOA3284w
      displayHeaderFooter: true,
      // 页眉的模板
      headerTemplate,
      // 页脚的模板
      footerTemplate,
      // 页面的边距
      margin: {
        top: 50,
        bottom: 50,
        left: 0,
        right: 0,
      },
      // 输出的页码范围
      pageRanges: "",
      // CSS
      preferCSSPageSize: true,
      // 开启渲染背景色，因为 puppeteer 是基于 chrome 浏览器的，浏览器为了打印节省油墨，默认是不导出背景图及背景色的
      // 坑点，必须加
      printBackground: true,
    };
    await page.pdf({
      ...pdfOptions,
      path: "public/pdfFiles/" + saveAs,
      format: pageSize || "A5",
      landscape: landscape,
    });
    logger.info("保存pdf成功", saveAs);

    onSave?.(saveAs);

    await browser.close();
    console.log("puppeteer关闭");
  } catch (error) {
    logger.info("puppeteer异常,关闭browser", error);
    // 关闭browser
    await browser.close();
    throw new Error("puppeteer处理异常");
    // 返回的是buffer不需要存储为pdf，直接将buffer传回前端进行下载，提高处理速度
    // return pdfbuf;
  }
};
export const usePuppeteer = () => {
  return { openPuppeteer };
};
