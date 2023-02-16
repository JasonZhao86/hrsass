<template>
  <el-dialog title="分配角色" :visible="showRoleDialog" @close="btnCancel">
    <!-- el-checkbox-group选中的是当前用户所拥有的角色，需要绑定当前用户拥有的角色 -->
    <el-checkbox-group v-model="roleIds">
      <!-- 选项 -->
      <el-checkbox v-for="item in list" :key="item.id" :label="item.id">
        {{ item.name }}
      </el-checkbox>
    </el-checkbox-group>
    <template v-slot:footer>
      <el-row type="flex" justify="center">
        <el-col :span="6">
          <el-button type="primary" size="small" @click="btnOK">确定</el-button>
          <el-button size="small" @click="btnCancel">取消</el-button>
        </el-col>
      </el-row>
    </template>
  </el-dialog>
</template>

<script>
import { getRoleList } from "@/api/setting";
import { getUserDetailById } from "@/api/user";
import { assignRoles } from "@/api/employees";
export default {
  props: {
    showRoleDialog: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      // 角色列表
      list: [],
      roleIds: [],
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    //  获取所有角色
    async getRoleList() {
      const { rows } = await getRoleList();
      this.list = rows;
    },
    // 获取用户的当前角色
    async getUserDetailById(id) {
      const { roleIds } = await getUserDetailById(id);
      this.roleIds = roleIds;
    },
    btnCancel() {
      // 清空原来的数组
      this.roleIds = [];
      this.$emit("update:showRoleDialog", false);
    },
    async btnOK() {
      await assignRoles({ id: this.userId, roleIds: this.roleIds });
      this.$emit("update:showRoleDialog", false);
    },
  },
};
</script>

<style></style>
