// API 依赖
import { getDictByName } from '@/utils/api/dict/dict';
import { ElMessage } from 'element-plus';
// 定义下拉框接收的数据格式
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  key?: string;
}

export function dictAssignment(dictCode: string, formatThing: any) {
  let options = [] as SelectOption[];
  // let loading = false;
  /* 调用接口请求数据 */

  // loading = true;
  getDictByName(dictCode).then(
    ({ data }) => {
      // loading = false;
      options = data.map((item: any) => {
        return { label: item.item_text, value: item.item_value };
      });
      /**
       * 若传递过来的是数组，说明要格式化的是某选择类型的表单项例如[{type:'status',children:[]}]
       * 非数组为对象说明格式化的是表格字典配置项例如dict:{status:[]}
       * 再根据类型分别传入字典即可
       *   */
      if (formatThing && formatThing.length) {
        let index = formatThing.findIndex((item: any) => item.prop === dictCode);
        formatThing[index].selectList = options;
      } else {
        formatThing[dictCode] = options;
      }
    },
    (err) => {
      // 未知错误，可能是代码抛出的错误，或是网络错误
      // loading = false;
      options = [
        {
          value: '-1',
          label: err.message
        }
      ];
      ElMessage.error('字典初始化异常');
      // 接着抛出错误
      return Promise.reject(err);
    }
  );
}
