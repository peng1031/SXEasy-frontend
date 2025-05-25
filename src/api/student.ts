import { http } from "@/utils/http";

// 性别枚举
export enum Gender {
  MALE = "男",
  FEMALE = "女",
  OTHER = "其他"
}

// 学籍状态枚举
export enum StudentStatus {
  STUDYING = "在读",
  SUSPENDED = "休学",
  DROPPED = "退学",
  GRADUATED = "毕业"
}

// 分页请求参数
interface StudentPageReqDto {
  pageNum: number;
  pageSize: number;
  studentNumber?: string;
  name?: string;
  classId?: string;
  majorId?: string;
  collegeId?: string;
  status?: StudentStatus;
  enrollmentYear?: number;
}

// 学生信息（请求体）
interface StudentBO {
  studentNumber?: string;
  name: string;
  gender: Gender;
  phone?: string | null;
  enrollmentYear: number;
  status?: StudentStatus;
  // 关联信息
  collegeId?: string;
  majorId?: string;
  classId?: string;
}

// 学生信息（响应体）
export interface StudentVO {
  studentId: string;
  studentNumber: string;
  name: string;
  gender: Gender;
  phone?: string;
  enrollmentYear: number;
  status: StudentStatus;
  createdBy?: string;
  createdTime?: string;
  updatedBy?: string;
  updatedTime?: string;
}

// 学生详细信息（响应体）
export interface StudentInfoVO extends StudentVO {
  // 关联信息
  majorId?: string;
  major?: string;
  classId?: string;
  className?: string;
  collegeId?: string;
  college?: string;
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
 * 获取学生列表（分页）
 * @param data - 分页查询参数
 */
export const getStudentList = (data: StudentPageReqDto) => {
  return http.request<ApiResponse<PageRespDto<StudentInfoVO>>>(
    "post",
    "/student/page",
    { data }
  );
};

/**
 * 新增学生
 * @param data - 学生信息
 */
export const addStudent = (data: StudentBO) => {
  // 确保可选字段为 null 而不是 undefined
  const requestData = {
    name: data.name,
    studentNumber: data.studentNumber,
    gender: data.gender,
    phone: data.phone || null,
    enrollmentYear: data.enrollmentYear,
    status: data.status || StudentStatus.STUDYING,
    // 关联信息
    collegeId: data.collegeId,
    majorId: data.majorId,
    classId: data.classId
  };
  return http.request<ApiResponse<StudentVO>>("post", "/student/add", {
    data: requestData
  });
};

/**
 * 更新学生信息
 * @param data - 学生信息
 */
export const updateStudent = (data: StudentBO) => {
  if (!data.studentNumber) {
    return Promise.reject(new Error("学号不能为空"));
  }
  // 确保可选字段为 null 而不是 undefined
  const requestData = {
    studentNumber: data.studentNumber,
    name: data.name,
    gender: data.gender,
    phone: data.phone,
    enrollmentYear: data.enrollmentYear,
    status: data.status
  };
  return http.request<ApiResponse<StudentVO>>("post", "/student/update", {
    data: requestData
  });
};

/**
 * 删除学生
 * @param studentNumber - 学号
 */
export const deleteStudent = (studentNumber: string) => {
  return http.request<ApiResponse<void>>(
    "delete",
    `/student/delete/${studentNumber}`
  );
};
