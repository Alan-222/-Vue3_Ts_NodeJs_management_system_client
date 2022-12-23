/**
 * 用户类型声明
 */
export interface userState {
  token: string | undefined;
  refreshToken: string | undefined;
  roles: Array<string>;
  menus: Array<MenuItem>;
  buttons: Array<string>;
  user_id: number;
  username: string;
  nickname: string;
  email: string;
  user_pic: string;
}
