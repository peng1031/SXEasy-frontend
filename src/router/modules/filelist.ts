export default {
  path: "/filelist",
  meta: {
    title: "文件列表",
    rank: 5,
    icon: "line-md:file-document"
  },
  children: [
    {
      path: "/filelist",
      name: "FileList",
      component: () => import("@/views/filelist/index.vue"),
      meta: {
        title: "文件列表"
      }
    }
  ]
};
