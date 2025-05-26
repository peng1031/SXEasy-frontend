import { http } from "@/utils/request";

export const getQaList = (data) => {
  return http.request("post", "/qa/list", { data });
};

export const addQa = (data) => {
  return http.request("put", "/qa/add", { data });
};

export const updateQa = (data) => {
  return http.request("post", "/qa/update", { data });
};

export const deleteQa = (id) => {
  return http.request("delete", `/qa/delete/${id}`);
};
