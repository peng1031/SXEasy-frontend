<template>
  <div class="building-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">建筑物管理</span>
            <el-tag type="success" class="total-tag"
              >共 {{ total }} 条数据</el-tag
            >
          </div>
          <div class="header-operations">
            <el-input
              v-model="searchForm.name"
              placeholder="搜索建筑物名称"
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
              <Icon icon="mdi:plus" />新增建筑物
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
          prop="name"
          label="建筑物名称"
          min-width="200"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{
              row.name
            }}</el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="aliases"
          label="别名"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="categoryName"
          label="分类"
          width="120"
          align="center"
        />
        <el-table-column
          prop="description"
          label="描述"
          min-width="300"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="content-preview">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="img" label="主图" width="120" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.img"
              :src="row.img"
              :preview-src-list="[row.img]"
              :initial-index="0"
              fit="cover"
              class="preview-image"
              :preview-teleported="true"
              :hide-on-click-modal="false"
              :z-index="3000"
              :preview-scale="0.75"
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
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
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
      :title="dialogType === 'add' ? '新增建筑物' : '编辑建筑物'"
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
        <el-form-item label="建筑物名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入建筑物名称" />
        </el-form-item>
        <el-form-item label="别名" prop="aliases">
          <el-input v-model="form.aliases" placeholder="请输入别名" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主图" prop="img">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeMainImageUpload"
            :http-request="handleMainImageUpload"
          >
            <el-image
              v-if="form.img"
              :src="form.img"
              class="avatar"
              :preview-src-list="[form.img]"
              :initial-index="0"
              :preview-teleported="true"
            />
            <el-icon v-else class="avatar-uploader-icon"
              ><Icon icon="mdi:plus"
            /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="图片集" prop="images">
          <el-upload
            class="image-uploader"
            :file-list="imageList"
            list-type="picture-card"
            :before-upload="beforeImagesUpload"
            :http-request="handleImagesUpload"
            :on-remove="handleImageRemove"
            :limit="5"
          >
            <el-icon><Icon icon="mdi:plus" /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
            resize="none"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number
                v-model="form.latitude"
                :precision="7"
                :step="0.0000001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number
                v-model="form.longitude"
                :precision="7"
                :step="0.0000001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
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
      title="查看建筑物"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="view-content">
        <h2 class="view-title">{{ viewData.name }}</h2>
        <div class="view-info">
          <el-tag size="small" type="info">{{ viewData.categoryName }}</el-tag>
          <span class="view-time">创建时间：{{ viewData.createTime }}</span>
        </div>
        <div class="view-body">{{ viewData.description }}</div>
        <div v-if="viewData.img" class="view-main-image">
          <el-image
            :src="viewData.img"
            :preview-src-list="[viewData.img]"
            fit="cover"
            class="view-image"
            :preview-teleported="true"
            :hide-on-click-modal="false"
            :z-index="3000"
            :preview-scale="0.8"
          >
            <template #error>
              <div class="image-error">
                <Icon icon="mdi:image-off" />
              </div>
            </template>
          </el-image>
        </div>
        <div
          v-if="viewData.images && viewData.images.length > 0"
          class="view-images"
        >
          <el-image
            v-for="(image, index) in viewData.images"
            :key="index"
            :src="image"
            :preview-src-list="viewData.images"
            :initial-index="index"
            fit="cover"
            class="view-image"
            :preview-teleported="true"
            :hide-on-click-modal="false"
            :z-index="3000"
            :preview-scale="0.8"
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

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Icon } from "@iconify/vue";
import {
  getBulidingList,
  addBuilding,
  updateBuilding,
  deleteBuilding,
  getPlaceCategoryList
} from "@/api/placecategory";
import { uploadOneFile, uploadManyFile } from "@/api/file-upload";
import type { UploadProps, UploadUserFile } from "element-plus";

// 搜索相关
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
const dialogType = ref<"add" | "edit">("add");
const formRef = ref();

// 查看数据
const viewData = reactive({
  name: "",
  description: "",
  createTime: "",
  categoryName: "",
  img: "",
  images: []
});

// 搜索表单
const searchForm = reactive({
  name: "",
  categoryId: ""
});

// 表单数据
const form = reactive({
  id: "",
  name: "",
  aliases: "",
  img: "",
  images: [] as string[],
  description: "",
  latitude: 0,
  longitude: 0,
  categoryId: "",
  categoryName: ""
});

// 图片上传相关
const imageList = ref<UploadUserFile[]>([]);

// 分类选项
const categoryOptions = ref([]);

// 表单验证规则
const rules = {
  name: [
    { required: true, message: "请输入建筑物名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
  ],
  categoryId: [{ required: true, message: "请选择分类", trigger: "change" }],
  description: [
    { required: true, message: "请输入描述", trigger: "blur" },
    { min: 2, max: 500, message: "长度在 2 到 500 个字符", trigger: "blur" }
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
  getList();
  getCategoryList();
});

onUnmounted(() => {
  window.removeEventListener("resize", calculateTableHeight);
});

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  getList();
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  getList();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getList();
};

