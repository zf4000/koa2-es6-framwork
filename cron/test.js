// 必须使用export default来声明函数
import { logger } from "../app.js";
export default () => {
  logger.info("test.js fired");
};
