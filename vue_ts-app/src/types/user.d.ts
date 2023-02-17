/**
 * 用户查询表单类型
 */
declare interface userQueryParams {
  currentPage: number; // 当前页
  pageSize: number; // 每页条数
  username?: string | undefined;
  status?: '1' | '0' | undefined;
}
/**
 * 用户编辑表单类型
 */
declare interface userEditForm {
  user_id: number;
  action: string;
  username: string;
  old_password: string;
  password: string;
  repassword: string;
  status: '1' | '0';
  role_ids: any[];
}
