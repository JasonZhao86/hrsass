<template>
  <el-dialog :title="showTitle" :visible="showDialog" @close="btnCancel">
    <!-- 匿名插槽，表单组件el-form，label-width设置label的宽度 -->
    <el-form
      ref="deptForm"
      label-width="120px"
      :model="formData"
      :rules="rules"
    >
      <el-form-item prop="name" label="部门名称">
        <el-input
          v-model="formData.name"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item prop="code" label="部门编码">
        <el-input
          v-model="formData.code"
          style="width: 80%"
          placeholder="1-50个字符"
        />
      </el-form-item>
      <el-form-item prop="manager" label="部门负责人">
        <el-select
          v-model="formData.manager"
          style="width: 80%"
          placeholder="请选择"
          @focus="getEmployeeSimple"
        >
          <!-- 需要循环生成选项，显示的是用户名 存的也是用户名 -->
          <el-option
            v-for="item in peoples"
            :key="item.id"
            :label="item.username"
            :value="item.username"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="introduce" label="部门介绍">
        <el-input
          v-model="formData.introduce"
          style="width: 80%"
          placeholder="1-300个字符"
          type="textarea"
          :row="3"
        />
      </el-form-item>
    </el-form>
    <!-- 具名插槽，el-dialog有专门放置底部操作栏的插槽footer -->
    <el-row type="flex" justify="center" slot="footer">
      <el-col :span="6">
        <el-button type="primary" size="small" @click="btnOK">确定</el-button>
        <el-button size="small" @click="btnCancel">取消</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import {
  getDepartments,
  addDepartments,
  getDepartDetail,
  updateDepartments,
} from "@/api/departments";
import { getEmployeeSimple } from "@/api/employees";
export default {
  props: {
    showDialog: {
      type: Boolean,
      default: false,
    },
    // 当前操作的节点
    treeNode: {
      type: Object,
      default: null,
    },
  },
  data() {
    // 同级部门下不能有重复的部门名称
    const checkNameRepeat = async (rule, value, callback) => {
      // 先获取最新的组织架构数据
      const { depts } = await getDepartments();
      let isRepeat = false;
      if (this.formData.id) {
        // 编辑模式，排除自己
        isRepeat = depts
          .filter(
            (item) =>
              item.id !== this.formData.id && item.pid === this.treeNode.id
          )
          .some((item) => item.name === value);
      } else {
        // 新增模式
        isRepeat = depts
          .filter((item) => item.pid === this.treeNode.id)
          .some((item) => item.name === value);
      }

      isRepeat
        ? callback(new Error(`同级部门下已经有${value}的部门了`))
        : callback();
    };

    // 编码全局不能重复
    const checkCodeRepeat = async (rule, value, callback) => {
      // 先获取最新的组织架构数据
      const { depts } = await getDepartments();
      let isRepeat = false;
      if (this.formData.id) {
        // 编辑模式，排除自己
        isRepeat = depts.some(
          (item) => item.id !== this.formData.id && item.code === value && value
        );
      } else {
        // 新增模式，这里加一个value不为空，因为我们的部门有可能没有code
        isRepeat = depts.some((item) => item.code === value && value);
      }
      isRepeat
        ? callback(new Error(`组织架构中已经有部门使用${value}编码`))
        : callback();
    };
    return {
      peoples: [], // 接收获取的员工简单列表的数据
      // 定义表单数据
      formData: {
        name: "", // 部门名称
        code: "", // 部门编码
        manager: "", // 部门管理者
        introduce: "", // 部门介绍
      },
      // 定义校验规则
      rules: {
        name: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "部门名称要求1-50个字符",
            trigger: "blur",
          },
          { trigger: "blur", validator: checkNameRepeat },
        ],
        code: [
          { required: true, message: "部门编码不能为空", trigger: "blur" },
          {
            min: 1,
            max: 50,
            message: "部门编码要求1-50个字符",
            trigger: "blur",
          },
          { trigger: "blur", validator: checkCodeRepeat },
        ],
        manager: [
          { required: true, message: "部门负责人不能为空", trigger: "blur" },
        ],
        introduce: [
          { required: true, message: "部门介绍不能为空", trigger: "blur" },
          {
            trigger: "blur",
            min: 1,
            max: 300,
            message: "部门介绍要求1-50个字符",
          },
        ],
      },
    };
  },
  methods: {
    async getEmployeeSimple() {
      this.peoples = await getEmployeeSimple();
    },
    // 获取部门详情
    async getDepartDetail(id) {
      this.formData = await getDepartDetail(id);
    },
    // 点击确定时触发
    btnOK() {
      this.$refs.deptForm.validate(async (isOK) => {
        if (isOK) {
          if (this.formData.id) {
            // 编辑模式，调用编辑接口
            await updateDepartments(this.formData);
          } else {
            // 新增模式，调用新增接口，传入父部门的id
            await addDepartments({ ...this.formData, pid: this.treeNode.id });
          }
          // 新增成功之后，告诉父组件重新拉取数据并关闭弹层
          this.$emit("addDepts");
          this.$emit("update:showDialog", false);
        }
      });
    },
    btnCancel() {
      /* 
        重置数据，因为resetFields只能重置表单上的数据，
        非表单上的，比如编辑中的id不能重置
      */
      this.formData = {
        name: "",
        code: "",
        manager: "",
        introduce: "",
      };
      // 清除之前的校验，并且可以重置数据，但只能重置定义在data中的数据
      this.$refs.deptForm.resetFields();
      // 关闭弹层
      this.$emit("update:showDialog", false);
    },
  },
  computed: {
    showTitle() {
      return this.formData.id ? "编辑部门" : "新增子部门";
    },
  },
};
</script>

<style></style>
