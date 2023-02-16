<template>
  <div>
    <el-form ref="form" v-if="formData && props.options && props.options.length" :validate-on-rule-change='false'
      :model='formData' :rules='rules' v-bind="$attrs">
      <el-row>
        <el-col v-for="(item, index) in props.options" :key="index"
          :span="24 / item.colCount! || formConfig.colSpan || 24">
          <template
            v-if="(item.show && item.show.includes(formConfig.showStatus!)) || (item.show === undefined && formConfig.showStatus === undefined)">
            <el-form-item v-if="!item.selectList || !item.selectList.length" :prop="item.prop" :label="item.label">
              <component v-if="item.type !== 'upload' && item.type !== 'editor'" v-bind="item.attrs"
                :is="`el-${item.type}`" :placeholder="item.placeholder" v-model="formData[item.prop]">
              </component>
              <el-upload v-if="item.type === 'upload'" v-bind="item.uploadAttrs" :on-preview="onPreview"
                :on-remove="onRemove" :on-success="onSuccess" :on-error="onError" :on-progress="onProgress"
                :on-change="onChange" :before-upload="beforeUpload" :before-remove="beforeRemove"
                :http-request="httpRequest" :on-exceed="onExceed">
                <slot name="uploadArea"></slot>
                <slot name="uploadTip"></slot>
              </el-upload>
              <div class="full-screen-container">
                <div id="toolbar" v-if="item.type === 'editor'" class="editor-border" style="z-index: 101;"></div>
                <div id="editor" v-if="item.type === 'editor'" class="editor-content editor-border"></div>
              </div>
            </el-form-item>
            <el-form-item v-if="item.selectList && item.selectList.length" :prop="item.prop" :label="item.label">
              <component v-bind="item.attrs" :is="`el-${item.type}`" :placeholder="item.placeholder"
                v-model="formData[item.prop]">
                <template v-if="item.type === 'radio-group'">
                  <component v-for="(child, i) in item.selectList" :key="i" :is="`el-radio`"
                    :label="child[item.listValue]">
                    {{ child[item.listLabel] }}
                  </component>
                </template>
                <template v-else-if="item.type === 'checkbox-group'">
                  <component v-for="(child, i) in item.selectList" :key="i" :is="`el-checkbox`"
                    :label="child[item.listLabel]" :value="child[item.listValue]">
                  </component>
                </template>
                <template v-else>
                  <component v-for="(child, i) in item.selectList" :key="i" :is="`el-option`"
                    :label="child[item.listLabel]" :value="child[item.listValue]">
                  </component>
                </template>

              </component>
            </el-form-item>
          </template>
        </el-col>
      </el-row>
    </el-form>
    <div class="footer-btn">
      <slot name="action" :form='form' :model='formData'></slot>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Form'
};
</script>

<script lang="ts" setup>
import { PropType, ref, onMounted, nextTick, toRefs, watch } from 'vue'
import { FormOptions, FormInstance, formConfig, selectValue } from './types/types'
import type { UploadProgressEvent, UploadFile, UploadRawFile, UploadFiles, UploadRequestHandler, UploadUserFile } from 'element-plus'
import { deepClone } from './utils/tools';
import '@wangeditor/editor/dist/css/style.css'
import { createEditor, createToolbar, IEditorConfig, IDomEditor } from '@wangeditor/editor'


// 接收父组件传递的方法
let emits = defineEmits([
  'on-preview', 'on-remove', 'on-success', 'on-error',
  'on-progress', 'on_change', 'before-upload', 'before-remove', 'on-exceed'
])
// 接收父组件传递的参数
let props = defineProps({
  // 表单的配置项
  options: {
    type: Array as PropType<FormOptions[]>,
    required: true
  },
  // 表单数据
  formData: {
    type: Object
  },
  // 对于表单的总体配置
  formConfig: {
    type: Object as PropType<formConfig>,
    default() {
      return {
        colSpan: 24
      }
    }
  },
  // 用户自定义上传方法
  httpRequest: {
    type: Function as PropType<UploadRequestHandler>
  }
})

