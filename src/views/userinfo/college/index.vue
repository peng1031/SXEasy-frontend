<template>
  <div class="college-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">学院信息管理</span>
          <div class="header-operations">
            <el-input
              v-model="searchQuery"
              placeholder="搜索学院名称"
              class="search-input"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增学院
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#606266',
          fontWeight: 'bold'
        }"
        :row-class-name="tableRowClassName"
        :max-height="tableHeight"
      >
        <el-table-column
          prop="name"
          label="学院名称"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="dean"
          label="院长姓名"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="phone"
          label="联系电话"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="email"
          label="电子邮箱"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="campusName"
          label="所属校区"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createdTime"
          label="创建时间"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              :icon="Edit"
              circle
              @click="handleEdit(row)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              :loading="row.deleteLoading"
              @click="handleDelete(row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="Number(total)"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增学院' : '编辑学院'"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        v-if="majorOptions.length > 0 || !form.collegeId"
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="学院名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学院名称" />
        </el-form-item>
        <el-form-item label="院长姓名" prop="dean">
          <el-input v-model="form.dean" placeholder="请输入院长姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="所属校区" prop="campusName">
          <el-input v-model="form.campusName" placeholder="请输入所属校区" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus, Delete, Edit } from "@element-plus/icons-vue";
import {
  getCollegeList,
  addCollege,
  deleteCollege,
  updateCollege
} from "@/api/college";
import type { FormInstance } from "element-plus";

// 类型定义
interface CollegeForm {
  collegeId?: string;
  name: string;
  dean: string;
  phone: string;
  email: string;
  campusName: string;
}

// 搜索相关
const searchQuery = ref("");
const loading = ref(false);
const submitLoading = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表格数据
const tableData = ref([]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const formRef = ref<FormInstance>();

// 表单数据
const form = reactive<CollegeForm>({
  collegeId: "",
  name: "",
  dean: "",
  phone: "",
  email: "",
  campusName: ""
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入学院名称", trigger: "blur" },
    { min: 2, max: 255, message: "长度在 2 到 255 个字符", trigger: "blur" }
  ],
  dean: [
    {
      required: true,
      max: 100,
      message: "长度不能超过 100 个字符",
      trigger: "blur"
    }
  ],
  phone: [
    {
      required: true,
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ],
  email: [
    {
      required: true,
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: "blur"
    }
  ],
  campusName: [
    { required: true, message: "请输入所属校区", trigger: "blur" },
    { min: 2, max: 255, message: "长度在 2 到 255 个字符", trigger: "blur" }
  ]
};

// 表格行样式
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  return rowIndex % 2 === 0 ? "even-row" : "odd-row";
};

// 表格高度自适应
const tableHeight = ref(500);

// 计算表格高度
const calculateTableHeight = () => {
  const windowHeight = window.innerHeight;
  const offset = 280; // 其他元素占用的高度（头部、分页等）
  tableHeight.value = windowHeight - offset;
};

// 监听窗口大小变化
onMounted(() => {
  calculateTableHeight();
  window.addEventListener("resize", calculateTableHeight);
  getTableData();
});

onUnmounted(() => {
  window.removeEventListener("resize", calculateTableHeight);
});

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  getTableData();
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  getTableData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getTableData();
};

// 新增学院
const handleAdd = () => {
  dialogType.value = "add";
  Object.keys(form).forEach(key => {
    form[key as keyof CollegeForm] = "";
  });
  dialogVisible.value = true;
};

// 编辑学院
const handleEdit = (row: any) => {
  dialogType.value = "edit";
  Object.keys(form).forEach(key => {
    form[key as keyof CollegeForm] = row[key] || "";
  });
  dialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        const formData = {
          name: form.name.trim(),
          dean: form.dean?.trim() || null,
          phone: form.phone?.trim() || null,
          email: form.email?.trim() || null,
          campusName: form.campusName.trim()
        };

        let res;
        if (dialogType.value === "add") {
          res = await addCollege(formData);
        } else {
          res = await updateCollege({
            ...formData,
            collegeId: form.collegeId
          });
        }

        if (res.code === 200) {
          ElMessage.success(
            dialogType.value === "add" ? "新增成功" : "更新成功"
          );
          dialogVisible.value = false;
          getTableData();
        } else {
          ElMessage.error(
            res.msg || (dialogType.value === "add" ? "新增失败" : "更新失败")
          );
        }
      } catch (error: any) {
        console.error(
          dialogType.value === "add" ? "新增学院失败:" : "更新学院失败:",
          error
        );
        if (error.response?.data) {
          console.error("错误详情:", error.response.data);
          ElMessage.error(
            error.response.data.msg ||
              (dialogType.value === "add" ? "新增失败" : "更新失败")
          );
        } else {
          ElMessage.error(dialogType.value === "add" ? "新增失败" : "更新失败");
        }
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 获取表格数据
const getTableData = async () => {
  loading.value = true;
  try {
    const data = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      name: searchQuery.value || undefined
    };
    const res = await getCollegeList(data);
    if (res.code === 200) {
      if (res.data) {
        tableData.value = res.data.list || [];
        total.value = res.data.total || 0;
      } else {
        ElMessage.error("暂无数据");
        tableData.value = [];
        total.value = 0;
      }
    } else {
      ElMessage.error(res.msg || "获取数据失败");
      tableData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error("获取学院列表失败:", error);
    if (error.response?.data) {
      console.error("错误详情:", error.response.data);
      ElMessage.error(error.response.data.msg || "获取数据失败");
    } else {
      ElMessage.error("获取数据失败");
    }
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 删除学院
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除学院"${row.name}"吗？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    row.deleteLoading = true;
    const res = await deleteCollege(String(row.collegeId));

    if (res.code === 200) {
      ElMessage.success("删除成功");
      getTableData();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除学院失败:", error);
      if (error.response?.data) {
        console.error("错误详情:", error.response.data);
        ElMessage.error(error.response.data.msg || "删除失败");
      } else {
        ElMessage.error("删除失败");
      }
    }
  } finally {
    row.deleteLoading = false;
  }
};
</script>

<style scoped>
@import url("@/style/college.css");
</style>
