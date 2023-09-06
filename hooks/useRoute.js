import fs from "fs/promises";

// 获取 __dirname 的 ESM 写法
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

// 自动载入routes所有的路由
const loadAllRoute = async (_app) => {
  const files = await fs.readdir(__dirname + "/../routes");
  for (const file of files) {
    if (!file.endsWith(".js")) continue;
    const routes = await import(`../routes/${file}`);
    // `/${file.slice(0, -3)}`,
    _app.use(routes.default.routes(), routes.default.allowedMethods());
  }
};

export default function () {
  return { loadAllRoute };
}
