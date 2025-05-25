<template>
  <div class="student-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">学生信息管理</span>
          <div class="header-operations">
            <el-input
              v-model="searchQuery"
              placeholder="搜索学生姓名"
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
              <el-icon><Plus /></el-icon>新增学生
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
          prop="studentNumber"
          label="学号"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="name"
          label="姓名"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="gender"
          label="性别"
          min-width="80"
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
          prop="enrollmentYear"
          label="入学年份"
          min-width="100"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="所属班级"
          min-width="120"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.className || "未分配" }}
          </template>
        </el-table-column>
        <el-table-column
          label="所属专业"
          min-width="120"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.major || "未分配" }}
          </template>
        </el-table-column>
        <el-table-column
          label="所属学院"
          min-width="120"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.college || "未分配" }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="学籍状态"
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

    <!-- 新增对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增学生"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="学号" prop="studentNumber">
          <el-input v-model="addForm.studentNumber" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="addForm.gender"
            placeholder="请选择性别"
            style="width: 100%"
          >
            <el-option label="男" :value="Gender.MALE" />
            <el-option label="女" :value="Gender.FEMALE" />
            <el-option label="其他" :value="Gender.OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="addForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="入学年份" prop="enrollmentYear">
          <el-date-picker
            v-model="addForm.enrollmentYear"
            type="year"
            placeholder="请选择入学年份"
            style="width: 100%"
            value-format="YYYY"
          />
        </el-form-item>
        <el-form-item label="所属学院" prop="collegeId">
          <el-select
            v-model="addForm.collegeId"
            placeholder="请选择所属学院"
            style="width: 100%"
            @change="handleCollegeChange"
          >
            <el-option
              v-for="item in collegeOptions"
              :key="item.collegeId"
              :label="item.name"
              :value="item.collegeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业" prop="majorId">
          <el-select
            v-model="addForm.majorId"
            placeholder="请选择所属专业"
            style="width: 100%"
            @change="handleMajorChange"
          >
            <el-option
              v-for="item in majorOptions"
              :key="item.majorId"
              :label="item.name"
              :value="item.majorId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属班级" prop="classId">
          <el-select
            v-model="addForm.classId"
            placeholder="请选择所属班级"
            style="width: 100%"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.name"
              :value="item.classId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学籍状态" prop="status">
          <el-select
            v-model="addForm.status"
            placeholder="请选择学籍状态"
            style="width: 100%"
          >
            <el-option label="在读" :value="StudentStatus.STUDYING" />
            <el-option label="休学" :value="StudentStatus.SUSPENDED" />
            <el-option label="退学" :value="StudentStatus.DROPPED" />
            <el-option label="毕业" :value="StudentStatus.GRADUATED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleAddSubmit"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑学生"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="rules"
        label-width="100px"
        class="dialog-form"
      >
        <el-form-item label="学号" prop="studentNumber">
          <el-input
            v-model="editForm.studentNumber"
            placeholder="请输入学号"
            disabled
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select
            v-model="editForm.gender"
            placeholder="请选择性别"
            style="width: 100%"
          >
            <el-option label="男" :value="Gender.MALE" />
            <el-option label="女" :value="Gender.FEMALE" />
            <el-option label="其他" :value="Gender.OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="入学年份" prop="enrollmentYear">
          <el-date-picker
            v-model="editForm.enrollmentYear"
            type="year"
            placeholder="请选择入学年份"
            style="width: 100%"
            value-format="YYYY"
          />
        </el-form-item>
        <el-form-item label="学籍状态" prop="status">
          <el-select
            v-model="editForm.status"
            placeholder="请选择学籍状态"
            style="width: 100%"
          >
            <el-option label="在读" :value="StudentStatus.STUDYING" />
            <el-option label="休学" :value="StudentStatus.SUSPENDED" />
            <el-option label="退学" :value="StudentStatus.DROPPED" />
            <el-option label="毕业" :value="StudentStatus.GRADUATED" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleEditSubmit"
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
  getStudentList,
  addStudent,
  deleteStudent,
  updateStudent,
  Gender,
  StudentStatus,
  type StudentInfoVO
} from "@/api/student";
import { getCollegeList } from "@/api/college";
import { getMajorsByCollege } from "@/api/info";
import { getClassesByMajor } from "@/api/info";
import type { FormInstance } from "element-plus";

