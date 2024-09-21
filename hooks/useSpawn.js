import { spawn } from "child_process";

const init = (cb) => {
  console.log("exec npm -v");
  // 注意下面的第三个参数,如果不写会报 enoent 错误
  const child = spawn("npm", ["-v"], { shell: true });
  child.on("exit", function (code, signal) {
    console.log(
      "child process exited with" + `code ${code} and signal ${signal}`
    );
  });

  child.stderr.on("data", (data) => {
    console.error(`stderror ${data}`);
  });

  child.stdout.on("data", (data) => {
    console.log(`child stdout: ${data}`);
    cb(data);
    // return data;
  });
  // handleOn = child.stdout.on;
  // console.log(handleOn);
  return child;
};

// let handleOn;
export const useSpawn = (option) => {
  const child = init(option.onData);
  return { child };
};
