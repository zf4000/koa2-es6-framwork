//- 前端容器页面中节流请求
const _callapi = (ids, waitTime) => {
  const api = "http://api_url";
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        ids.map((id) => {
          return {
            id,
            data: `报告内容${id}`,
            printTpl: id % 2 > 0 ? "report1.vue" : "report2.vue",
          };
        })
      );
    }, waitTime);
  });
};

//- 对数组进行切片
const _chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

//- 多个请求进行并发控制,
//- fns是一个函数数组,本例中是一个api地址中传入不同的参数,也可以是请求不同url的请求函数集合,
//- 通过函数可以方便的传入参数,
//- 为了通用性,这里的fns可以改为urls,to do
//- onResponse为每次获得响应后的回调
const _concurRequest = (fnsRequest, maxNum, onResponse) => {
  return new Promise((resolve) => {
    if (fnsRequest.length == 0) resolve([]);
    let index = 0; //下一次请求对应的下标
    let count = 0; //请求完成的数量
    const result = []; //结果集合

    //- 单个任务启动
    const request = async () => {
      const i = index;
      const fn = fnsRequest[index++];
      try {
        const resp = await fn();
        console.log(i, "获得响应结果", resp);
        onResponse?.(resp);
        result[i] = resp;
      } catch (error) {
        result[i] = error;
      } finally {
        count++;
        if (count === fnsRequest.length) {
          resolve(result);
        }
        if (index < fnsRequest.length) {
          request();
        }
      }
    };

    //- 启动请求
    for (let i = 0; i < Math.min(fnsRequest.length, maxNum); i++) {
      request();
    }
  });
};

//- 节流请求
export const throttleRequest = function (ids, onComplete) {
  if (ids.length == 0) return;
  // 切片
  const tasks = _chunkArray(ids, 10);
  console.log("切片后", tasks);

  //- 构造请求函数参数,每次请求前需要加入post变量
  const fnsOfCallapi = tasks.map((ids, index) => {
    return async () => {
      console.log("开始请求", index, ",延迟", index % 3, "秒后返回");
      return await _callapi(ids, (index % 3) * 1000);
    };
  });

  let result = [];

  // 发起节流请求
  _concurRequest(fnsOfCallapi, 3, (data) => {
    // console.log("api 返回;", data);
    debug("php返回了", data.length, "个报告内容");
    // 结果通报给nodejs
    window.onGetReports?.(data);
    // 将结果插入
    result = [...result, ...data];

    // 渲染完成后,判断是否所有的任务都处理完了.
    const { nextTick } = Vue;
    nextTick(() => {
      if (result.length == ids.length) {
        debug("consum over");
        onComplete?.(result);
      }
    });
  });
};

export const sfcLoader = async (fileName) => {
  const { loadModule } = window["vue3-sfc-loader"];
  const options = {
    moduleCache: {
      vue: window.Vue,
    },
    async getFile(url) {
      const res = await fetch(url);
      if (!res.ok)
        throw Object.assign(new Error(res.statusText + " " + url), { res });
      return {
        getContentData: (asBinary) =>
          asBinary ? res.arrayBuffer() : res.text(),
      };
    },
    addStyle(textContent) {
      const style = Object.assign(document.createElement("style"), {
        textContent,
      });
      const ref = document.head.getElementsByTagName("style")[0] || null;
      document.head.insertBefore(style, ref);
    },
  };
  try {
    const comp = await loadModule(fileName, options);
    return comp;
    // asyncComps.value.push(comp);
  } catch (error) {
    console.error(error);
    throw new Error(`远程载入sfc文件出错:${fileName}`);
  }
};

// 绑定方法到windows,供nodejs调用
export const appenMethod = (target, args) => {
  window.setparam = (params) => {
    window.params = params;
  };
  window.debug ??= console.warn;

  for (const k in args) {
    target[k] = args[k];
  }
};
