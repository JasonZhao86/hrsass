<template>
  <upload-excel :on-success="success" />
</template>

<script>
import UploadExcel from "@/components/UploadExcel";
import { importEmployee } from "@/api/employees";

export default {
  components: {
    UploadExcel,
  },
  data() {
    return {
      // 用参数来判断，是否是导入员工
      type: this.$route.query.type,
    };
  },
  methods: {
    async success({ header, results }) {
      //   console.log(header, results);
      if (this.type === "user") {
        // 如果是导入员工
        const userRelations = {
          入职日期: "timeOfEntry",
          手机号: "mobile",
          姓名: "username",
          转正日期: "correctionTime",
          工号: "workNumber",
        };
        const arr = [];
        results.forEach((item) => {
          // 需要将每一个条数据里面的中文都换成英文
          const userInfo = {};
          Object.keys(item).forEach((key) => {
            // key是当前的中文名 找到对应的英文名
            if (
              userRelations[key] === "timeOfEntry" ||
              userRelations[key] === "correctionTime"
            ) {
              // 将YYYY-MM-DD格式的时间字符串转换成时间对象后才能入库
              userInfo[userRelations[key]] = new Date(
                this.formatDate(item[key], "/")
              );
              return;
            }
            userInfo[userRelations[key]] = item[key];
          });
          arr.push(userInfo);
        });
        await importEmployee(arr);
        this.$message.success("导入成功");
      }
      // 回到上一页
      this.$router.back();
    },
    // 入职日期: 43535 => 2019/3/11
    formatDate(numb, format) {
      // excel的时间转换成unix的毫秒
      const time = new Date((numb - 1) * 24 * 3600000 + 1);
      time.setYear(time.getFullYear() - 70);
      const year = time.getFullYear() + "";
      const month = time.getMonth() + 1 + "";
      const date = time.getDate() - 1 + "";
      if (format && format.length === 1) {
        return year + format + month + format + date;
      }
      return (
        year +
        (month < 10 ? "0" + month : month) +
        (date < 10 ? "0" + date : date)
      );
    },
  },
};
</script>

<style></style>
