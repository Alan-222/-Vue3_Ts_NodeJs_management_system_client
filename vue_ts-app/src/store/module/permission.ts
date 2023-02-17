import { Module } from 'vuex';
import { constantRoutes } from '@/router';
import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/index.vue';
import { meta, permissionState } from '@/types/store/permission';
import { rootState } from '@/types/store/root';
// 懒加载view文件夹下的vue文件
const modules = import.meta.glob('../../views/**/**.vue');
// 得到后端路由经转换后的路由结构
export function filterAsyncRoutes(routes: any) {
  const res: RouteRecordRaw[] = [];
  // 遍历得到的路由转换为前端router结构
  routes.forEach((route: any) => {
    const component = route.component;
    const tmp: any = {
      path: route.path,
      // 通过import.meta.glob懒加载获取文件模块，注意文件结构！！！
      component: route.component === 'Layout' ? Layout : modules[/* @vite-ignore */ `../../views${component}.vue`],
      redirect: route.redirect || undefined,
      name: route.name,
      meta: {} as meta,
      children: route.children || undefined
    };
    tmp.meta.title = route.title;
    tmp.meta.hidden = !!Number(route.hidden);
    if (route.icon) {
      tmp.meta.icon = route.icon;
    }
    if (tmp.children && tmp.children.length) {
      tmp.children = filterAsyncRoutes(tmp.children);
    }
    res.push(tmp);
  });
  return res;
}
export const permission: Module<permissionState, rootState> = {
  namespaced: true,
  state: (): permissionState => ({
    routes: [],
    addRoutes: []
  }),

  mutations: {
    // 前端的静态路由拼接转换后的路由
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes;
      state.routes = constantRoutes.concat(routes);
    }
  },

  actions: {
    // 生成路由
    generateRoutes({ commit }, menus) {
      return new Promise((resolve) => {
        const accessedRoutes = filterAsyncRoutes(menus);
        commit('SET_ROUTES', accessedRoutes);
        resolve(accessedRoutes);
      });
    }
  }
};
