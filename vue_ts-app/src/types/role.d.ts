/**
 * 角色查询参数类型
 */
declare interface RoleQueryParam {
  role_name?: string;
  currentPage: number;
  pageSize: number;
}

/**
 * 角色分页列表项
 */
declare interface RoleItem {
  type?: string;
  role_id: number;
  role_name: string;
  remark: string;
  status: '1' | '0';
  create_time: string;
  update_time: string | undefined;
}

/**
 * 角色表单类型
 */
declare interface RoleFormData {
  role_id: number | undefined;
  role_name: string;
  remark: string;
  status: '1' | '0';
}

/**
 * 角色菜单项类型
 */
declare interface buttons {
  menu_id: number;
  btns: string[];
}

declare interface RoleResource {
  menu_ids: number[];
}

declare interface menuOptionsItem {
  label: string;
  value: number;
  children: Array | undefined;
  perms: Array | undefined;
  buttons: Array | undefined;
}
declare type menuOptions = Array<menuOptionsItem>;
