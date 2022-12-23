<template>
  <div class="app-container">
    <!-- header菜单 -->
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" text-color="#ffffff"
      :ellipsis="false">
      <el-menu-item index="1" class="menu-title">
        <el-icon>
          <Tools />
        </el-icon>
        &nbsp后台管理系统
      </el-menu-item>
      <div class="flex-grow"></div>
      <!-- 导航栏右侧用户信息操作区域 -->
      <el-sub-menu index="2">
        <template #title>
          <img :src="store.state.user.user_pic" class="user_icon" />
          <div class="user_name">{{ store.state.user.username }}</div>
        </template>
        <el-menu-item index="2-1" style="color: #3c8dbc;" @click="router.push('/personalCenter')">个人中心</el-menu-item>
        <el-menu-item index="2-2" style="color: #3c8dbc;" @click="dialogFormVisible = true">重置密码</el-menu-item>
        <el-menu-item index="2-3" style="color: #3c8dbc;" @click="logout">退出登录</el-menu-item>
      </el-sub-menu>
    </el-menu>
    <!-- 侧边栏与内容区域 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <el-menu active-text-color="#ffd04b" background-color="#545c64" class="side-menu" :default-active="$route.path"
        text-color="#fff" router>
        <SidebarItem v-for="route in routes" :item="route" :key="route.path" :base-path="route.path" />
      </el-menu>
      <!-- 内容区域 -->
      <div class="main-container">
        <router-view />
      </div>
    </div>
    <el-dialog v-model="dialogFormVisible" width="30%" title="重置密码">
      <reset-password @closeDialog="closeDialog"></reset-password>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Tools,
} from '@element-plus/icons-vue'
import { useStore } from '@/store';
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus';
import ResetPassword from './resetPassword.vue';
import SidebarItem from './SidebarItem.vue';
// 导入vuex模块
const store = useStore()
// 导入router模块
const router = useRouter()
// 获得用户权限菜单
const routes = computed(() => store.state.permission.routes);
// 表单显示标识
const dialogFormVisible = ref(false)
// 高亮的菜单项
const activeIndex = ref('1')
// 退出登录的方法
const logout = () => {
  ElMessageBox.confirm(
    '确定注销并退出系统吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    store.dispatch('user/FedLogOut').then(() => {
      router.replace('/login')
    })
  })
}
// 关闭弹窗方法
const closeDialog = () => {
  dialogFormVisible.value = false
}
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.menu-title {
  font-size: 20px;
}

.flex-grow {
  flex-grow: 1;
}

.el-menu-demo {
  flex: 0 0 58px;
  background-color: #3c8dbc;
}

.user_icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.user_name {
  margin-left: 10px;
}

:deep(.el-menu--horizontal>.el-menu-item.is-active),
:deep(.el-menu--horizontal>.el-sub-menu.is-active .el-sub-menu__title) {
  border-bottom: 2px solid #ffd04b;
}

:deep(.el-menu--horizontal>.el-sub-menu.is-active .el-sub-menu__title),
:deep(.el-menu--horizontal>.el-menu-item.is-active) {
  color: #ffd04b !important;
}

:deep(.el-menu--horizontal>.el-sub-menu .el-sub-menu__title:hover),
:deep(.el-menu--horizontal>.el-menu-item:not(.is-disabled):focus),
:deep(.el-menu--horizontal>.el-menu-item:not(.is-disabled):hover) {
  background-color: #d6d6d6;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: row;
}

.side-menu {
  width: 200px;
  height: 100%;
}

.main-container {
  position: relative;
  margin-left: 3px;
  padding: 36px 24px;
  flex: 1;
  background-color: #efefef;
  overflow: hidden;
}
</style>
