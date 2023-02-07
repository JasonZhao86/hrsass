<template>
  <div v-loading="loading" class="dashboard-container">
    <div class="app-container">
      <el-card class="tree-card">
        <tree-tools :treeNode="company" :isRoot="true"></tree-tools>
        <el-tree :data="departs" :props="defaultProps" default-expand-all>
          <!-- el-tree里面的内容就是传入的插槽内容，会循环多次，有多少节点就循环多少次 -->
          <!-- 作用域插槽slot-scope="obj"，tree组件传递给插槽的数据，data每个节点的数据对象，
          先执行slot-scope赋值再执行props的传值 -->
          <tree-tools
            slot-scope="{ data }"
            :treeNode="data"
            @delDepts="getDepartments"
            @addDepts="addDepts"
            @editDepts="editDepts"
          />
        </el-tree>
        <add-dept
          ref="addDept"
          :showDialog.sync="showDialog"
          :tree-node="node"
          @addDepts="getDepartments"
        ></add-dept>
      </el-card>
    </div>
  </div>
</template>

<script>
import TreeTools from "./components/tree-tools";
import AddDept from "./components/add-dept";
import { getDepartments } from "@/api/departments";
import { tranListToTreeData } from "@/utils";

export default {
  components: {
    TreeTools,
    AddDept,
  },
  data() {
    return {
      defaultProps: {
        // tree树形结构的label显示字段使用departs数据的name字段填充
        label: "name",
      },
      company: {},
      departs: [],
      showDialog: false,
      node: null,
      // 用来控制进度弹层的显示和隐藏
      loading: false,
    };
  },
  created() {
    // created不能是异步函数，所以不能使用async标记created钩子函数
    this.getDepartments();
  },
  methods: {
    // 加载数据前后设置loading变量
    async getDepartments() {
      try {
        this.loading = true;
        const res = await getDepartments();
        this.company = { name: res.companyName, manager: "负责人", id: "" };
        this.departs = tranListToTreeData(res.depts, ""); // 需要将其转化成树形结构
        this.loading = false;
      } catch (err) {
        /*
          后台请求失败时处理，这里不需要前台显示错误消息，因为响应拦截器中已
          经显示过了，只做控制台打印
        */
        console.log(err.message || err);
        this.loading = false;
      }
    },
    addDepts(node) {
      this.showDialog = true;
      // 将当前点击的node父部门信息记录到父组件中，方便后面向后台发起请求新增子部门
      this.node = node;
    },
    editDepts(node) {
      this.showDialog = true;
      this.node = node;
      // 直接调用子组件中的getDepartDetail方法，传入当前操作的节点的id
      this.$refs.addDept.getDepartDetail(node.id);
    },
  },
};
</script>

<style scoped>
.tree-card {
  padding: 30px 140px;
  font-size: 14px;
}
</style>
