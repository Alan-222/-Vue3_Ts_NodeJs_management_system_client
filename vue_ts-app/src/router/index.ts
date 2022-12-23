import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/index.vue';
// 导入vuex的permission模块
import { store } from '@/store/index';
//静态路由
export const constantRoutes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@/views/home/index.vue'),
        name: 'Home',
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404.vue'),
    meta: { hidden: true }
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401.vue'),
    meta: { hidden: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 })
});

// 重置路由
export function resetRouter() {
  store.state.permission.routes.forEach((route: any) => {
    const name = route.name;
    if (name) {
      router.hasRoute(name) && router.removeRoute(name);
    }
  });
}

export default router;
