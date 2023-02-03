/**
 * 表格对象属性
 */
export interface tableColumn {
  /**
   * 属性值
   */
  prop: string;
  /**
   * 标签值
   */
  label: string;
  /**
   * 对齐方向
   */
  align?: string;
  /**
   * 提示信息
   */
  ellipsis?: boolean;
  /**
   * 插槽
   */
  slot?: boolean;
  /**
   * 格式化方法
   */
  format?: Function;
  /**
   * 字典对象
   */
  dictCode?: string;
}

/**
 * 接口返回类型
 */
export interface ResultType {
  code: number;
  message: string;
  data: any;
}
/**
 * 行数据的Key
 */
export type rowKey = string | ((row: any) => string) | undefined;
/**
 * 当前行是否可选择
 */
export type selectable = ((row: any, index?: number) => boolean) | undefined;
