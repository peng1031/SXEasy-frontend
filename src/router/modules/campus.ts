export default {
  path: "/campus",
  meta: {
    title: "校园指南",
    rank: 4,
    icon: "line-md:compass-loop"
  },
  children: [
    {
      path: "/campus",
      name: "Campus",
      component: () => import("@/views/campus/index.vue"),
      meta: {
        title: "校园指南"
      }
    }
  ]
};