let { formConfig, httpRequest } = toRefs(props)
// 定义表单参数
let formData = ref({} as any)
let rules = ref<any>(null)
let edit = ref()

let form = ref<FormInstance | null>()

// 初始化表单方法
let initForm = () => {
  if (props.options && props.options.length) {
    let r: any = {}
    props.options.forEach((item) => {
      if (item.selectList && !item.listLabel && !item.listValue) {
        item.listLabel = 'label'
        item.listValue = 'value'
      }
      r[item.prop] = item.rules
      // 初始化富文本编辑器
      if (item.type === 'editor') {
        nextTick(() => {
          if (document.getElementById('editor') && document.getElementById('toolbar')) {
            const editorConfig: Partial<IEditorConfig> = {}
            editorConfig.placeholder = item.placeholder
            editorConfig.onChange = (editor: IDomEditor) => {
              // 当编辑器选区、内容变化时，即触发
              // console.log('content', editor.children)
              // console.log('html', editor.getHtml())
              // console.log('text', editor.getText());

              formData.value[item.prop] = editor.getHtml()
            }

            // 创建编辑器
            const editor = createEditor({
              selector: '#editor',
              config: editorConfig,
              mode: 'default' // 或 'simple' 参考下文
            })
            // 创建工具栏
            const toolbar = createToolbar({
              editor,
              selector: '#toolbar',
              mode: 'default' // 或 'simple' 参考下文
            })
            edit.value = editor
          }
        })
      }
    })
    rules.value = deepClone(r)
  }
}
// 组件获取父组件异步数据的方法
let updateOptions = (value: selectValue[], prop: string) => {
  let index = props.options.findIndex(item => item.prop == prop)
  props.options[index].selectList = value
}

// 组件重写表单重置的方法
let resetFields = () => {
  // 1、重置element-plus 的表单
  form.value!.resetFields()
  // 2、重置富文本编辑器的内容
  if (props.options && props.options.length && props.options.find(item => item.type === "editor") !== undefined) {
    // 清空富文本内容
    edit.value.clear()
  }
}

// 表单验证
let validate = () => {
  return form.value!.validate
}

// 获取表单数据
let getFormData = () => {
  return formData.value
}


// 使用vue3的新api 分发方法，它替代了之前的$children方法
defineExpose({
  updateOptions,
  resetFields,
  validate,
  getFormData
})

// 监听父组件传递过来的options、formData
watch(() => props.formData, (val) => {
  formData.value = val
}, { immediate: true, deep: true })
watch(() => props.options, () => {
  initForm()
}, { immediate: true, deep: true })
// 上传组件的所有方法
let onPreview = (file: UploadFile) => {
  emits('on-preview', file)
}

let onRemove = (file: UploadFile, fileList: UploadFiles) => {
  emits('on-remove', { file, fileList })
}

let onSuccess = (response: any, file: UploadFile, fileList: UploadFiles) => {
  // 上传图片成功， 给表单上传项赋值
  let uploadItem = props.options.find(item => item.type === 'upload')
  formData.value[uploadItem!.prop] = { response, file, fileList }
  emits('on-success', { response, file, fileList })
}

let onError = (err: Error, file: UploadFile, fileList: UploadFiles) => {
  emits('on-error', { err, file, fileList })
}

let onProgress = (event: UploadProgressEvent, file: UploadFile, fileList: UploadFiles) => {
  emits('on-progress', { event, file, fileList })
}

let onChange = (file: UploadFile, fileList: UploadFiles) => {
  emits('on_change', { file, fileList })
}

let beforeUpload = (file: UploadRawFile) => {
  emits('before-upload', file)
}

let beforeRemove = (file: UploadFile, fileList: UploadFiles): any => {
  emits('before-remove', { file, fileList })
}

let onExceed = (file: File[], fileList: UploadUserFile[]) => {
  emits('on-exceed', { file, fileList })
}

</script>

<style scoped>
.editor-border {
  border-bottom: 1px solid #ccc;
}

.editor-content {
  height: 200px;
  z-index: 100;
}

.footer-btn {
  margin-top: 20px;
  text-align: right;
}
</style>