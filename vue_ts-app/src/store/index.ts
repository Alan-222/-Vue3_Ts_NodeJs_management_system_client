import { createStore, Store, useStore as baseUseStore } from 'vuex';
// 定义类型化的key
import { InjectionKey } from 'vue';
// 导入整体模块的store的类型
import { rootState } from '@/types/store/root';
// 导入模块
import { user } from './module/user';
import { permission } from './module/permission';

// 提供 injection key
export const key: InjectionKey<Store<rootState>> = Symbol();
export const store = createStore<rootState>({
  // 模块
  modules: { user, permission }
});
// 定义自己的useStore组合式函数
export function useStore() {
  return baseUseStore(key);
}
