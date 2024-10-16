import schedule from "node-schedule";
import configCron from "../cron/config.js";
import fs from "fs/promises";

import { fileURLToPath } from "url";
import path from "path";
import url from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const useCron = () => {
  // 判断有效性(空格切分,必须是6部分,最后一个必须是有效文件)
  Object.keys(configCron).forEach((key) => {
    const item = configCron[key];
    const parts = item.split(" ");
    if (parts.length != 6) {
      throw new Error("cron配置文件格式错误:" + item);
    }
    const cronTime = `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]} ${parts[4]}`;
    const jsFile = path.join(__dirname, "/../cron/", parts[5]);
    // 检测文件是否存在
    fs.access(jsFile)
      .catch((err) => {
        throw new Error("cron配置错误,缺失脚本文件:" + jsFile);
      })
      .then(() => {
        const fileURL = url.pathToFileURL(jsFile).href;
        import(fileURL).then((module) => {
          if (!module.default) {
            throw new Error(
              `cron脚本书写错误,${jsFile}必须使用export default ()=>{}声明`
            );
          }
          schedule.scheduleJob(key, cronTime, module.default);
        });
      });
  });
  // console.log(configCron);
};
