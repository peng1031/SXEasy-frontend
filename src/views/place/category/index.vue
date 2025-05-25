<template>
  <div class="place-category-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">地点分类管理</span>
          <div class="header-operations">
            <el-input
              v-model="searchQuery"
              placeholder="搜索分类名称"
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
              <el-icon><Plus /></el-icon>新增分类
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
          label="分类名称"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createTime"
          label="创建时间"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createBy"
          label="创建人"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="updateTime"
          label="更新时间"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="updateBy"
          label="更新人"
          min-width="100"
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
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
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
  getPlaceCategoryList,
  addPlaceCategory,
  deletePlaceCategory,
  updatePlaceCategory
} from "@/api/placecategory";
import type { FormInstance, FormRules } from "element-plus";

// 类型定义
interface CategoryForm {
  id?: string;
  name: string;
  createTime?: string;
  createBy?: string;
  updateTime?: string;
  updateBy?: string;
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
const form = reactive<CategoryForm>({
  id: "",
  name: "",
  createTime: "",
  createBy: "",
  updateTime: "",
  updateBy: ""
});

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
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

// 初始化函数
const init = () => {
  calculateTableHeight();
  window.addEventListener("resize", calculateTableHeight);
  getTableData();
};

// 清理函数
const cleanup = () => {
  window.removeEventListener("resize", calculateTableHeight);
};

// 监听窗口大小变化
onMounted(() => {
  init();
});

onUnmounted(() => {
  cleanup();
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

// 新增分类
const handleAdd = () => {
  dialogType.value = "add";
  Object.keys(form).forEach(key => {
    form[key as keyof CategoryForm] = "";
  });
  dialogVisible.value = true;
};

// 编辑分类
const handleEdit = (row: any) => {
  dialogType.value = "edit";
  Object.keys(form).forEach(key => {
    form[key as keyof CategoryForm] = row[key] || "";
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
          name: form.name.trim()
        };

        let res;
        if (dialogType.value === "add") {
          res = await addPlaceCategory(formData);
        } else {
          res = await updatePlaceCategory({
            ...formData,
            id: form.id
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
          dialogType.value === "add" ? "新增分类失败:" : "更新分类失败:",
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
    const res = await getPlaceCategoryList();
    if (res.code === 200) {
      if (res.data) {
        tableData.value = res.data.list || [];
        total.value = Number(res.data.total) || 0;
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
    console.error("获取分类列表失败:", error);
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

// 删除分类
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类"${row.name}"吗？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    row.deleteLoading = true;
    const res = await deletePlaceCategory(String(row.id));

    if (res.code === 200) {
      ElMessage.success("删除成功");
      getTableData();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除分类失败:", error);
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
.place-category-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.header-operations {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-form {
  padding: 20px;
}

:deep(.even-row) {
  background-color: #fafafa;
}

:deep(.odd-row) {
  background-color: #fff;
}
</style>
