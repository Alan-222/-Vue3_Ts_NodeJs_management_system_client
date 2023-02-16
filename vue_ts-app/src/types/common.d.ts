/**
 * 弹窗类型
 */
declare interface Dialog {
  title: string;
  visible: boolean;
}

/**
 * 通用组件选择项类型
 */
declare interface Option {
  value: string;
  label: string;
  checked?: boolean;
  children?: Option[];
}

/**
 * 通用表单配置项类型
 */
declare interface formOption {
  type: string;
  value?: any;
  prop: string;
  label?: string;
  placeholder?: string;
  rules?: Array<Object>;
  selectList?: Array<any>;
  listValue?: string;
  listLabel?: string;
  show?: Array<string>;
  attrs?: Object;
}
