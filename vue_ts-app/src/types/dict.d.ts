/**
 * 字典查询表单类型
 */
declare interface DictQueryForm {
  dict_name?: string;
  status?: 0 | 1;
}
/**
 * 字典增改表单类型
 */
declare interface DictFormData {
  id?: number;
  dict_name: string;
  dict_code: string;
  description: string;
  status: 0 | 1;
}
