import { Module } from 'vuex';
// 导入api
import { userLogin } from '@/utils/API/user/user';
import { getUserInfo } from '@/utils/Api/user/personalCenter';
// 导入重置路由的函数
import { resetRouter } from '@/router';
// 导入操作token的方法
import { getToken, setToken, removeToken, setRefreshToken, removeRefreshToken, getRefreshToken } from '@/utils/auth';
import { ElMessage } from 'element-plus';
// 导入store类型
import { userState } from '@/types/store/user';
import { rootState } from '@/types/store/root';

export const user: Module<userState, rootState> = {
  // 开启命名空间
  namespaced: true,
  state: (): userState => ({
    token: getToken() || '',
    refreshToken: getRefreshToken() || '',
    roles: [],
    menus: [],
    buttons: [],
    user_id: 0,
    username: '',
    nickname: '',
    email: '',
    user_pic: ''
  }),
  // 同步操作函数
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_REFRESHTOKEN: (state, refreshToken) => {
      state.refreshToken = refreshToken;
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles;
    },
    SET_MENUS: (state, menus) => {
      state.menus = menus;
    },
    SET_BUTTONS: (state, buttons) => {
      state.buttons = buttons;
    },
    SET_USERID: (state, user_id) => {
      state.user_id = user_id;
    },
    SET_USERNAME: (state, username) => {
      state.username = username;
    },
    SET_NICKNAME: (state, nickname) => {
      state.nickname = nickname;
    },
    SET_EMAIL: (state, email) => {
      state.email = email;
    },
    SET_USER_PIC: (state, user_pic) => {
      state.user_pic = user_pic;
    }
  },
  // 异步操作函数
  actions: {
    login({ commit }, data) {
      return new Promise((resolve, reject) => {
        userLogin(data)
          .then((res) => {
            commit('SET_TOKEN', res.data.token);
            commit('SET_REFRESHTOKEN', res.data.refreshToken);
            setToken(res.data.token);
            setRefreshToken(res.data.refreshToken);
            ElMessage.success('登录成功');
            resolve(null);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then((res) => {
            const { data } = res;

            if (!data || data.length <= 0) {
              reject('验证失败，请重新登录');
            }
            // 解构后端值
            const { roles, user_id, name, nickname, email, avatar, menus, buttons } = data;

            // 角色数组必须有值
            if (!roles || roles.length <= 0) {
              reject('此用户无分配角色或角色不可用，请重新登录');
            }
            commit('SET_ROLES', roles);
            commit('SET_USERID', user_id);
            commit('SET_USERNAME', name);
            commit('SET_NICKNAME', nickname);
            commit('SET_EMAIL', email);
            commit(
              'SET_USER_PIC',
              avatar ? 'http://127.0.0.1:9999/' + avatar : '/src/assets/avatar/default_avatar.jpg'
            );
            commit('SET_MENUS', menus);
            commit('SET_BUTTONS', buttons);
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 退出登录
    FedLogOut({ commit }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', '');
        commit('SET_REFRESHTOKEN', '');
        commit('SET_ROLES', []);
        commit('SET_MENUS', []);
        commit('SET_BUTTONS', []);
        commit('SET_USERID', -1);
        commit('SET_USERNAME', '');
        commit('SET_NICKNAME', '');
        commit('SET_EMAIL', '');
        commit('SET_USER_PIC', '');
        resetRouter();
        removeToken();
        removeRefreshToken();
        resolve(null);
      });
    },
    // 重置token
    resetToken({ commit }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', '');
        removeToken();
        resolve(null);
      });
    }
  }
};
