export default {
  path: "/qa",
  meta: {
    title: "问答管理",
    rank: 6,
    icon: "line-md:compass-loop"
  },
  children: [
    {
      path: "/qa",
      name: "Qa",
      component: () => import("@/views/qa/index.vue"),
      meta: {
        title: "问答管理"
      }
    }
  ]
};
