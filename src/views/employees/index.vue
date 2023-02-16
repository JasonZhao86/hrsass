<template>
  <div class="dashboard-container">
    <div class="app-container">
      <page-tools :show-before="true">
        <span slot="before">共166条记录</span>
        <template slot="after">
          <el-button
            size="small"
            type="warning"
            @click="$router.push('/import?type=user')"
            >导入</el-button
          >
          <el-button size="small" type="danger" @click="exportData"
            >导出</el-button
          >
          <el-button
            icon="el-icon-plus"
            size="small"
            type="primary"
            @click="showDialog = true"
            >新增员工</el-button
          >
        </template>
      </page-tools>
      <!-- 放置表格和分页 -->
      <el-card v-loading="loading">
        <el-table border :data="list">
          <el-table-column label="序号" sortable="" type="index" />
          <el-table-column label="姓名" sortable="" prop="username" />
          <el-table-column label="头像" align="center">
            <!-- 作用域插槽 -->
            <template slot-scope="{ row }">
              <!-- 具名插槽 -->
              <img
                :src="row.staffPhoto"
                v-imagerror="require('@//assets/common/bigUserHeader.png')"
                style="
                  border-radius: 50%;
                  width: 100px;
                  height: 100px;
                  padding: 10px;
                "
                alt=""
                @click="showQrCode(row.staffPhoto)"
              />
            </template>
          </el-table-column>
          <el-table-column label="工号" sortable="" prop="workNumber" />
          <el-table-column
            label="聘用形式"
            sortable=""
            prop="formOfEmployment"
            :formatter="formatEmployment"
          />
          <el-table-column label="部门" sortable="" prop="departmentName" />
          <el-table-column
            label="入职时间"
            sortable=""
            prop="timeOfEntry"
            align="center"
          >
            <!-- 作用域插槽 -->
            <template slot-scope="{ row }">
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column
            label="账户状态"
            sortable=""
            prop="enableState"
            align="center"
          >
            <template slot-scope="{ row }">
              <!-- 根据当前状态来确定 是否打开开关 -->
              <el-switch :value="row.enableState === 1" />
            </template>
          </el-table-column>
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template slot-scope="{ row }">
              <el-button
                :disabled="!checkPermission('POINT-USER-UPDATE')"
                type="text"
                size="small"
                @click="$router.push(`/employees/detail/${row.id}`)"
                >查看</el-button
              >
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)"
                >角色</el-button
              >
              <el-button
                type="text"
                size="small"
                @click="deleteEmployee(row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row
          type="flex"
          justify="center"
          align="middle"
          style="height: 60px"
        >
          <el-pagination
            layout="prev, pager, next"
            :page-size="page.size"
            :current-page="page.page"
            :total="page.total"
            @current-change="changePage"
          />
        </el-row>
      </el-card>
    </div>
    <add-employee :showDialog.sync="showDialog" />
    <el-dialog title="二维码" :visible.sync="showCodeDialog">
      <el-row type="flex" justify="center">
        <canvas ref="myCanvas" />
      </el-row>
    </el-dialog>
    <assign-role
      v-loading="loading"
      ref="assignRole"
      :show-role-dialog.sync="showRoleDialog"
      :user-id="userId"
    />
  </div>
</template>

<script>
import { getEmployeeList, delEmployee } from "@/api/employees";
import EmployeeEnum from "@/api/constant/employees";
import AddEmployee from "./components/add-employee";
import AssignRole from "./components/assign-role";
import { formatDate } from "@/filters";
import QrCode from "qrcode";

