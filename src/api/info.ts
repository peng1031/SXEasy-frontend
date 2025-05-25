import { http } from "@/utils/http";

// 专业信息
export interface Major {
  majorId: string;
  name: string;
  code?: string;
  collegeId: string;
  leader?: string;
  educationLevel?: string;
  status?: string;
  description?: string;
}

// 班级信息
export interface ClassEntity {
  classId: string;
  name: string;
  majorId: string;
  gradeYear: number;
  classNo?: string;
  headTeacher?: string;
  status?: string;
  description?: string;
}

// API响应
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 根据学院ID获取专业列表
 * @param collegeId - 学院ID
 */
export const getMajorsByCollege = (collegeId: string) => {
  return http.request<ApiResponse<Major[]>>("get", `/info/major/${collegeId}`);
};

/**
 * 根据专业ID获取班级列表
 * @param majorId - 专业ID
 */
export const getClassesByMajor = (majorId: string) => {
  return http.request<ApiResponse<ClassEntity[]>>(
    "get",
    `/info/class/${majorId}`
  );
};
