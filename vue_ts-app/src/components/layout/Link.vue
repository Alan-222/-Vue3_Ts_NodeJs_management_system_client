<template>
  <div @click="push">
    <!-- 插槽内置菜单项 -->
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
// 接收到点击的菜单页
const props = defineProps({
  to: {
    type: String,
    required: true
  }
})
// 导入路由
const router = useRouter();
// 路由跳转方法
const push = () => {
  router.push(props.to).catch(err => {
    console.log(err);
  });
};
</script>