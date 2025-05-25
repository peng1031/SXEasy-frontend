import { http } from "@/utils/http";

// 班级状态枚举
export enum ClassStatus {
  STUDYING = "在读",
  GRADUATED = "毕业",
  SUSPENDED = "停办"
}

// 分页请求参数
interface PageReqDto {
  pageNum: number;
  pageSize: number;
  name?: string;
  majorId?: string;
  gradeYear?: number;
  status?: ClassStatus;
}

// 班级信息（请求体）
interface ClassBO {
  classId?: string;
  name: string;
  majorId: string;
  gradeYear: number;
  classNo?: string | null;
  headTeacher?: string | null;
  status?: ClassStatus;
}

// 班级信息（响应体）
interface ClassVO {
  classId: string;
  name: string;
  majorId: string;
  majorName?: string; // 关联查询时使用
  gradeYear: number;
  classNo?: string;
  headTeacher?: string;
  status: ClassStatus;
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

// 分页响应
interface PageRespDto<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

// API响应
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 获取班级列表（分页）
 * @param data - 分页查询参数
 */
export const getClassList = (data: PageReqDto) => {
  return http.request<ApiResponse<PageRespDto<ClassVO>>>(
    "post",
    "/class/page",
    { data }
  );
};

/**
 * 新增班级
 * @param data - 班级信息
 */
export const addClass = (data: ClassBO) => {
  // 确保可选字段为 null 而不是 undefined
  const requestData = {
    name: data.name,
    majorId: data.majorId,
    gradeYear: data.gradeYear,
    classNo: data.classNo || null,
    headTeacher: data.headTeacher || null,
    status: data.status || ClassStatus.STUDYING
  };
  return http.request<ApiResponse<ClassVO>>("post", "/class/add", {
    data: requestData
  });
};

/**
 * 更新班级信息
 * @param data - 班级信息
 */
export const updateClass = (data: ClassBO) => {
  if (!data.classId) {
    return Promise.reject(new Error("班级ID不能为空"));
  }
  // 确保可选字段为 null 而不是 undefined
  const requestData = {
    name: data.name,
    majorId: data.majorId,
    gradeYear: data.gradeYear,
    classNo: data.classNo,
    headTeacher: data.headTeacher,
    status: data.status
  };
  return http.request<ApiResponse<ClassVO>>(
    "put",
    `/class/update/${data.classId}`,
    { data: requestData }
  );
};

/**
 * 删除班级
 * @param id - 班级ID
 */
export const deleteClass = (id: string) => {
  return http.request<ApiResponse<void>>("delete", `/class/delete/${id}`);
};
