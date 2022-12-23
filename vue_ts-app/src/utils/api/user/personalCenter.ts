import $http from '../../http';

export const getUserInfo = () => {
  return $http({
    url: '/user/myInfo/userinfo',
    method: 'get'
  });
};
export const updateUserInfo = (userinfo: userinfoForm) => {
  return $http({
    url: '/user/myInfo/userinfo',
    method: 'post',
    data: userinfo
  });
};
