export default {
  path: "/info_log",
  meta: {
    title: "日志",
    rank: 1000,
    icon: "line-md:file-document"
  },
  children: [
    {
      path: "/info_log",
      name: "InfoLog",
      component: () => import("@/views/info_log/index.vue"),
      meta: {
        title: "日志管理"
      }
    }
  ]
};