export default {
  components: {
    AddEmployee,
    AssignRole,
  },
  data() {
    return {
      loading: false,
      list: [], // 接数据的
      page: {
        page: 1,
        size: 10, // 当前页码
        total: 0, // 总数
      },
      showDialog: false,
      showCodeDialog: false,
      showRoleDialog: false, // 显示分配角色弹层
      userId: null,
    };
  },
  methods: {
    async getEmployeeList() {
      this.loading = true;
      try {
        const { total, rows } = await getEmployeeList(this.page);
        this.page.total = total;
        this.list = rows;
      } catch (err) {}
      this.loading = false;
    },
    changePage(newPage) {
      this.page.page = newPage;
      this.getEmployeeList();
    },
    // 格式化聘用形式
    formatEmployment(row, column, cellValue, index) {
      // 查找枚举值1所对应的文字值
      const obj = EmployeeEnum.hireType.find((item) => item.id === cellValue);
      return obj ? obj.value : "未知";
    },
    // 删除员工
    async deleteEmployee(id) {
      try {
        await this.$confirm("您确定删除该员工吗");
        await delEmployee(id);
        this.getEmployeeList();
        this.$message.success("删除员工成功");
      } catch (err) {
        console.log(err);
      }
    },
    exportData() {
      // 表头对应关系
      const headers = {
        姓名: "username",
        手机号: "mobile",
        入职日期: "timeOfEntry",
        聘用形式: "formOfEmployment",
        转正日期: "correctionTime",
        工号: "workNumber",
        部门: "departmentName",
      };
      // 懒加载
      import("@/vendor/Export2Excel").then(async (excel) => {
        // 获取所有员工数据
        const { rows } = await getEmployeeList({
          page: 1,
          size: this.page.total,
        });
        const data = this.formatJson(headers, rows);
        excel.export_json_to_excel({
          header: Object.keys(headers),
          data,
          filename: "员工信息表",
          autoWidth: true,
          bookType: "xlsx",
        });

        // excel.export_json_to_excel({
        //   header: ['姓名', '薪资'],
        //   data: [['张三', 12000], ['李四', 5000]],
        //   filename: '员工薪资表',
        //   autoWidth: true,
        //   bookType: 'csv'
        // })
      });
    },
    // exportData() {
    //   const headers = {
    //     姓名: "username",
    //     手机号: "mobile",
    //     入职日期: "timeOfEntry",
    //     聘用形式: "formOfEmployment",
    //     转正日期: "correctionTime",
    //     工号: "workNumber",
    //     部门: "departmentName",
    //   };
    //   import("@/vendor/Export2Excel").then(async (excel) => {
    //     const { rows } = await getEmployeeList({
    //       page: 1,
    //       size: this.page.total,
    //     });
    //     const data = this.formatJson(headers, rows);
    //     const multiHeader = [["姓名", "主要信息", "", "", "", "", "部门"]];
    //     const merges = ["A1:A2", "B1:F1", "G1:G2"];

    //     excel.export_json_to_excel({
    //       header: Object.keys(headers),
    //       data,
    //       filename: "员工信息表",
    //       multiHeader,
    //       merges,
    //     });
    //   });
    // },
    // 该方法负责将数组转化成二维数组
    formatJson(headers, rows) {
      // [{ username: '张三'},{},{}]  => [[’张三'],[],[]]
      return rows.map((item) => {
        return Object.keys(headers).map((key) => {
          if (
            headers[key] === "timeOfEntry" ||
            headers[key] === "correctionTime"
          ) {
            // 将时间对象按YYYY-DD-MM格式化成字符串
            return formatDate(item[headers[key]]);
          } else if (headers[key] === "formOfEmployment") {
            const en = EmployeeEnum.hireType.find(
              (obj) => obj.id === item[headers[key]]
            );
            return en ? en.value : "未知";
          }
          return item[headers[key]];
        });
      });
    },
    showQrCode(url) {
      if (url) {
        /* 
          状态数据更新完了，但是DOM页面（弹层）不会立刻渲染，页面的渲染是异步的！
          所以紧接着获取真实的DOM对象myCanvas会报错
        */
        this.showCodeDialog = true;
        // 页面渲染完毕后自动调用回调函数获取真实的DOM对象myCanvas
        this.$nextTick(() => {
          // 将地址转化成二维码，第二个参数如果是一个地址，扫码就会跳转到该地址，否则就会显示该内容
          QrCode.toCanvas(this.$refs.myCanvas, url);
        });
      } else {
        this.$message.warning("该用户还未上传头像");
      }
    },
    async editRole(userId) {
      this.loading = true;
      // props赋值，DOM渲染异步的
      this.userId = userId;
      // 调用子组件方法，异步方法
      await this.$refs.assignRole.getUserDetailById(userId);
      this.showRoleDialog = true;
      this.loading = false;
    },
  },
  created() {
    this.getEmployeeList();
  },
};
</script>

<style></style>
