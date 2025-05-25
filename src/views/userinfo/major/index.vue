<template>
  <div class="major-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">专业信息管理</span>
          <div class="header-operations">
            <el-input
              v-model="searchQuery"
              placeholder="搜索专业名称"
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
              <el-icon><Plus /></el-icon>新增专业
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
          label="专业名称"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="code"
          label="专业代码"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="collegeName"
          label="所属学院"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="leader"
          label="专业负责人"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="educationLevel"
          label="学历层次"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="status"
          label="专业状态"
          min-width="100"
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
      :title="dialogType === 'add' ? '新增专业' : '编辑专业'"
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
        <el-form-item label="专业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="专业代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入专业代码" />
        </el-form-item>
        <el-form-item label="所属学院" prop="collegeId">
          <el-select
            v-model="form.collegeId"
            placeholder="请选择所属学院"
            style="width: 100%"
          >
            <el-option
              v-for="item in collegeOptions"
              :key="item.collegeId"
              :label="item.name"
              :value="item.collegeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="专业负责人" prop="leader">
          <el-input v-model="form.leader" placeholder="请输入专业负责人" />
        </el-form-item>
        <el-form-item label="学历层次" prop="educationLevel">
          <el-select
            v-model="form.educationLevel"
            placeholder="请选择学历层次"
            style="width: 100%"
          >
            <el-option label="本科" :value="EducationLevel.UNDERGRADUATE" />
            <el-option label="专科" :value="EducationLevel.COLLEGE" />
            <el-option label="研究生" :value="EducationLevel.GRADUATE" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业状态" prop="status">
          <el-select
            v-model="form.status"
            placeholder="请选择专业状态"
            style="width: 100%"
          >
            <el-option label="在办" :value="MajorStatus.ACTIVE" />
            <el-option label="停办" :value="MajorStatus.SUSPENDED" />
            <el-option label="筹建" :value="MajorStatus.PREPARING" />
          </el-select>
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
  getMajorList,
  addMajor,
  deleteMajor,
  updateMajor,
  EducationLevel,
  MajorStatus
} from "@/api/major";
import { getCollegeList } from "@/api/college";
import type { FormInstance } from "element-plus";

// 类型定义
interface MajorForm {
  majorId?: string;
  name: string;
  code: string;
  collegeId: string;
  leader?: string;
  educationLevel: EducationLevel;
  status: MajorStatus;
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

// 学院选项
const collegeOptions = ref([]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<"add" | "edit">("add");
const formRef = ref<FormInstance>();

// 表单数据
const form = reactive<MajorForm>({
  majorId: "",
  name: "",
  code: "",
  collegeId: "",
  leader: "",
  educationLevel: EducationLevel.UNDERGRADUATE,
  status: MajorStatus.ACTIVE
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入专业名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入专业代码", trigger: "blur" },
    {
      pattern: /^[A-Z0-9]{4,10}$/,
      message: "专业代码格式不正确",
      trigger: "blur"
    }
  ],
  collegeId: [{ required: true, message: "请选择所属学院", trigger: "change" }],
  leader: [{ max: 100, message: "长度不能超过100个字符", trigger: "blur" }],
  educationLevel: [
    { required: true, message: "请选择学历层次", trigger: "change" }
  ],
  status: [{ required: true, message: "请选择专业状态", trigger: "change" }]
};

// 获取学院列表
const getCollegeOptions = async () => {
  try {
    const res = await getCollegeList({ pageNum: 1, pageSize: 1000 });
    if (res.code === 200 && res.data) {
      collegeOptions.value = res.data.list || [];
    }
  } catch (error) {
    console.error("获取学院列表失败:", error);
  }
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
  getCollegeOptions();
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

// 新增专业
const handleAdd = () => {
  dialogType.value = "add";
  Object.keys(form).forEach(key => {
    if (key === "educationLevel") {
      form[key as keyof MajorForm] = EducationLevel.UNDERGRADUATE;
    } else if (key === "status") {
      form[key as keyof MajorForm] = MajorStatus.ACTIVE;
    } else {
      form[key as keyof MajorForm] = "";
    }
  });
  dialogVisible.value = true;
};

// 编辑专业
const handleEdit = (row: any) => {
  dialogType.value = "edit";
  Object.keys(form).forEach(key => {
    form[key as keyof MajorForm] = row[key] || "";
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
          code: form.code.trim(),
          collegeId: form.collegeId,
          leader: form.leader?.trim() || null,
          educationLevel: form.educationLevel,
          status: form.status
        };

        let res;
        if (dialogType.value === "add") {
          res = await addMajor(formData);
        } else {
          res = await updateMajor({
            ...formData,
            majorId: form.majorId
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
          dialogType.value === "add" ? "新增专业失败:" : "更新专业失败:",
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
    const res = await getMajorList(data);
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
    console.error("获取专业列表失败:", error);
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

// 删除专业
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除专业"${row.name}"吗？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    row.deleteLoading = true;
    const res = await deleteMajor(String(row.majorId));

    if (res.code === 200) {
      ElMessage.success("删除成功");
      getTableData();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除专业失败:", error);
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
@import url("@/style/major.css");
</style>
