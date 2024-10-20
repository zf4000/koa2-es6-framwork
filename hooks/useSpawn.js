//在 Node.js 中使用 child_process.spawn 执行命令时，默认情况下不会出现一个额外的命令提示符（DOS 窗口）。与 exec 不同，spawn 在后台创建一个新的进程来执行命令，但不会显示一个新的命令提示符窗口。
//当你使用 spawn 执行命令时，命令的输出会被捕获到 Node.js 进程中，而不是在一个新的窗口中显示。这种方式使得你可以在 Node.js 中执行命令并处理其输出，而不会打扰用户或在命令提示符中显示额外的窗口。
import { spawn } from "child_process";
import fs from "fs";

const init = (cb) => {
  console.log("开始执行 npm -v 命令");
  const wstream = fs.createWriteStream("spawn-out.txt");

  // 注意下面的第三个参数,如果不写会报 enoent 错误
  const child = spawn("dir", [], {
    // stdio: "ignore",
    shell: true,
  });
  child.stdout
    .pipe(wstream)
    .on("finish", function () {
      console.log("Completed");
    })
    .on("error", function (err) {
      console.log(err);
    });
  child.on("exit", (code, signal) => {
    console.log(`子进程已退出，退出码: ${code}`);
  });

  return child;
};

// let handleOn;
export const useSpawn = (option) => {
  const child = init(option.onData);
  return { child };
};
