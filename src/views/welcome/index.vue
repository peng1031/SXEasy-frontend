<template>
  <div class="welcome-container">
    <!-- 顶部欢迎区 -->
    <section class="welcome-hero">
      <div class="hero-content">
        <h1 class="hero-title">欢迎使用 U-SPACE</h1>
        <p class="hero-subtitle">让校园生活更简单、更智能</p>
        <div class="stats-list">
          <div class="stat-card">
            <Icon icon="mdi:account-group" width="32" height="32" />
            <div class="stat-info">
              <span class="stat-number">1000+</span>
              <span class="stat-label">活跃用户</span>
            </div>
          </div>
          <div class="stat-card">
            <Icon icon="mdi:cog" width="32" height="32" />
            <div class="stat-info">
              <span class="stat-number">50+</span>
              <span class="stat-label">功能模块</span>
            </div>
          </div>
          <div class="stat-card">
            <Icon icon="mdi:bell" width="32" height="32" />
            <div class="stat-info">
              <span class="stat-number">24/7</span>
              <span class="stat-label">在线服务</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能导航区 -->
    <section class="features-section">
      <div class="features-header">
        <h2 class="features-title">功能导航</h2>
        <p class="features-desc">探索更多便捷功能，提升校园生活体验</p>
      </div>
      <div class="features-list">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
          :style="{ '--feature-color': feature.color }"
          @click="navigateTo(feature.route)"
        >
          <div class="feature-icon">
            <Icon :icon="feature.icon" width="32" height="32" />
          </div>
          <div class="feature-content">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
          <div class="feature-action">
            <Icon icon="mdi:arrow-right" width="24" height="24" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";

defineOptions({
  name: "Welcome"
});

const router = useRouter();

const features = ref([
  {
    title: "课程管理",
    description: "轻松管理您的课程表和学习计划",
    icon: "mdi:calendar",
    route: "/course",
    color: "#409EFF"
  },
  {
    title: "信息日志",
    description: "查看和管理您的信息记录",
    icon: "mdi:file-document",
    route: "/info_log",
    color: "#67C23A"
  },
  {
    title: "个人中心",
    description: "管理您的个人信息和设置",
    icon: "mdi:account",
    route: "/profile",
    color: "#E6A23C"
  },
  {
    title: "通知中心",
    description: "及时获取重要通知和提醒",
    icon: "mdi:bell",
    route: "/notifications",
    color: "#F56C6C"
  },
  {
    title: "校园社区",
    description: "与同学交流互动",
    icon: "mdi:chat",
    route: "/community",
    color: "#909399"
  },
  {
    title: "学习资源",
    description: "获取丰富的学习资料",
    icon: "mdi:book-open-page-variant",
    route: "/resources",
    color: "#9B59B6"
  },
  {
    title: "校园服务",
    description: "便捷的校园生活服务",
    icon: "mdi:school",
    route: "/campus",
    color: "#3498DB"
  },
  {
    title: "系统设置",
    description: "自定义您的使用偏好",
    icon: "wpf:shopping-bag",
    route: "/settings",
    color: "#2C3E50"
  }
]);

const navigateTo = (route: string) => {
  router.push(route);
};
</script>

<style scoped>
@import url("@/style/welcome.css");
</style>
