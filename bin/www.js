// 输出环境变量,其中有DEBUG
// console.log(process.env);

import http from "http";
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");

/**
 * Create HTTP server.
 */

import app, { logger } from "../app.js"; //跨域,载入中间件,静态资源,路由等

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Listen on provided port, on all network interfaces.
 */
const server = http.createServer(app.callback());
server.on("error", onError);

// 增加ws服务,并和http使用同一个端口3000
import socketIo from "../hooks/useSocketIo.js";
const { bindHttpServer, createSocketServer } = socketIo;
bindHttpServer(server);
createSocketServer(); //自动创建server

server.listen(port, () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "端口 " + addr.port;
  logger.info("服务启动完成,监听: " + bind);
});
