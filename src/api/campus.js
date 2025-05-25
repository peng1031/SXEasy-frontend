import { http } from "@/utils/http";

// 分页请求参数
export const getCampusList = data => {
  return http.request("post", "/campus/page", { data });
};

export const addCampus = data => {
  return http.request("post", "/campus/add", { data });
};

export const updateCampus = data => {
  return http.request("put", `/campus/update/${data.campusId}`, { data });
};

export const deleteCampus = campusId => {
  return http.request("delete", `/campus/delete/${campusId}`);
};
