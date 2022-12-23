<template>
  <!-- 如果菜单hidden值为假，即菜单显示 -->
  <div v-if="!item.meta || !item.meta.hidden">
    <!-- 如果菜单无孩子，直接以menu-item单个显示 -->
    <template v-if="
      hasOneShowingChild(item.children, item) &&
      (!onlyOneChild.children || onlyOneChild.noShowingChildren)
    ">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <svg-icon v-if="onlyOneChild.meta && onlyOneChild.meta.icon" :icon-class="onlyOneChild.meta.icon"
            style="margin-right: 10px;" />
          <template #title>
            {{ onlyOneChild.meta.title }}
          </template>
        </el-menu-item>
      </app-link>
    </template>
    <!-- 如果菜单有孩子，以sub-menu的形式显示，且进行递归直到无孩子 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" popper-append-to-body>
      <!-- popper-append-to-body -->
      <template #title>
        <svg-icon v-if="item.meta && item.meta.icon" :icon-class="item.meta.icon" style="margin-right: 10px;">
        </svg-icon>
        <span v-if="item.meta && item.meta.title">{{
            item.meta.title
        }}</span>
      </template>

      <sidebar-item v-for="child in item.children" :key="child.path" :item="child"
        :base-path="resolvePath(child.path)" />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// vite中默认无path模块，需下载导入
import path from 'path-browserify';
import AppLink from './Link.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  basePath: {
    type: String,
    required: true
  }
});

const onlyOneChild = ref();

function hasOneShowingChild(children = [] as any, parent: any) {
  if (!children) {
    children = [];
  }
  const showingChildren = children.filter((item: any) => {
    if (item.meta && item.meta.hidden) {
      return false;
    } else {
      onlyOneChild.value = item;
      return true;
    }
  });

  // 当只有一个孩子时
  if (showingChildren.length === 1) {
    return true;
  }

  // 当没有孩子时
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true };
    return true;
  }

  return false;
}
// 将地址拼接为一个完整的绝对路径
function resolvePath(routePath: string) {
  return path.resolve(props.basePath, routePath);
}
</script>
