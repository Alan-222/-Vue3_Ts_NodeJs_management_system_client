<template>
  <div class="content-container">
    <L-form ref="form" label-width="100px" :options='options' :formData="formData" :formConfig="formConfig"
      @on-change="handleChange" @before-upload="handleBeforeUpload" @on-preview="handlePreview"
      @on-remove="handleRemove" @before-remove="beforeRemove" @on-success="handleSuccess" @on-exceed="handleExceed">
      <template #uploadArea>
        <el-button type="primary" size="small">点击上传</el-button>
      </template>
      <template #uploadTip>
        <div style="color:#ccc;font-size:12px;margin-left: 10px;">
          支持 jpg/png 文件尺寸小于500kb.
        </div>
      </template>
      <template #action="scope">
        <el-button type="primary" @click="submitForm(scope)">提 交</el-button>
        <el-button @click='resetForm'>重 置</el-button>
      </template>
    </L-form>
  </div>
</template>

<script lang="ts" setup>
import { FormOptions, FormInstance } from '@/components/form/src/types/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref } from 'vue'

let form = ref()

interface Scope {
  form: FormInstance,
  model: any,
}
let formData = ref({
  username: '',
  password: '',
  role: '',
  like: [],
  gender: '',
  pic: '',
  area: '',
  date: '',
  date1: '',
  desc: ''
})
let options: FormOptions[] = [
  {
    type: 'input',
    value: '',
    label: '用户名',
    prop: 'username',
    placeholder: "请输入用户名",
    rules: [
      {
        required: true,
        message: '用户名不能为空',
        trigger: 'blur'
      },
      {
        min: 2,
        max: 6,
        message: '用户名在2-6位置之间',
        trigger: 'blur'
      }
    ],
    attrs: {
      clearable: true,
    }
  },
  {
    type: 'input',
    value: '',
    label: '密码',
    prop: 'password',
    rules: [
      {
        required: true,
        message: '密码不能为空',
        trigger: 'blur'
      },
      {
        min: 6,
        max: 10,
        message: '密码长度6-10位置之间',
        trigger: 'blur'
      }
    ],
    attrs: {
      showPassword: true,
      clearable: true
    }
  },
  {
    type: 'select',
    value: '0',
    placeholder: '请选择职位',
    prop: 'role',
    label: '职位',
    attrs: {
      style: {
        width: '100%',
      },
    },
    rules: [
      {
        required: true,
        message: '职位不能为空',
        trigger: 'blur'
      }
    ],
    children: [
      {
        type: 'option',
        label: '经理',
        value: '1'
      },
      {
        type: 'option',
        label: '主管',
        value: '2'
      },
      {
        type: 'option',
        label: '销售',
        value: '3'
      }
    ]
  },
  {
    type: 'checkbox-group',
    value: [],
    prop: 'like',
    label: '爱好',
    rules: [
      {
        required: true,
        message: '爱好不能为空',
        trigger: 'blur'
      }
    ],
    children: [
      {
        type: 'checkbox',
        label: '足球',
        value: '1'
      },
      {
        type: 'checkbox',
        label: '篮球',
        value: '2'
      },
      {
        type: 'checkbox',
        label: '排球',
        value: '3'
      }
    ]
  },
  {
    type: 'radio-group',
    value: '',
    prop: 'gender',
    label: '性别',
    rules: [
      {
        required: true,
        message: '性别不能为空',
        trigger: 'blur'
      }
    ],
    children: [
      {
        type: 'radio',
        label: '男',
        value: '1'
      },
      {
        type: 'radio',
        label: '女',
        value: '2'
      },
      {
        type: 'radio',
        label: '保密',
        value: '3'
      }
    ]
  },
  {
    type: 'upload',
    label: '上传',
    prop: 'pic',
    colCount: 1,
    uploadAttrs: {
      action: 'https://jsonplaceholder.typicode.com/posts/',
      multiple: true,
      limit: 3
    },
    rules: [
      {
        required: true,
        message: '哈哈哈',
        trigger: 'blur'
      }
    ]
  },
  {
    type: "cascader",
    value: '',
    prop: "area",
    label: "UI导航",
    attrs: {
      options: [
        {
          value: 'guide',
          label: 'Guide',
          children: [
            {
              value: 'disciplines',
              label: 'Disciplines',
              children: [
                {
                  value: 'consistency',
                  label: 'Consistency',
                },
                {
                  value: 'feedback',
                  label: 'Feedback',
                },
                {
                  value: 'efficiency',
                  label: 'Efficiency',
                },
                {
                  value: 'controllability',
                  label: 'Controllability',
                },
              ],
            },
            {
              value: 'navigation',
              label: 'Navigation',
              children: [
                {
                  value: 'side nav',
                  label: 'Side Navigation',
                },
                {
                  value: 'top nav',
                  label: 'Top Navigation',
                },
              ],
            },
          ],
        },
        {
          value: 'component',
          label: 'Component',
          children: [
            {
              value: 'basic',
              label: 'Basic',
              children: [
                {
                  value: 'layout',
                  label: 'Layout',
                },
                {
                  value: 'color',
                  label: 'Color',
                },
                {
                  value: 'typography',
                  label: 'Typography',
                },
                {
                  value: 'icon',
                  label: 'Icon',
                },
                {
                  value: 'button',
                  label: 'Button',
                },
              ],
            },
            {
              value: 'form',
              label: 'Form',
              children: [
                {
                  value: 'radio',
                  label: 'Radio',
                },
                {
                  value: 'checkbox',
                  label: 'Checkbox',
                },
                {
                  value: 'input',
                  label: 'Input',
                },
                {
                  value: 'input-number',
                  label: 'InputNumber',
                },
                {
                  value: 'select',
                  label: 'Select',
                },
                {
                  value: 'cascader',
                  label: 'Cascader',
                },
                {
                  value: 'switch',
                  label: 'Switch',
                },
                {
                  value: 'slider',
                  label: 'Slider',
                },
                {
                  value: 'time-picker',
                  label: 'TimePicker',
                },
                {
                  value: 'date-picker',
                  label: 'DatePicker',
                },
                {
                  value: 'datetime-picker',
                  label: 'DateTimePicker',
                },
                {
                  value: 'upload',
                  label: 'Upload',
                },
                {
                  value: 'rate',
                  label: 'Rate',
                },
                {
                  value: 'form',
                  label: 'Form',
                },
              ],
            },
            {
              value: 'data',
              label: 'Data',
              children: [
                {
                  value: 'table',
                  label: 'Table',
                },
                {
                  value: 'tag',
                  label: 'Tag',
                },
                {
                  value: 'progress',
                  label: 'Progress',
                },
                {
                  value: 'tree',
                  label: 'Tree',
                },
                {
                  value: 'pagination',
                  label: 'Pagination',
                },
                {
                  value: 'badge',
                  label: 'Badge',
                },
              ],
            },
            {
              value: 'notice',
              label: 'Notice',
              children: [
                {
                  value: 'alert',
                  label: 'Alert',
                },
                {
                  value: 'loading',
                  label: 'Loading',
                },
                {
                  value: 'message',
                  label: 'Message',
                },
                {
                  value: 'message-box',
                  label: 'MessageBox',
                },
                {
                  value: 'notification',
                  label: 'Notification',
                },
              ],
            },
            {
              value: 'navigation',
              label: 'Navigation',
              children: [
                {
                  value: 'menu',
                  label: 'Menu',
                },
                {
                  value: 'tabs',
                  label: 'Tabs',
                },
                {
                  value: 'breadcrumb',
                  label: 'Breadcrumb',
                },
                {
                  value: 'dropdown',
                  label: 'Dropdown',
                },
                {
                  value: 'steps',
                  label: 'Steps',
                },
              ],
            },
            {
              value: 'others',
              label: 'Others',
              children: [
                {
                  value: 'dialog',
                  label: 'Dialog',
                },
                {
                  value: 'tooltip',
                  label: 'Tooltip',
                },
                {
                  value: 'popover',
                  label: 'Popover',
                },
                {
                  value: 'card',
                  label: 'Card',
                },
                {
                  value: 'carousel',
                  label: 'Carousel',
                },
                {
                  value: 'collapse',
                  label: 'Collapse',
                },
              ],
            },
          ],
        },
        {
          value: 'resource',
          label: 'Resource',
          children: [
            {
              value: 'axure',
              label: 'Axure Components',
            },
            {
              value: 'sketch',
              label: 'Sketch Templates',
            },
            {
              value: 'docs',
              label: 'Design Documentation',
            },
          ],
        },
      ]
    },
    rules: [
      {
        required: true,
        message: '请选择一个导航项',
        trigger: 'blur'
      },
    ]
  },
  {
    type: "date-picker",
    value: '',
    prop: "date",
    label: "日期",
    placeholder: "请选择日期",
    attrs: {
      type: "dates"
    }
  },
  {
    type: "date-picker",
    value: '',
    prop: "date1",
    label: "日期范围",
    placeholder: "请选择日期范围",
    attrs: {
      type: "daterange",
      'range-separator': "To",
      'start-placeholder': "Start date",
      'end-placeholder': "End date",
    }
  },
  {
    type: 'editor',
    value: '',
    prop: 'desc',
    colCount: 1,
    placeholder: '请输入内容',
    label: '描述',
    rules: [
      {
        required: true,
        message: '描述不能为空',
      }
    ]
  }
]

