/**
 * 字典项表单类型
 */
declare interface DictItemFormData {
  id?: number;
  dict_id: number;
  dict_name: string;
  item_text: string;
  item_value: number;
  description: string;
  sort_order: number;
  status: 0 | 1;
}
