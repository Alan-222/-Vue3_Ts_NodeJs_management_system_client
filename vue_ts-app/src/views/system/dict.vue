<template>
  <div class="content-title">字典管理</div>
  <div class="content-container">
    <!-- 搜索栏、表格 -->
    <dataTable ref="dataTableRef" :requestApi="listDicts" :otherConfig="otherConfig" :tableColumn="tableColumn"
      :dict="dict" :tableColumnConfig="tableColumnConfig" :setupConfig="setupConfig" :searchConfig="searchConfig"
      :searchReset="searchReset" :searchBtnConfig="searchBtnConfig" @row-click="handleRowClick" row-key="id"
      :tree-props="{ children: 'dict_items' }" border default-expand-all>
      <!-- 标题插槽 -->
      <template #dict_name="{ row, index }">
        {{ row.dict_name }}
      </template>
      <!-- 状态插槽 -->
      <template #status="{ row, index }">
        <el-tag v-if="row.status === 1" type="success">启用</el-tag>
        <el-tag v-else type="info">禁用</el-tag>
      </template>
      <!-- 批量操作按钮插槽 -->
      <template #multiple-operation="{ selectionData }">
        <el-button color="#3c8dbc" :icon="CirclePlus" v-hasPerm="['system:menu:add']" @click="handleAdd">新增
        </el-button>
      </template>
      <!-- 表格操作栏按钮插槽 -->
      <template #setup="{ row, index }">
        <el-button link type="primary" size="small" v-if="!row.dict_id" v-hasPerm="['system:menu:add']"
          @click.stop="handleItemAdd(row)">新增项
        </el-button>
        <el-button link type="primary" size="small" v-if="!row.dict_id" v-hasPerm="['system:menu:edit']"
          @click="handleUpdate(row)">
          编辑字典</el-button>
        <el-button link type="primary" size="small" v-if="row.dict_id" v-hasPerm="['system:menu:edit']"
          @click="handleItemUpdate(row)">
          编辑字典项</el-button>
        <el-button link type="primary" size="small" v-hasPerm="['system:menui:del']" @click="handleDelete(row)">
          删除</el-button>
      </template>
    </dataTable>
    <!-- 新增、编辑字典弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" @close="cancel" width="400px">
      <L-form v-model:formData="state.formData" :options="formOptions" label-width="80px" ref="dataFormRef">
        <template #action="{ form, model }">
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm(form)">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </L-form>
    </el-dialog>
    <!-- 新增、编辑字典项弹窗 -->
    <el-dialog :title="itemDialog.title" v-model="itemDialog.visible" @close="cancelItem" width="400px">
      <L-form v-model:formData="state.ItemFormData" :options="itemFormOptions" label-width="6rem" ref="dataItemFormRef">
        <template #action="{ form, model }">
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitItemForm(form)">确 定</el-button>
            <el-button @click="cancelItem">取 消</el-button>
          </div>
        </template>
      </L-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default { name: 'Dict' };
</script>

<script setup lang="ts">
import dataTable from '@/components/table/table.vue'
import { reactive, onMounted, ref, toRefs } from 'vue';