let formConfig = ref({
  colSpan: 12
})
let submitForm = (scope: Scope) => {
  scope.form.validate((valid) => {
    if (valid) {
      console.log(scope.model);
      ElMessage.success('提交成功')
      // resetForm()
    } else {
      ElMessage.error('表单填写错误')
    }
  });
}

let resetForm = () => {
  console.log('重置');
  form.value.resetFields()
}

let handleRemove = (file: any, fileList: any) => {
  console.log('handleRemove')
  console.log(file, fileList)
}

let handlePreview = (file: any) => {
  console.log('handlePreview')
  console.log(file)
}

let beforeRemove = (val: any) => {
  console.log('beforeRemove')
  return ElMessageBox.confirm(`取消 ${val.file.name} 文件的提交?`)
}

let handleExceed = (val: any) => {
  console.log('handleExceed', val)
  ElMessage.warning(
    `图片限制 ${val.files.length
    } 张, 总共 ${val.files.length + val.fileList.length} 被添加`
  )
}

let handleSuccess = (val: any) => {
  console.log('success')
  console.log(val)
}

let handleChange = (val: any) => {
  console.log('change')
  console.log(val)
}

let handleBeforeUpload = (val: any) => {
  console.log('handleBeforeUpload')
  console.log(val)
}

</script>

<style lang="" scoped>

</style>