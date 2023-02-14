<template>
  <el-dialog title="新增员工" :visible="showDialog" @close="btnCancle">
    <!-- 表单 -->
    <el-form
      ref="addEmployee"
      label-width="120px"
      :model="formData"
      :rules="rules"
    >
      <el-form-item label="姓名" prop="username">
        <el-input
          v-model="formData.username"
          style="width: 50%"
          placeholder="请输入姓名"
        />
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input
          v-model="formData.mobile"
          style="width: 50%"
          placeholder="请输入手机号"
        />
      </el-form-item>
      <el-form-item label="入职时间" prop="timeOfEntry">
        <el-date-picker
          v-model="formData.timeOfEntry"
          style="width: 50%"
          placeholder="请选择入职时间"
        />
      </el-form-item>
      <el-form-item label="聘用形式" prop="formOfEmployment">
        <el-select
          v-model="formData.formOfEmployment"
          style="width: 50%"
          placeholder="请选择"
        >
          <el-option
            v-for="item in EmployeeEnum.hireType"
            :key="item.id"
            :label="item.value"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="工号" prop="workNumber">
        <el-input
          v-model="formData.workNumber"
          style="width: 50%"
          placeholder="请输入工号"
        />
      </el-form-item>
      <el-form-item label="部门" prop="departmentName">
        <el-input
          v-model="formData.departmentName"
          style="width: 50%"
          placeholder="请选择部门"
          @focus="getDepartments"
        />
        <el-tree
          v-if="showTree"
          v-loading="loading"
          :data="treeData"
          default-expand-all=""
          :props="{ label: 'name' }"
          @node-click="selectNode"
        />
      </el-form-item>
      <el-form-item label="转正时间" prop="correctionTime">
        <el-date-picker
          v-model="formData.correctionTime"
          style="width: 50%"
          placeholder="请选择转正时间"
        />
      </el-form-item>
    </el-form>
    <!-- footer插槽 -->
    <template v-slot:footer>
      <el-row type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" @click="btnCancle">取消</el-button>
          <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        </el-col>
      </el-row>
    </template>
  </el-dialog>
</template>

<script>
import EmployeeEnum from "@/api/constant/employees";
import { addEmployee } from "@/api/employees";
import { getDepartments } from "@/api/departments";
import { tranListToTreeData } from "@/utils";

export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 定义枚举数据
      EmployeeEnum,
      // 接收树形数据
      treeData: [],
      // 控制树形的显示或者隐藏
      showTree: false,
      // 控制树的显示或隐藏进度条
      loading: false,
      formData: {
        username: "",
        mobile: "",
        formOfEmployment: "",
        workNumber: "",
        departmentName: "",
        timeOfEntry: "",
        correctionTime: "",
      },
      rules: {
        username: [
          { required: true, message: "用户姓名不能为空", trigger: "blur" },
          {
            min: 1,
            max: 4,
            message: "用户姓名为1-4位",
          },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "手机号格式不正确",
            trigger: "blur",
          },
        ],
        formOfEmployment: [
          { required: true, message: "聘用形式不能为空", trigger: "blur" },
        ],
        workNumber: [
          { required: true, message: "工号不能为空", trigger: "blur" },
        ],
        departmentName: [
          { required: true, message: "部门不能为空", trigger: "change" },
        ],
        timeOfEntry: [{ required: true, message: "入职时间", trigger: "blur" }],
      },
    };
  },
  methods: {
    async getDepartments() {
      try {
        this.showTree = true;
        this.loading = true;
        const { depts } = await getDepartments();
        this.treeData = tranListToTreeData(depts, "");
        this.loading = false;
      } catch (err) {
        this.loading = false;
      }
    },
    selectNode(node) {
      this.formData.departmentName = node.name;
      this.showTree = false;
    },
    async btnOK() {
      try {
        await this.$refs.addEmployee.validate();
        await addEmployee(this.formData);
        // 告诉父组件更新数据，可以直接调用到父组件的实例，实际上就是父组件this
        this.$parent.getEmployeeList();
        this.$parent.showDialog = false;
        this.$message.success("用户添加成功");
      } catch (err) {
        console.log(err);
      }
    },
    btnCancle() {
      // 重置原来的数据
      this.formData = {
        username: "",
        mobile: "",
        formOfEmployment: "",
        workNumber: "",
        departmentName: "",
        timeOfEntry: "",
        correctionTime: "",
      };
      // 重置校验结果
      this.$refs.addEmployee.resetFields();
      // 通过传统的父传子技术告诉父组件关闭弹层，也可以通过this.$parent
      this.$emit("update:showDialog", false);
    },
  },
};
</script>

<style></style>
