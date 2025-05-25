export default {
  path: "/campus",
  meta: {
    title: "校园指南",
    rank: 4,
    icon: "material-symbols:pin-drop-outline-rounded"
  },
  children: [
    {
      path: "/campus",
      name: "Campus",
      icon: "material-symbols:pin-drop-outline-rounded",
      component: () => import("@/views/campus/index.vue"),
      meta: {
        title: "校园指南"
      }
    }
  ]
};
