import Cookies from 'js-cookie';
// 设置token键值
const TokenKey = 'ACCESS-TOKEN';
/**
 * 获取token
 */
export function getToken() {
  return Cookies.get(TokenKey);
}
/**
 * 设置token
 * @param token
 */
export function setToken(token: string) {
  return Cookies.set(TokenKey, token);
}
/**
 * 移除token
 */
export function removeToken() {
  return Cookies.remove(TokenKey);
}
// refreshToken键值
const RefreshTokenKey = 'REFRESH-TOKEN';

export function getRefreshToken() {
  return Cookies.get(RefreshTokenKey);
}

export function setRefreshToken(token: string) {
  return Cookies.set(RefreshTokenKey, token, { expires: 2 });
}

export function removeRefreshToken() {
  return Cookies.remove(RefreshTokenKey);
}
