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
                <Icon icon="mdi:magnify" />
              </template>
            </el-input>
            <el-button type="primary" @click="handleAdd">
              <Icon icon="mdi:plus" />新增指南
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
          prop="category"
          label="分类"
          width="120"
          align="center"
        />
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
          prop="imageList"
          label="图片"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-image
              v-if="row.imageList && row.imageList.length > 0"
              :src="row.imageList[0]"
              :preview-src-list="row.imageList"
              fit="cover"
              class="preview-image"
            >
              <template #error>
                <div class="image-error">
                  <Icon icon="mdi:image-off" />
                </div>
              </template>
            </el-image>
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" circle @click="handleEdit(row)">
              <Icon icon="mdi:pencil" />
            </el-button>
            <el-button type="success" circle @click="handleView(row)">
              <Icon icon="mdi:eye" />
            </el-button>
            <el-button
              type="danger"
              circle
              :loading="row.deleteLoading"
              @click="handleDelete(row)"
            >
              <Icon icon="mdi:delete" />
            </el-button>
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
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="请输入分类" />
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
        <el-form-item label="图片列表" prop="imageList">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            :auto-upload="false"
            list-type="picture-card"
            :limit="5"
            multiple
          >
            <el-icon><Icon icon="mdi:plus" /></el-icon>
          </el-upload>
          <el-dialog v-model="previewVisible" title="预览">
            <img :src="previewUrl" alt="Preview" style="width: 100%" />
          </el-dialog>
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
          <el-tag size="small" type="info">{{ viewData.category }}</el-tag>
          <span class="view-time">创建时间：{{ viewData.createdTime }}</span>
        </div>
        <div class="view-body">{{ viewData.content }}</div>
        <div
          v-if="viewData.imageList && viewData.imageList.length > 0"
          class="view-images"
        >
          <el-image
            v-for="(image, index) in viewData.imageList"
            :key="index"
            :src="image"
            :preview-src-list="viewData.imageList"
            fit="cover"
            class="view-image"
          >
            <template #error>
              <div class="image-error">
                <Icon icon="mdi:image-off" />
              </div>
            </template>
          </el-image>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Icon } from "@iconify/vue";
import {
  getCampusList,
  addCampus,
  deleteCampus,
  updateCampus
} from "@/api/campus";
import { uploadManyFile } from "@/api/file-upload";
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
  createdTime: "",
  category: "",
  imageList: []
});

// 表单数据
const form = reactive({
  id: "",
  title: "",
  content: "",
  category: "",
  imageList: []
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: "请输入标题", trigger: "blur" },
    { min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur" }
  ],
  category: [
    { required: true, message: "请输入分类", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ],
  content: [
    { required: true, message: "请输入内容", trigger: "blur" },
    { min: 10, max: 2000, message: "长度在 10 到 2000 个字符", trigger: "blur" }
  ],
  imageList: [{ required: false, message: "请输入图片URL", trigger: "blur" }]
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

// 上传相关
const fileList = ref([]);
const previewVisible = ref(false);
const previewUrl = ref("");

// 处理图片预览
const handlePictureCardPreview = file => {
  previewUrl.value = file.url;
  previewVisible.value = true;
};

// 处理图片移除
const handleRemove = (file, fileList) => {
  form.imageList = fileList.map(file => file.url);
};

// 处理文件变化
const handleFileChange = (file, fileList) => {
  fileList.value = fileList;
};

// 处理上传
const handleUpload = async () => {
  try {
    const files = fileList.value.map(file => file.raw);
    const res = await uploadManyFile(files);

    if (res.code === 200) {
      const urls = res.data;
      if (urls && urls.length > 0) {
        // 更新form.imageList
        form.imageList = [...form.imageList, ...urls];
        ElMessage.success("上传成功");
      } else {
        throw new Error("未获取到上传URL");
      }
    } else {
      ElMessage.error(res.msg || "上传失败");
    }
  } catch (error) {
    console.error("上传失败:", error);
    if (error.response?.data) {
      console.error("错误详情:", error.response.data);
      ElMessage.error(error.response.data.msg || "上传失败");
    } else {
      ElMessage.error(error.message || "上传失败");
    }
  }
};

// 上传前校验
const beforeUpload = file => {
  const isImage = file.type.startsWith("image/");
  const isLt100M = file.size / 1024 / 1024 < 100;

  if (!isImage) {
    ElMessage.error("只能上传图片文件！");
    return false;
  }
  if (!isLt100M) {
    ElMessage.error("图片大小不能超过 100MB！");
    return false;
  }
  return true;
};

// 自定义上传
const customUpload = async ({ file, onSuccess, onError }) => {
  try {
    console.log("文件对象:", file);

    if (!file) {
      throw new Error("文件对象无效");
    }

    // 创建FormData对象
    const formData = new FormData();
    formData.append("files", file); // 使用'files'作为参数名，对应后端的MultipartFile[] files

    // 发送请求
    const res = await http.request("post", "/file-upload/batch", {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    if (res.code === 200) {
      // 返回的是URL数组，我们取第一个URL
      const urls = res.data;
      if (urls && urls.length > 0) {
        fileList.value.push({
          name: file.name,
          url: urls[0] // 取第一个URL
        });
        form.imageList = fileList.value.map(file => file.url);
        onSuccess();
        ElMessage.success("上传成功");
      } else {
        throw new Error("未获取到上传URL");
      }
    } else {
      onError(new Error(res.msg || "上传失败"));
      ElMessage.error(res.msg || "上传失败");
    }
  } catch (error) {
    console.error("上传失败:", error);
    onError(error);
    if (error.response?.data) {
      console.error("错误详情:", error.response.data);
      ElMessage.error(error.response.data.msg || "上传失败");
    } else {
      ElMessage.error(error.message || "上传失败");
    }
  }
};

// 新增指南
const handleAdd = () => {
  dialogType.value = "add";
  form.id = "";
  form.title = "";
  form.content = "";
  form.category = "";
  form.imageList = [];
  fileList.value = [];
  dialogVisible.value = true;
};

// 编辑指南
const handleEdit = row => {
  dialogType.value = "edit";
  form.id = row.id;
  form.title = row.title;
  form.content = row.content;
  form.category = row.category;
  form.imageList = row.imageList || []; // 添加默认空数组
  fileList.value = (row.imageList || []).map(url => ({
    name: url.split("/").pop() || url, // 如果split失败，使用完整url
    url: url
  }));
  dialogVisible.value = true;
};

// 查看指南
const handleView = row => {
  viewData.title = row.title;
  viewData.content = row.content;
  viewData.createdTime = row.createdTime;
  viewData.category = row.category;
  viewData.imageList = row.imageList || [];
  viewDialogVisible.value = true;
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 如果有文件需要上传
        if (fileList.value.length > 0) {
          await handleUpload();
        }

        const formData = {
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category.trim(),
          imageList: form.imageList || [] // 确保imageList不为undefined
        };

        let res;
        if (dialogType.value === "add") {
          res = await addCampus(formData);
        } else {
          res = await updateCampus({
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
    console.log("res:", res);
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

    console.log("row:", row);
    const res = await deleteCampus(row.id);

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
