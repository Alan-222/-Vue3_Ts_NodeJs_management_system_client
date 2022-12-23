<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>
<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const locale = zhCn;
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}
</style>
