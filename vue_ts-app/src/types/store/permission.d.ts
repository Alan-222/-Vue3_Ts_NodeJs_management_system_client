/**
 * 权限类型声明
 */
export interface permissionState {
  routes: RouteRecordRaw[];
  addRoutes: RouteRecordRaw[];
}
/**
 * 菜单meta类型
 */
export interface meta {
  hidden?: boolean;
  title: string;
  icon?: string | null;
}
