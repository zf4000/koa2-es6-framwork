// Debug包如果要生效,必须通过 cross-env DEBUG=myapp nodemon bin/www.js 在设置了环境变量的基础上,启动脚本,下面的debug才能输出,否则不会输出
// import Debug from "debug";
// const debug = Debug("myapp");

import { useDebug } from "../hooks/useDebug.js";
const debug = useDebug();

// 输出环境变量,其中有DEBUG
// console.log(process.env);

// 如果直接 nodemon bin/www.js 以下不会输出内容
debug("这是调试信息,生产环境下不会显示");

import http from "http";
/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
// app.set('port', port);

/**
 * Create HTTP server.
 */

import app from "../app.js";

const server = http.createServer(app.callback());

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, onListening);
server.on("error", onError);
// server.on("listening", onListening);

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
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
