<template>
  <div class="campus-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">校园指南管理</span>
            <el-tag type="success" class="total-tag"
              >共 {{ total }} 条指南</el-tag
            >
          </div>
          <div class="header-operations">
            <el-input
              v-model="searchQuery"
              placeholder="搜索指南标题"
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
              <el-icon><Plus /></el-icon>新增指南
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
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column
          prop="title"
          label="标题"
          min-width="200"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{
              row.title
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="内容"
          min-width="300"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="content-preview">{{ row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="createdTime"
          label="创建时间"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              :icon="Edit"
              circle
              @click="handleEdit(row)"
            />
            <el-button
              type="success"
              :icon="View"
              circle
              @click="handleView(row)"
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
      :title="dialogType === 'add' ? '新增指南' : '编辑指南'"
      width="700px"
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
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入内容"
            resize="none"
          />
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

    <!-- 查看对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="查看指南"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="view-content">
        <h2 class="view-title">{{ viewData.title }}</h2>
        <div class="view-info">
          <span>创建时间：{{ viewData.createdTime }}</span>
        </div>
        <div class="view-body">{{ viewData.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus, Delete, Edit, View } from "@element-plus/icons-vue";
import {
  getCampusList,
  addCampus,
  deleteCampus,
  updateCampus
} from "@/api/campus";
import "@/style/campus.css";

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
const viewDialogVisible = ref(false);
const dialogType = ref("add");
const formRef = ref();

// 查看数据
const viewData = reactive({
  title: "",
  content: "",
  createdTime: ""
});

// 表单数据
const form = reactive({
  campusId: "",
  title: "",
  content: ""
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: "请输入标题", trigger: "blur" },
    { min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur" }
  ],
  content: [
    { required: true, message: "请输入内容", trigger: "blur" },
    { min: 10, max: 2000, message: "长度在 10 到 2000 个字符", trigger: "blur" }
  ]
};

// 表格行样式
const tableRowClassName = ({ rowIndex }) => {
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
const handleSizeChange = val => {
  pageSize.value = val;
  getTableData();
};

const handleCurrentChange = val => {
  currentPage.value = val;
  getTableData();
};

// 新增指南
const handleAdd = () => {
  dialogType.value = "add";
  form.campusId = "";
  form.title = "";
  form.content = "";
  dialogVisible.value = true;
};

// 编辑指南
const handleEdit = row => {
  dialogType.value = "edit";
  form.campusId = row.campusId;
  form.title = row.title;
  form.content = row.content;
  dialogVisible.value = true;
};

// 查看指南
const handleView = row => {
  viewData.title = row.title;
  viewData.content = row.content;
  viewData.createdTime = row.createdTime;
  viewDialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        const formData = {
          title: form.title.trim(),
          content: form.content.trim()
        };

        let res;
        if (dialogType.value === "add") {
          res = await addCampus(formData);
        } else {
          res = await updateCampus({
            ...formData,
            campusId: form.campusId
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
      } catch (error) {
        console.error(
          dialogType.value === "add" ? "新增指南失败:" : "更新指南失败:",
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
      title: searchQuery.value || undefined
    };
    const res = await getCampusList(data);
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
  } catch (error) {
    console.error("获取指南列表失败:", error);
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

// 删除指南
const handleDelete = async row => {
  try {
    await ElMessageBox.confirm(`确定要删除指南"${row.title}"吗？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    row.deleteLoading = true;
    const res = await deleteCampus(row.campusId);

    if (res.code === 200) {
      ElMessage.success("删除成功");
      getTableData();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除指南失败:", error);
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
/* 样式已移至 @/style/campus.css */
</style>
