import { http } from "@/utils/http";

export const getFileList = data => {
  return http.request("post", "/file-upload/list", { data });
};