import { CirclePlus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// API 依赖
import {
  listDicts,
  addDict,
  updateDict,
  getDictDetail,
  deleteDicts,
  getDictByName
} from '@/utils/api/dict/dict'
import {
  addDictItem,
  updateDictItem,
  deleteDictItems,
  getDictItemDetail
} from '@/utils/api/dict/dictItems'
import { dictAssignment } from '@/utils/dict'

/**
 * 获取字典
 */
onMounted(() => {
  dictAssignment('status', state.formOptions)
  dictAssignment('status', state.itemFormOptions)
  dictAssignment('status', tableState.dict)
})


/**
 * 表格参数
 */
const dataTableRef = ref()
const tableState = reactive({
  tableColumn: [
    { prop: 'dict_name', label: '字典名称', slot: true, ellipsis: true },
    { prop: 'dict_code', label: '字典编码' },
    { prop: 'description', label: '字典描述', ellipsis: true },
    { prop: 'status', label: '状态', dictCode: 'status', slot: true },
    { prop: 'item_text', label: '字典项值' },
    { prop: 'item_value', label: '字典项键' },
    { prop: 'sort_order', label: '排序' },
    { prop: 'create_time', label: '创建时间', attrs: { width: '180' } },
    { prop: 'update_time', label: '更新时间', attrs: { width: '180' } },
  ],
  otherConfig: {
    list: 'rows'
  },
  tableColumnConfig: {
    border: true,
    align: "center"
  },
  setupConfig: {
    fixed: "right",
    align: "center",
    width: '180'
  },
  dict: {
    status: []
  },
  searchConfig: [
    { type: 'input', prop: 'dict_name', label: "字典名称" },
  ],
  searchReset: {
    dict_name: undefined
  },
  searchBtnConfig: {
    color: "#3c8dbc"
  }
})
const { tableColumn, otherConfig, tableColumnConfig, setupConfig, dict, searchConfig, searchReset, searchBtnConfig } = toRefs(tableState)

const dataFormRef = ref();
const dataItemFormRef = ref();


const state = reactive({
  dialog: { visible: false } as Dialog,
  itemDialog: { visible: false } as Dialog,
  formData: {
    id: undefined,
    dict_name: '',
    dict_code: '',
    description: '',
    status: 1
  } as DictFormData,
  ItemFormData: {
    id: undefined,
    dict_id: 0,
    item_text: '',
    item_value: 0,
    description: '',
    sort_order: 0,
    status: 1
  } as DictItemFormData,
  formOptions: [
    {
      type: 'input',
      value: '',
      label: '字典名称',
      prop: 'dict_name',
      placeholder: "请输入字典名称",
      rules: [
        { required: true, message: '字典名称不能为空', trigger: 'blur' }
      ]
    },
    {
      type: 'input',
      value: '',
      label: '字典编码',
      placeholder: "请输入字典编码",
      prop: 'dict_code',
      rules: [
        { required: true, message: '字典编码不能为空', trigger: 'blur' }
      ]
    },
    {
      type: 'input',
      value: '',
      label: '字典描述',
      placeholder: "请输入字典描述",
      prop: 'description',
      rules: [
        { required: true, message: '字典描述不能为空', trigger: 'blur' }
      ]
    },
    {
      type: 'radio-group',
      value: 1,
      prop: 'status',
      label: '状态',
      rules: [
        { required: true, message: '状态值不能为空', trigger: 'change' }
      ],
      selectList: []
    },
  ],
  itemFormOptions: [
    {
      type: 'input',
      value: 0,
      prop: 'dict_id',
      placeholder: "请输入父级字典id",
      attrs: {
        type: 'hidden',
      }
    },
    {
      type: 'input',
      value: '',
      label: '字典项值',
      placeholder: "请输入字典项值",
      prop: 'item_text',
      rules: [
        { required: true, message: '字典项值不能为空', trigger: 'blur' }
      ]
    },
    {
      type: 'input-number',
      value: 0,
      label: '字典项键',
      prop: 'item_value',
      rules: [
        { required: true, message: '字典项键不能为空', trigger: 'blur' }
      ]
    },
    {
      type: 'input',
      value: '',
      label: '描述',
      placeholder: "请输入描述",
      prop: 'description',
      rules: [
        { required: true, message: '描述不能为空', trigger: 'blur' }
      ]
    },
    {
      type: 'input-number',
      value: 0,
      label: '排序',
      prop: 'sort_order',
      rules: [
        { required: true, message: '排序不能为空', trigger: 'blur' }
      ]
    },
    {
      type: 'radio-group',
      value: 1,
      prop: 'status',
      label: '状态',
      rules: [
        { required: true, message: '状态值不能为空', trigger: 'change' }
      ],
      selectList: []
    },
  ],
  currentRow: undefined,
});

const {
  dialog,
  itemDialog,
  formData,
  ItemFormData,
  formOptions,
  itemFormOptions
} = toRefs(state);

/**
 * 查询
 */
function handleQuery() {
  dataTableRef.value.getData()
}

function handleRowClick(row: any) {
  // 点击后将获得当前行的对象
  state.currentRow = JSON.parse(JSON.stringify(row));
}

/**
 * 新增字典打开
 */
function handleAdd(row: any) {
  formData.value.id = undefined;
  dialog.value = {
    title: '添加字典',
    visible: true
  }
}
/**
 * 新增字典项打开
 */
function handleItemAdd(row: any) {
  ItemFormData.value.id = undefined;
  ItemFormData.value.dict_id = row.id
  itemDialog.value = {
    title: '添加字典项',
    visible: true
  }
}
/**
 * 编辑字典
 */
function handleUpdate(row: DictFormData) {
  state.dialog = {
    title: '编辑字典',
    visible: true
  };
  const id = row.id as number;
  getDictDetail(id).then(({ data }) => {
    state.formData = data;
  });
}

function handleItemUpdate(row: DictItemFormData) {
  state.itemDialog = {
    title: "字典项",
    visible: true
  }
  const id = row.id as number;
  getDictItemDetail(id).then(({ data }) => {
    state.ItemFormData = data
  })
}
/**
 * 字典提交
 */
function submitForm(form: any) {
  let validate = form.validate
  validate((isValid: boolean) => {
    if (isValid) {
      if (state.formData.id) {
        updateDict(state.formData.id, state.formData).then(() => {
          ElMessage.success('修改成功');
          cancel();
          handleQuery();
        });
      } else {
        addDict(state.formData).then(() => {
          ElMessage.success('新增成功');
          cancel();
          handleQuery();
        });
      }
    } else {
      ElMessage.error("验证失败")
    }
  });
}

/**
 * 字典项提交
 */
function submitItemForm(form: any) {
  let validate = form.validate
  validate((isValid: boolean) => {
    if (isValid) {
      if (state.ItemFormData.id) {
        updateDictItem(state.ItemFormData.id, state.ItemFormData).then(() => {
          ElMessage.success('修改成功');
          cancelItem();
          handleQuery();
        });
      } else {
        addDictItem(state.ItemFormData).then(() => {
          ElMessage.success('新增成功');
          cancelItem();
          handleQuery();
        });
      }
    } else {
      ElMessage.error("验证失败")
    }
  });
}
/**
 * 删除字典
 *
 * @param row
 */
function handleDelete(row: any) {
  const id = row.id;
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      if (!row.dict_id) {
        deleteDicts({ id: id }).then(() => {
          ElMessage.success('删除成功');
          handleQuery();
        });
      } else {
        deleteDictItems({ id: id }).then(() => {
          ElMessage.success('删除成功');
          handleQuery();
        })
      }
    })
    .catch(() => ElMessage.info('已取消删除'));
}

/**
 * 取消关闭弹窗
 */
function cancel() {
  dataFormRef.value.resetFields();
  reset()
  state.dialog.visible = false;
}
/**
 * 取消关闭弹窗
 */
function cancelItem() {
  dataItemFormRef.value.resetFields();
  resetItem()
  state.itemDialog.visible = false;
}
/**
 * 重置表单
 */
function reset() {
  formData.value.dict_name = ''
  formData.value.dict_code = ''
  formData.value.description = ''
  formData.value.status = 1
}
/**
 * 重置字典项表单
 */
function resetItem() {
  ItemFormData.value.dict_id = 0
  ItemFormData.value.item_text = ''
  ItemFormData.value.item_value = 0
  ItemFormData.value.description = ''
  ItemFormData.value.sort_order = 0
  ItemFormData.value.status = 1
}
</script>
