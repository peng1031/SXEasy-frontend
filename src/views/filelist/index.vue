<template>
  <div class="file-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">文件列表</span>
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
          prop="originalFilename"
          label="文件名"
          min-width="200"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="size"
          label="文件大小"
          min-width="120"
          align="center"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ formatFileSize(Number(row.size)) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="contentType"
          label="文件类型"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createTime"
          label="上传时间"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="platform"
          label="存储平台"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { getFileList } from "@/api/filelist";
import "@/style/filelist.css";

// 类型定义
interface FileItem {
  id: string;
  url: string;
  size: string;
  filename: string;
  originalFilename: string;
  basePath: string;
  path: string;
  ext: string;
  contentType: string;
  platform: string;
  createTime: string;
}

// 加载状态
const loading = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表格数据
const tableData = ref<FileItem[]>([]);

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

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  getTableData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  getTableData();
};

// 文件大小格式化
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + " B";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + " KB";
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }
};

// 获取表格数据
const getTableData = async () => {
  loading.value = true;
  try {
    const res = await getFileList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      fecthAll: false,
      sortField: "create_time",
      desc: true
    });
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
    console.error("获取文件列表失败:", error);
    ElMessage.error("获取数据失败");
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url("@/style/filelist.css");
</style>
