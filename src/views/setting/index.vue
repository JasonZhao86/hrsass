<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <!-- 放置页签 -->
          <el-tab-pane label="角色管理">
            <!-- 新增角色按钮 -->
            <el-row style="height: 60px">
              <el-button
                icon="el-icon-plus"
                size="small"
                type="primary"
                @click="showDialog = true"
                >新增角色</el-button
              >
            </el-row>
            <!-- 表格 -->
            <el-table border="" :data="list">
              <el-table-column
                align="center"
                type="index"
                label="序号"
                width="120"
              />
              <el-table-column
                align="center"
                prop="name"
                label="角色名称"
                width="240"
              />
              <el-table-column align="center" prop="description" label="描述" />
              <el-table-column align="center" label="操作">
                <!-- 作用域插槽 -->
                <template slot-scope="{ row }">
                  <el-button size="small" type="success">分配权限</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click="editRole(row.id)"
                    >编辑</el-button
                  >
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteRole(row.id)"
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
              <!-- 绑定分页数据 -->
              <el-pagination
                :current-page="page.page"
                :page-size="page.pagesize"
                :total="page.total"
                layout="prev,pager,next"
                @current-change="changePage"
              />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="公司信息">
            <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
              show-icon
              :closable="false"
            />
            <el-form label-width="120px" style="margin-top: 50px">
              <el-form-item label="公司名称">
                <el-input
                  v-model="formData.name"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input
                  v-model="formData.companyAddress"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input
                  v-model="formData.mailbox"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remarks"
                  type="textarea"
                  :rows="3"
                  disabled
                  style="width: 400px"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
    <el-dialog title="编辑弹层" :visible="showDialog" @close="btnCancle">
      <el-form
        ref="roleForm"
        :model="roleForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.description" />
        </el-form-item>
      </el-form>
      <el-row slot="footer" type="flex" justify="center">
        <el-col :span="6">
          <el-button size="small" @click="btnCancle">取消</el-button>
          <el-button size="small" type="primary" @click="btnOK">确定</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import {
  getRoleList,
  getCompanyInfo,
  deleteRole,
  updateRole,
  getRoleDetail,
  addRole,
} from "@/api/setting";
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      list: [],
      // 放置页码及相关数据
      page: {
        page: 1,
        pagesize: 10,
        total: 0,
      },
      formData: {
        name: "",
        companyAddress: "",
        mailbox: "",
        remarks: "",
      },
      showDialog: false,
      roleForm: {},
      rules: {
        name: [
          { required: true, message: "角色名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page);
      this.list = rows;
      this.page.total = total;
    },
    changePage(newPage) {
      // newPage是当前点击的页码
      this.page.page = newPage;
      // 刷新页面数据
      this.getRoleList();
    },
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.companyId);
    },
    async deleteRole(id) {
      try {
        await this.$confirm("确认删除该角色吗");
        // 只有点击了确定才能进入到下方
        await deleteRole(id);
        // 重新加载数据
        this.getRoleList();
        this.$message("删除角色成功");
      } catch (err) {
        console.log(err);
      }
    },
    async editRole(id) {
      this.roleForm = await getRoleDetail(id);
      // 为了不出现闪烁的问题，先获取数据再弹出层
      this.showDialog = true;
    },
    async btnOK() {
      try {
        await this.$refs.roleForm.validate();
        // 只有校验通过才会执行await的下方内容，roleForm有id就是编辑场景，没有id就是新增场景
        if (this.roleForm.id) {
          await updateRole(this.roleForm);
        } else {
          // 新增角色
          await addRole(this.roleForm);
        }
        this.getRoleList();
        this.$message.success(this.roleForm.id ? "更新成功" : "添加成功");
        this.showDialog = false;
      } catch (err) {
        console.log(err);
      }
    },
    btnCancle() {
      this.roleForm = {
        name: "",
        description: "",
      };
      // 移除之前的校验信息
      this.$refs.roleForm.resetFields();
      this.showDialog = false;
    },
  },
  created() {
    this.getRoleList();
    this.getCompanyInfo();
  },
  computed: {
    ...mapGetters(["companyId"]),
  },
};
</script>

<style></style>