// 主图上传前的验证
const beforeMainImageUpload: UploadProps["beforeUpload"] = file => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("只能上传图片文件！");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB！");
    return false;
  }
  return true;
};

// 主图上传处理
const handleMainImageUpload = async (options: any) => {
  try {
    const res = await uploadOneFile(options.file);
    if (res.code === 200) {
      form.img = res.data;
      ElMessage.success("上传成功");
    }
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error("上传失败");
  }
};

// 图片集上传前的验证
const beforeImagesUpload: UploadProps["beforeUpload"] = file => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("只能上传图片文件！");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB！");
    return false;
  }
  return true;
};

// 图片集上传处理
const handleImagesUpload = async (options: any) => {
  try {
    const res = await uploadOneFile(options.file);
    if (res.code === 200) {
      form.images.push(res.data);
      imageList.value.push({
        name: options.file.name,
        url: res.data
      });
      ElMessage.success("上传成功");
    }
  } catch (error) {
    console.error("上传失败:", error);
    ElMessage.error("上传失败");
  }
};

// 移除图片
const handleImageRemove = (file: UploadUserFile) => {
  const index = imageList.value.findIndex(item => item.url === file.url);
  if (index > -1) {
    form.images.splice(index, 1);
    imageList.value.splice(index, 1);
  }
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  try {
    const res = await getBulidingList({
      page: currentPage.value,
      pageSize: pageSize.value,
      sortField: "create_time",
      desc: true,
      ...searchForm
    });
    if (res.code === 200) {
      tableData.value = res.data.list;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error("获取建筑物列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 获取分类列表
const getCategoryList = async () => {
  try {
    const res = await getPlaceCategoryList();
    if (res.code === 200) {
      categoryOptions.value = res.data.list;
    }
  } catch (error) {
    console.error("获取分类列表失败:", error);
  }
};

// 新增
const handleAdd = () => {
  dialogType.value = "add";
  resetForm();
  dialogVisible.value = true;
};

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = "edit";
  Object.assign(form, {
    ...row,
    images: Array.isArray(row.images) ? row.images : []
  });
  imageList.value = form.images.map((url: string, index: number) => ({
    name: `图片${index + 1}`,
    url
  }));
  dialogVisible.value = true;
};

// 查看
const handleView = (row: any) => {
  Object.assign(viewData, {
    name: row.name,
    description: row.description,
    createTime: row.createTime,
    categoryName: row.categoryName,
    img: row.img,
    images: Array.isArray(row.images) ? row.images : []
  });
  viewDialogVisible.value = true;
};

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除建筑物"${row.name}"吗？`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    row.deleteLoading = true;
    const res = await deleteBuilding(row.id);

    if (res.code === 200) {
      ElMessage.success("删除成功");
      getList();
    } else {
      ElMessage.error(res.msg || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除建筑物失败:", error);
      ElMessage.error("删除失败");
    }
  } finally {
    row.deleteLoading = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true;
      try {
        const api = dialogType.value === "add" ? addBuilding : updateBuilding;
        const res = await api(form);
        if (res.code === 200) {
          ElMessage.success(
            dialogType.value === "add" ? "新增成功" : "编辑成功"
          );
          dialogVisible.value = false;
          getList();
        } else {
          ElMessage.error(
            res.msg || (dialogType.value === "add" ? "新增失败" : "编辑失败")
          );
        }
      } catch (error) {
        console.error("操作失败:", error);
        ElMessage.error(dialogType.value === "add" ? "新增失败" : "编辑失败");
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  form.id = "";
  form.name = "";
  form.aliases = "";
  form.img = "";
  form.images = [];
  form.description = "";
  form.latitude = 0;
  form.longitude = 0;
  form.categoryId = "";
  form.categoryName = "";
  imageList.value = [];
};
</script>

<style scoped>
.building-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.total-tag {
  font-size: 13px;
}

.header-operations {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 240px;
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
}

.content-preview {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 20px;
}

.dialog-form {
  padding: 20px 0;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
}

.image-uploader {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item-thumbnail) {
    object-fit: cover;
  }
}

.view-content {
  padding: 20px;
}

.view-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.view-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.view-time {
  color: #909399;
  font-size: 13px;
}

.view-body {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #606266;
}

.view-main-image {
  margin-bottom: 20px;
}

.view-image {
  width: 200px;
  height: 200px;
  border-radius: 4px;
  margin-right: 12px;
  margin-bottom: 12px;
}

.view-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

:deep(.even-row) {
  background-color: #fafafa;
}

:deep(.odd-row) {
  background-color: #ffffff;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}
</style>
