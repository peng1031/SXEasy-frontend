import { http } from "@/utils/http";

// 分页请求参数接口
export interface PageReqDo {
  pageNum: number;
  pageSize: number;
  fetchAll?: boolean;
  besc?: boolean;
  sortField?: string;
  operName?: string;
}

// 操作日志响应接口
export interface OperLogVO {
  operId: string;
  title: string;
  businessType: number;
  method: string;
  requestMethod: string;
  operatorType: number;
  operName: string;
  deptName: string;
  operUrl: string;
  operIp: string;
  operLocation: string;
  operParam: string;
  jsonResult: string;
  status: number;
  errorMsg: string;
  operTime: string;
  cost_time: number;
}

// 分页响应接口
export interface PageRespDto<T> {
  list: T[];
  total: number;
}

// API响应接口
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 获取操作日志列表
 * @param params 分页参数
 * @returns 操作日志列表
 */
export const getOperLogList = (params?: PageReqDo) => {
  return http.request("post", "/monitor/operlog/list", { data: params });
};
