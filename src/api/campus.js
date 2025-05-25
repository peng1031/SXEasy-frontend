import { http } from "@/utils/http";

// 分页请求参数
export const getCampusList = data => {
  return http.request("post", "/campus/guide/list", { data });
};

export const addCampus = data => {
  return http.request("post", "/campus/guide/add", { data });
};

export const updateCampus = data => {
  return http.request("put", `/campus/guide/update/${data.id}`, { data });
};

export const deleteCampus = campusId => {
  return http.request("delete", `/campus/guide/delete/${campusId}`);
};
