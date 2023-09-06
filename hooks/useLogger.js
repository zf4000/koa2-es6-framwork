// 起始级别,如果不设置,不会输出,设置后只会输出比它级别高的信息
// logger.level = 'trace';

// 以下级别由低到高分6个等级
// logger.trace('trace');
// logger.debug('debug');
// logger.info('info');
// logger.warn('warn');
// logger.error('error');
// logger.fatal('fatal');

import log4js from "log4js";
import options from "../config/logger.config.js";

// 通过配置项设置更高级的日志输出
log4js.configure({
  appenders: {
    fileAppender: {
      type: "dateFile",
      numBackups: 60, //daysToKeep已废弃,改为numBackups
      pattern: "-yyyyMMdd", //用于指定日志切分的时间间隔,会以日志作为文件后缀
      filename: options.logFile,
    },
    console: { type: "console" },
  },
  categories: {
    default: {
      appenders: ["console", "fileAppender"],
      level: "info", //只有warn之后的才会输出
    },
  },
});

// const shutdown = () => {
//     log4js.shutdown();
// }

export const useLogger = () => {
  const logger = log4js.getLogger(options.prefixMsg);
  logger.shutdown = log4js.shutdown;
  return logger;
};