// 类型定义
interface StudentForm {
  studentNumber?: string;
  name: string;
  gender: Gender;
  phone?: string;
  enrollmentYear: number;
  collegeId?: string;
  majorId?: string;
  classId?: string;
  status: StudentStatus;
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

// 选项数据
const collegeOptions = ref([]);
const majorOptions = ref([]);
const classOptions = ref([]);

// 对话框相关
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const addFormRef = ref<FormInstance>();
const editFormRef = ref<FormInstance>();

// 新增表单数据
const addForm = reactive<StudentForm>({
  studentNumber: "",
  name: "",
  gender: Gender.MALE,
  phone: "",
  enrollmentYear: new Date().getFullYear(),
  collegeId: "",
  majorId: "",
  classId: "",
  status: StudentStatus.STUDYING
});

// 编辑表单数据
const editForm = reactive<StudentForm>({
  studentNumber: "",
  name: "",
  gender: Gender.MALE,
  phone: "",
  enrollmentYear: new Date().getFullYear(),
  status: StudentStatus.STUDYING
});

// 表单验证规则
const rules = {
  studentNumber: [
    { required: true, message: "请输入学号", trigger: "blur" },
    {
      pattern: /^[A-Za-z0-9]{4,30}$/,
      message: "学号格式不正确",
      trigger: "blur"
    }
  ],
  name: [
    { required: true, message: "请输入姓名", trigger: "blur" },
    { min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur" }
  ],
  gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ],
  enrollmentYear: [
    { required: true, message: "请选择入学年份", trigger: "change" }
  ],
  collegeId: [{ required: true, message: "请选择所属学院", trigger: "change" }],
  majorId: [{ required: true, message: "请选择所属专业", trigger: "change" }],
  classId: [{ required: true, message: "请选择所属班级", trigger: "change" }],
  status: [{ required: true, message: "请选择学籍状态", trigger: "change" }]
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

// 获取专业列表
const getMajorOptions = async (collegeId: string) => {
  try {
    const res = await getMajorsByCollege(collegeId);
    if (res.code === 200) {
      majorOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取专业列表失败:", error);
  }
};

// 获取班级列表
const getClassOptions = async (majorId: string) => {
  try {
    const res = await getClassesByMajor(majorId);
    if (res.code === 200) {
      classOptions.value = res.data || [];
    }
  } catch (error) {
    console.error("获取班级列表失败:", error);
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

// 新增学生
const handleAdd = () => {
  addForm.studentNumber = "";
  addForm.name = "";
  addForm.gender = Gender.MALE;
  addForm.phone = "";
  addForm.enrollmentYear = new Date().getFullYear();
  addForm.collegeId = "";
  addForm.majorId = "";
  addForm.classId = "";
  addForm.status = StudentStatus.STUDYING;
  addDialogVisible.value = true;
};

// 编辑学生
const handleEdit = (row: StudentInfoVO) => {
  editForm.studentNumber = row.studentNumber;
  editForm.name = row.name;
  editForm.gender = row.gender;
  editForm.phone = row.phone || "";
  editForm.enrollmentYear = row.enrollmentYear;
  editForm.status = row.status;
  editDialogVisible.value = true;
};

// 提交新增表单
const handleAddSubmit = async () => {
  if (!addFormRef.value) return;
  await addFormRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        const formData = {
          studentNumber: addForm.studentNumber,
          name: addForm.name.trim(),
          gender: addForm.gender,
          phone: addForm.phone?.trim() || null,
          enrollmentYear: Number(addForm.enrollmentYear),
          status: addForm.status,
          collegeId: addForm.collegeId,
          majorId: addForm.majorId,
          classId: addForm.classId
        };

        const res = await addStudent(formData);

        if (res.code === 200) {
          ElMessage.success("新增成功");
          addDialogVisible.value = false;
          getTableData();
        } else {
          ElMessage.error(res.msg || "新增失败");
        }
      } catch (error: any) {
        console.error("新增学生失败:", error);
        if (error.response?.data) {
          console.error("错误详情:", error.response.data);
          ElMessage.error(error.response.data.msg || "新增失败");
        } else {
          ElMessage.error("新增失败");
        }
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 提交编辑表单
const handleEditSubmit = async () => {
  if (!editFormRef.value) return;
  await editFormRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        const formData = {
          studentNumber: editForm.studentNumber,
          name: editForm.name.trim(),
          gender: editForm.gender,
          phone: editForm.phone?.trim() || null,
          enrollmentYear: Number(editForm.enrollmentYear),
          status: editForm.status
        };

        const res = await updateStudent(formData);

        if (res.code === 200) {
          ElMessage.success("更新成功");
          editDialogVisible.value = false;
          getTableData();
        } else {
          ElMessage.error(res.msg || "更新失败");
        }
      } catch (error: any) {
        console.error("更新学生失败:", error);
        if (error.response?.data) {
          console.error("错误详情:", error.response.data);
          ElMessage.error(error.response.data.msg || "更新失败");
        } else {
          ElMessage.error("更新失败");
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
    const res = await getStudentList(data);
    if (res.code === 200) {
      if (res.data) {
        console.log("学生列表数据:", res.data.list);
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
    console.error("获取学生列表失败:", error);
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

// 删除学生
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除学生"${row.name}"吗？`, "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });

    row.deleteLoading = true;
    const res = await deleteStudent(String(row.studentNumber));

    if (res.code === 200) {
      ElMessage.success("删除成功");
      getTableData();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除学生失败:", error);
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

// 处理学院选择变化
const handleCollegeChange = async (collegeId: string) => {
  addForm.majorId = "";
  addForm.classId = "";
  majorOptions.value = [];
  classOptions.value = [];
  if (collegeId) {
    await getMajorOptions(collegeId);
  }
};

// 处理专业选择变化
const handleMajorChange = async (majorId: string) => {
  addForm.classId = "";
  classOptions.value = [];
  if (majorId) {
    await getClassOptions(majorId);
  }
};
</script>

<style scoped>
@import url("@/style/student.css");
</style>
