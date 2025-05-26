import { http } from "@/utils/http";

// 地点分类列表
export const getPlaceCategoryList = () => {
  return http.request("post", "/place/category/list", {
    data: {
      page: 1,
      pageSize: 1000,
      fetchAll: false,
      sortField: "create_time",
      desc: true
    }
  });
};

// 添加地点分类
export const addPlaceCategory = data => {
  return http.request("post", "/place/category/add", { data });
};

// 更新地点分类
export const updatePlaceCategory = data => {
  return http.request("put", `/place/category/${data.id}`, { data });
};

// 删除地点分类
export const deletePlaceCategory = id => {
  return http.request("delete", `/place/category/${id}`);
};

// 获取建筑物列表
export const getBulidingList = data => {
  return http.request("post", "/campus/build/list", { data });
};

// 添加建筑物
export const addBuilding = data => {
  return http.request("post", "/campus/build/add", { data });
};

// 更新建筑物
export const updateBuilding = data => {
  return http.request("put", `/campus/build/update/${data.id}`, { data });
};

// 删除建筑物
export const deleteBuilding = id => {
  return http.request("delete", `/campus/build/delete/${id}`);
};
