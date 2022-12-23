import $http from '../../http';

// 获取角色列表
export const listRolePages = (params: RoleQueryParam) => {
  return $http({
    url: '/user/role/listRole',
    method: 'get',
    params: params
  });
};
// 获取所有角色
export const allRole = () => {
  return $http({
    url: '/user/role/allRole',
    method: 'get'
  });
};
// 获取角色资源
export const getRoleResources = (role_id: number) => {
  return $http({
    url: '/user/role/roleResource',
    params: {
      role_id: role_id
    }
  });
};
// 更新角色资源
export const updateRoleResource = (role_id: number, roleResource: RoleResource) => {
  return $http({
    url: '/user/role/updateRoleResource?role_id=' + role_id,
    method: 'post',
    data: roleResource
  });
};

export const addRole = (form: RoleFormData) => {
  return $http({
    url: '/user/role/addRole',
    method: 'post',
    data: form
  });
};

export const updateRole = (role_id: number, form: RoleFormData) => {
  return $http({
    url: '/user/role/editRole?role_id=' + role_id,
    method: 'post',
    data: form
  });
};

export const deleteRoles = (ids: object) => {
  return $http({
    url: '/user/role/delRole',
    method: 'post',
    data: ids
  });
};

// 根据id获取角色数据
export const getRoleFormDetail = (role_id: number) => {
  return $http({
    url: `/user/role/getRole`,
    method: 'get',
    params: {
      role_id: role_id
    }
  });
};
