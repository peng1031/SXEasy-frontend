export default {
  path: "/place",
  meta: {
    title: "地点分类",
    rank: 4,
    icon: "line-md:map-marker-radius"
  },
  children: [
    {
      path: "/place/category",
      name: "PlaceCategory",
      component: () => import("@/views/place/category/index.vue"),
      meta: {
        title: "地点分类"
      }
    },
    {
      path: "/place/build",
      name: "Building",
      component: () => import("@/views/place/build/index.vue"),
      meta: {
        title: "地点汇总"
      }
    }
  ]
};
