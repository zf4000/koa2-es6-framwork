import koaRouter from "koa-router";
const router = koaRouter();

import dayjs from "dayjs";
// 格式化date
const format = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  return dayjs(date).format(format);
};
const add = (date = "", num = 1, unit = "day") => {
  return dayjs(date).add(num, unit);
};

// 模拟服务器生成数据

const generateRows = () => {
  const arrClass = [
    "pantou-normal",
    "pantou-wait",
    "pantou-wait-noweisha",
    "pantou-noback",
    "pantou-error",
  ];
  const tagTypeNum = arrClass.length;
  const rows = [];
  const lengthPerRow = 6;
  const lengthRow = 23;

  for (let i = 0; i < lengthRow; i++) {
    const tags = [];
    for (let j = 0; j < lengthPerRow; j++) {
      const index = i * lengthPerRow + j;
      const legendIdx = index % tagTypeNum;

      const startTime = format(
        add("2023-12-01 00:00:00", j * 2, "day"),
        "YYYY/MM/DD HH:mm:ss"
      );
      const endTime = format(add(startTime, 47, "hour"), "YYYY/MM/DD HH:mm:ss");

      if (i !== 1) {
        tags.push({
          startTime,
          endTime,
          label: index + "# FS0001-1 3000m ",
          type: i + 1,
          className: arrClass[legendIdx],
          selected: false,
        });
      }
    }

    rows.push({
      label: `${i + 1}# 色织 4喷 ${["单轴", "双轴"][i % 2]}`,
      tags,
    });
  }
  return rows;
};
router.post("/dingding/getData", async (ctx) => {
  // const post = ctx.request.body;
  // if (!post) {
  //   return;
  // }
  // console.log("post参数", post);
  ctx.body = { success: true, data: generateRows() };
});
export default router;
