import { http } from "@/utils/http";

// 分页请求参数
interface PageReqDto {
  pageNum: number;
  pageSize: number;
  name?: string;
  collegeId?: string;
  status?: MajorStatus;
}

// 学历层次枚举
export enum EducationLevel {
  UNDERGRADUATE = "本科",
  COLLEGE = "专科",
  GRADUATE = "研究生"
}

// 专业状态枚举
export enum MajorStatus {
  ACTIVE = "在办",
  SUSPENDED = "停办",
  PREPARING = "筹建"
}

// 专业信息（请求体）
interface MajorBO {
  majorId?: string;
  name: string;
  code: string;
  collegeId: string;
  leader?: string | null;
  educationLevel?: EducationLevel;
  status?: MajorStatus;
}

// 专业信息（响应体）
interface MajorVO {
  majorId: string;
  name: string;
  code: string;
  collegeId: string;
  collegeName?: string; // 关联查询时使用
  leader?: string;
  educationLevel: EducationLevel;
  status: MajorStatus;
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
 * 获取专业列表（分页）
 * @param data - 分页查询参数
 */
export const getMajorList = (data: PageReqDto) => {
  return http.request<ApiResponse<PageRespDto<MajorVO>>>(
    "post",
    "/major/page",
    { data }
  );
};

/**
 * 新增专业
 * @param data - 专业信息
 */
export const addMajor = (data: MajorBO) => {
  // 确保可选字段为 null 而不是 undefined
  const requestData = {
    name: data.name,
    code: data.code,
    collegeId: data.collegeId,
    leader: data.leader || null,
    educationLevel: data.educationLevel || EducationLevel.UNDERGRADUATE,
    status: data.status || MajorStatus.ACTIVE
  };
  return http.request<ApiResponse<MajorVO>>("post", "/major/add", {
    data: requestData
  });
};

/**
 * 更新专业信息
 * @param data - 专业信息
 */
export const updateMajor = (data: MajorBO) => {
  if (!data.majorId) {
    return Promise.reject(new Error("专业ID不能为空"));
  }
  // 确保可选字段为 null 而不是 undefined
  const requestData = {
    name: data.name,
    code: data.code,
    collegeId: data.collegeId,
    leader: data.leader,
    educationLevel: data.educationLevel,
    status: data.status
  };
  return http.request<ApiResponse<MajorVO>>(
    "put",
    `/major/update/${data.majorId}`,
    { data: requestData }
  );
};

/**
 * 删除专业
 * @param id - 专业ID
 */
export const deleteMajor = (id: string) => {
  return http.request<ApiResponse<void>>("delete", `/major/delete/${id}`);
};
