/*
debug 是一个可以在 Node.js 中进行调试的小型工具包,开发者可以将调试语句添加到应用程序中，以便在必要时启用它们，并在不需要时禁用它们。
debug 的主要功能包括：
- 添加调试语句：使用 debug()函数添加调试语句，例如：
- 启用/禁用调试语句：使用环境变量来控制是否启用调试语句。例如，在 Linux 或 macOS 中，可以使用以下命令启用调试语句：
- 支持命名空间：使用命名空间来对调试语句进行分组和分类。例如，可以使用以下代码创建名为 myapp:server 的调试语句：
- debug('xxx')在 windows 下不会输出信息,必须通过 cross-env DEBUG=myapp nodemon bin/www.js 在设置了环境变量的基础上,才会有输出

启动服务器时必须设置环境变量 DEBUG='命名空间',否则,debug信息不会显示

使用示例:
1. 
pnpm i debug

2.
import { useDebug } from "../hooks/useDebug.js";
const debug = useDebug();
debug("这是调试信息,生产环境下不会显示");

3.
启动时必须 : cross-env DEBUG=myapp nodemon bin/www.js

可以看到控制台输出红色的信息

使用了log4js后,这个不太需要了,可以在生产环境中设置logger的级别为debug达到同样的效果
*/
const spaceName = "myapp";

import Debug from "debug";
const debug = Debug(spaceName);

export const useDebug = () => {
  return debug;
};
