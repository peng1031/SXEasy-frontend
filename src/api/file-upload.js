import { http } from "@/utils/http";

// 单个上传
export const uploadOneFile = file => {
  const formData = new FormData();
  formData.append("file", file);
  return http.request("post", "/file-upload", {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// 批量上传
export const uploadManyFile = files => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append("files", file);
  });
  return http.request("post", "/file-upload/batch", {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};
