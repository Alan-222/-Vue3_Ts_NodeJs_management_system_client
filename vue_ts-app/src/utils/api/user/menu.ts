import $http from '../../http';

// 获取角色列表
export const listMenus = (params: MenuQueryParam) => {
  return $http({
    url: '/user/menu/listMenu',
    method: 'get',
    params: params
  });
};
// 获取子集列表
export const listMenuOptions = () => {
  return $http({
    url: '/user/menu/listMenuOptions',
    method: 'get'
  });
};
export const addMenu = (form: MenuFormData) => {
  return $http({
    url: '/user/menu/addMenu',
    method: 'post',
    data: form
  });
};

export const updateMenu = (menu_id: number, form: MenuFormData) => {
  return $http({
    url: '/user/menu/editMenu?menu_id=' + menu_id,
    method: 'post',
    data: form
  });
};

export const deleteMenus = (menu_id: object) => {
  return $http({
    url: '/user/menu/delMenu',
    method: 'post',
    data: menu_id
  });
};

// 根据id获取角色数据
export const getMenuDetail = (menu_id: number) => {
  return $http({
    url: '/user/menu/getMenu',
    method: 'get',
    params: {
      menu_id: menu_id
    }
  });
};
