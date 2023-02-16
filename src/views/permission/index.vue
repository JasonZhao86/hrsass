<template>
  <div class="dashboard-container">
    <div class="app-container">
      <!-- 靠右的按钮 -->
      <page-tools>
        <template #after>
          <!-- 新增页面访问权限 -->
          <el-button type="primary" size="small" @click="addPermission('0', 1)"
            >添加权限</el-button
          >
        </template>
      </page-tools>
      <!-- 表格 -->
      <el-table v-loading="loading" border :data="list" row-key="id">
        <el-table-column label="名称" prop="name" />
        <el-table-column align="center" label="标识" prop="code" />
        <el-table-column align="center" label="描述" prop="description" />
        <el-table-column align="center" label="操作">
          <template v-slot="{ row }">
            <!-- 在页面访问权限下新增按钮权限，1代表页面访问权限 -->
            <el-button
              v-if="row.type === 1"
              type="text"
              @click="addPermission(row.id, 2)"
              >添加</el-button
            >
            <el-button type="text" @click="editPermission(row.id)"
              >编辑</el-button
            >
            <el-button type="text" @click="delPermission(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 放置一个弹层 用来编辑新增节点 -->
    <el-dialog
      :title="`${showText}权限点`"
      :visible="showDialog"
      @close="btnCancel"
    >
      <el-form
        ref="perForm"
        :model="formData"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" style="width: 90%" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="formData.code" style="width: 90%" />
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input v-model="formData.description" style="width: 90%" />
        </el-form-item>
        <el-form-item label="开启">
          <el-switch
            v-model="formData.enVisible"
            active-value="1"
            inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-row type="flex" justify="center" align="middle">
          <el-col :span="6">
            <el-button type="primary" size="small" @click="btnOK"
              >确定</el-button
            >
            <el-button size="small" @click="btnCancel">取消</el-button>
          </el-col>
        </el-row>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import PageTools from "@/components/PageTools";
import {
  getPermissionList,
  updatePermission,
  addPermission,
  getPermissionDetail,
  delPermission,
} from "@/api/permisson";
import { tranListToTreeData } from "@/utils";

export default {
  components: {
    PageTools,
  },
  data() {
    return {
      loading: false,
      list: [],
      formData: {
        name: "", // 名称
        code: "", // 标识
        description: "", // 描述
        type: "", // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: "", // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: "0", // 开启
      },
      rules: {
        name: [
          { required: true, message: "权限名称不能为空", trigger: "blur" },
        ],
        code: [
          { required: true, message: "权限标识不能为空", trigger: "blur" },
        ],
      },
      showDialog: false,
    };
  },
  created() {
    this.getPermissionList();
  },
  methods: {
    async getPermissionList() {
      this.list = tranListToTreeData(await getPermissionList(), "0");
    },
    btnCancel() {
      this.formData = {
        name: "", // 名称
        code: "", // 标识
        description: "", // 描述
        type: "", // 类型 该类型 不需要显示 因为点击添加的时候已经知道类型了
        pid: "", // 因为做的是树 需要知道添加到哪个节点下了
        enVisible: "0", // 开启
      };
      this.$refs.perForm.resetFields();
      this.showDialog = false;
    },
    btnOK() {
      this.$refs.perForm
        .validate()
        .then(() => {
          if (this.formData.id) {
            // 编辑权限
            return updatePermission(this.formData);
          }
          // 新增权限
          return addPermission(this.formData);
        })
        .then(() => {
          this.$message.success("保存成功");
          this.getPermissionList();
          this.showDialog = false;
        })
        // 只需要处理成功的情况，失败的情况已经在响应拦截器中提示过了
        .catch((err) => {});
    },
    async editPermission(id) {
      this.loading = true;
      try {
        this.formData = await getPermissionDetail(id);
        this.showDialog = true;
      } finally {
        this.loading = false;
      }
    },
    async addPermission(pid, type) {
      this.formData.pid = pid;
      this.formData.type = type;
      this.showDialog = true;
    },
    async delPermission(id) {
      try {
        await this.$confirm("确定要删除该数据吗");
        await delPermission(id);
        this.getPermissionList();
        this.$message.success("删除成功");
      } catch (err) {
        console.log(err);
      }
    },
  },
  computed: {
    showText() {
      return this.formData.id ? "编辑" : "新增";
    },
  },
};
</script>

<style></style>
