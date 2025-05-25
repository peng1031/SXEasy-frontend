<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { Search, View } from "@element-plus/icons-vue";
import {
  getOperLogList,
  type OperLogVO,
  type PageReqDo,
  type ApiResponse,
  type PageRespDto
} from "@/api/info_log";

// 搜索相关
const searchQuery = ref("");
const loading = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表格数据
const tableData = ref<OperLogVO[]>([]);

// 对话框相关
const dialogVisible = ref(false);
const currentRow = ref<OperLogVO>({} as OperLogVO);

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

// 查看详情
const handleView = (row: OperLogVO) => {
  currentRow.value = row;
  dialogVisible.value = true;
};

// 格式化JSON
const formatJson = (json: string) => {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch (e) {
    return json;
  }
};

// 排序相关
const sortBy = ref("");
const sortOrder = ref("");

// 处理排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortBy.value = prop;
  sortOrder.value = order;
  getTableData();
};

// 获取表格数据
const getTableData = async () => {
  loading.value = true;
  try {
    // Convert camelCase to snake_case
    const sortField = sortBy.value
      ? sortBy.value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      : "oper_time";

    const params: PageReqDo = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      fetchAll: false,
      sortField: sortField,
      desc:
        sortOrder.value === "ascending"
          ? false
          : sortOrder.value === "descending"
            ? true
            : undefined
    };
    const res = (await getOperLogList(params)) as ApiResponse<
      PageRespDto<OperLogVO>
    >;
    if (res.code === 200) {
      if (res.data) {
        console.log(res.data);
        tableData.value = res.data.list || [];
        total.value = res.data.total || 0;
        // 如果当前页没有数据且不是第一页，则跳转到第一页
        if (tableData.value.length === 0 && currentPage.value > 1) {
          currentPage.value = 1;
          getTableData();
        }
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
    console.error("获取操作日志列表失败:", error);
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
</script>

<template>
  <div class="info-log-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">操作日志</span>
          <div class="header-operations">
            <el-input
              v-model="searchQuery"
              placeholder="搜索操作人员"
              class="search-input"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
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
        @sort-change="handleSortChange"
      >
        <el-table-column
          prop="operName"
          label="操作人员"
          min-width="100"
          align="center"
          show-overflow-tooltip
          sortable
        />
        <el-table-column
          prop="title"
          label="操作模块"
          min-width="120"
          align="center"
          show-overflow-tooltip
          sortable
        />
        <el-table-column
          prop="businessType"
          label="操作类型"
          min-width="100"
          align="center"
          show-overflow-tooltip
          sortable
        />
        <el-table-column
          prop="requestMethod"
          label="请求方式"
          min-width="100"
          align="center"
          show-overflow-tooltip
          sortable
        />
        <el-table-column
          prop="operUrl"
          label="请求地址"
          min-width="180"
          align="center"
          show-overflow-tooltip
          sortable
        />
        <el-table-column
          prop="operIp"
          label="操作地址"
          min-width="120"
          align="center"
          show-overflow-tooltip
          sortable
        />
        <el-table-column
          prop="status"
          label="操作状态"
          min-width="100"
          align="center"
          show-overflow-tooltip
          sortable
        >
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="operTime"
          label="操作时间"
          min-width="160"
          align="center"
          show-overflow-tooltip
          sortable
        />
        <el-table-column
          prop="costTime"
          label="耗时(ms)"
          min-width="100"
          align="center"
          show-overflow-tooltip
          sortable
        />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              :icon="View"
              circle
              @click="handleView(row)"
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

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="操作日志详情"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作人员" :span="2">
          {{ currentRow.operName }}
        </el-descriptions-item>
        <el-descriptions-item label="操作模块" :span="2">
          {{ currentRow.title }}
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          {{ currentRow.businessType }}
        </el-descriptions-item>
        <el-descriptions-item label="请求方式">
          {{ currentRow.requestMethod }}
        </el-descriptions-item>
        <el-descriptions-item label="请求地址" :span="2">
          {{ currentRow.operUrl }}
        </el-descriptions-item>
        <el-descriptions-item label="操作地址" :span="2">
          {{ currentRow.operIp }}
        </el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="currentRow.status === 0 ? 'success' : 'danger'">
            {{ currentRow.status === 0 ? "成功" : "失败" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">
          {{ currentRow.operTime }}
        </el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre>{{ formatJson(currentRow.operParam) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">
          <pre>{{ formatJson(currentRow.jsonResult) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="currentRow.errorMsg"
          label="错误信息"
          :span="2"
        >
          <pre class="error-msg">{{ currentRow.errorMsg }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<style scoped>
@import url("@/style/info_log.css");
</style>
