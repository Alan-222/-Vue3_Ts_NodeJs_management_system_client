<template>
  <div class="content-title">菜单管理</div>
  <div class="content-container">
    <!-- 搜索栏、表格 -->
    <dataTable ref="dataTableRef" :requestApi="listMenus" :tableColumn="tableColumn" :pagination="false" :dict="dict"
      :tableColumnConfig="tableColumnConfig" :setupConfig="setupConfig" :searchConfig="searchConfig"
      :searchReset="searchReset" :searchBtnConfig="searchBtnConfig" @row-click="handleRowClick" row-key="menu_id" border
      default-expand-all>
      <!-- 标题插槽 -->
      <template #title="{ row, index }">
        <svg-icon :icon-class="row.icon" />
        {{ row.title }}
      </template>
      <!-- 菜单类型插槽 -->
      <template #type="{ row }">
        <el-tag v-if="row.type === 'C'" type="warning">目录</el-tag>
        <el-tag v-if="row.type === 'M'" type="success">菜单</el-tag>
        <el-tag v-if="row.type === 'B'" type="danger">按钮</el-tag>
      </template>
      <!-- 状态插槽 -->
      <template #hidden="{ row, index }">
        <el-tag v-if="row.hidden === '0'" type="success">显示</el-tag>
        <el-tag v-else type="info">隐藏</el-tag>
      </template>
      <!-- 批量操作按钮插槽 -->
      <template #multiple-operation="{ selectionData }">
        <el-button color="#3c8dbc" :icon="CirclePlus" v-hasPerm="['system:menu:add']" @click="handleAdd">新增
        </el-button>
      </template>
      <!-- 表格操作栏按钮插槽 -->
      <template #setup="{ row, index }">
        <el-button link type="primary" size="small" v-if="row.type !== 'B'" v-hasPerm="['system:menu:add']"
          @click.stop="handleAdd(row)">新增
        </el-button>
        <el-button link type="primary" size="small" v-hasPerm="['system:menu:edit']" @click="handleUpdate(row)">
          编辑</el-button>
        <el-button link type="primary" size="small" v-hasPerm="['system:menui:del']" @click="handleDelete(row)">
          删除</el-button>
      </template>
    </dataTable>
    <!-- 新增、编辑弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" @close="cancel" width="750px">
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="父级菜单" prop="parent_id">
          <el-tree-select v-model="formData.parent_id" placeholder="选择上级菜单" :data="menuOptions" filterable check-strictly
            :render-after-expand="false" />
        </el-form-item>

        <el-form-item label="菜单标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入菜单或按钮的名称" />
        </el-form-item>

        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type" @change="handleMenuTypeChange">
            <el-radio v-for="item in dict.authType" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="路由名称" prop="name" v-if="formData.type === 'M'">
          <el-input v-model="formData.name" placeholder="请输入路由名称" />
        </el-form-item>

        <el-form-item label="路由路径" prop="path" v-if="formData.type !== 'B'">
          <el-input v-if="formData.type == 'C'" v-model="formData.path" placeholder="/system  (目录以/开头)" />
          <el-input v-else v-model="formData.path" placeholder="user" />
        </el-form-item>

        <!-- 组件页面完整路径 -->
        <el-form-item v-if="formData.type == 'M'" label="页面路径" prop="component">
          <el-input v-model="formData.component" placeholder="/system/user/index" style="width: 95%">
            <template v-if="formData.parent_id != 0" #prepend>src/views/</template>
            <template v-if="formData.parent_id != 0" #append>.vue</template>
          </el-input>
        </el-form-item>

        <!-- 权限标识 -->
        <el-form-item v-if="formData.type === 'B'" label="权限标识" prop="permisson">
          <el-input v-model="formData.permission" placeholder="sys:user:add" />
        </el-form-item>

        <el-form-item label="图标" prop="icon" v-if="formData.type !== 'B'">
          <el-popover ref="popoverRef" placement="bottom-start" :width="570" trigger="click">
            <template #reference>
              <el-input v-model="formData.icon" placeholder="点击选择图标" readonly @click="iconSelectVisible = true">
                <template #prefix>
                  <svg-icon :icon-class="formData.icon" />
                </template>
              </el-input>
            </template>

            <icon-select @selected="selected" />
          </el-popover>
        </el-form-item>

        <el-form-item label="跳转路由" v-if="formData.type == 'C'">
          <el-input v-model="formData.redirect" placeholder="跳转路由" />
        </el-form-item>

        <el-form-item label="状态" v-if="formData.type !== 'B'">
          <el-radio-group v-model="formData.hidden">
            <el-radio v-for="item in dict.hidden" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" style="width: 100px" controls-position="right" :min="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default { name: 'Menu' };
</script>

<script setup lang="ts">
import dataTable from '@/components/table/table.vue'
import { reactive, ref, onMounted, toRefs } from 'vue';

import { Search, CirclePlus, Edit, Refresh, Delete } from '@element-plus/icons-vue';
import { ElForm, ElMessage, ElMessageBox, ElPopover } from 'element-plus';

// API 依赖
import {
  listMenus,
  getMenuDetail,
  listMenuOptions,
  addMenu,
  deleteMenus,
  updateMenu
} from '@/utils/Api/user/menu';

import SvgIcon from '@/components/SvgIcon/index.vue';
import IconSelect from '@/components/IconSelect/index.vue';
import { dictAssignment } from '@/utils/dict';

/**
 * 获取字典
 */
onMounted(() => {
  dictAssignment('hidden', tableState.dict)
  dictAssignment('authType', tableState.dict)
})
/**
 * 表格参数
 */
const dataTableRef = ref()
const tableState = reactive({
  tableColumn: [
    { prop: 'title', label: '菜单标题', slot: true, ellipsis: true },
    { prop: 'name', label: '路由名称' },
    { prop: 'type', label: '菜单类型', slot: true },
    { prop: 'permission', label: '权限标识' },
    { prop: 'hidden', label: '状态', dictCode: 'hidden', slot: true },
    { prop: 'sort', label: '排序' },
    { prop: 'create_time', label: '创建时间' },
    { prop: 'update_time', label: '更新时间' },
  ],
  tableColumnConfig: {
    border: true,
    align: "center"
  },
  setupConfig: {
    fixed: "right",
    align: "center"
  },
  dict: {
    hidden: [] as Option[],
    authType: [] as Option[]
  },
  searchConfig: [
    { type: 'input', prop: 'title', label: "菜单标题" },
  ],
  searchReset: {
    title: undefined
  },
  searchBtnConfig: {
    color: "#3c8dbc"
  }
})
const { tableColumn, tableColumnConfig, setupConfig, dict, searchConfig, searchReset, searchBtnConfig } = toRefs(tableState)
const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const popoverRef = ref(ElPopover);

const state = reactive({
  menuList: [] as MenuItem[],
  dialog: { visible: false } as Dialog,
  menuOptions: [] as Option[],
  formData: {
    parent_id: 0,
    title: '',
    name: undefined,
    hidden: '0',
    sort: 1,
    component: undefined,
    path: undefined,
    type: 'C',
    permission: undefined,
    redirect: undefined
  } as MenuFormData,
  rules: {
    parent_id: [{ required: true, message: '请选择顶级菜单', trigger: 'blur' }],
    title: [{ required: true, message: '请输入菜单标题', trigger: 'blur' }],
    name: [{ required: true, message: '请输入路由名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择菜单类型', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
    component: [
      { required: true, message: '请输入组件完整路径', trigger: 'blur' }
    ]
  },
  currentRow: {} as MenuItem,
  // Icon选择器显示状态
  iconSelectVisible: false,
  cacheData: {
    menuType: '',
    menuPath: ''
  },
});

const {
  dialog,
  formData,
  menuOptions,
  rules,
  iconSelectVisible,
  cacheData,
} = toRefs(state);

/**
 * 查询
 */
function handleQuery() {
  dataTableRef.value.getData()
}

/**
 * 加载菜单下拉树
 */
async function loadMenuData() {
  const getMenuOptions: any[] = [];
  await listMenuOptions().then(({ data }) => {
    const menuOption = { value: 0, label: '顶级菜单', children: data };
    getMenuOptions.push(menuOption);
    menuOptions.value = getMenuOptions;
  });
}

function handleRowClick(row: any) {
  // 点击后将获得当前行的对象
  state.currentRow = JSON.parse(JSON.stringify(row));
}

/**
 * 新增菜单打开
 */
async function handleAdd(row: any) {
  formData.value.menu_id = undefined;
  await loadMenuData();
  dialog.value = {
    title: '添加菜单',
    visible: true
  };

  if (row.menu_id) {
    // 行点击新增

    formData.value.parent_id = row.menu_id;
  } else {
    // 工具栏新增

    if (state.currentRow && state.currentRow.type !== 'B') {
      // 选择行
      formData.value.parent_id = (state.currentRow as any).menu_id;
    } else {
      // 未选择行
      formData.value.parent_id = 0;
    }
  }
}

/**
 * 编辑菜单
 */
async function handleUpdate(row: MenuFormData) {
  await loadMenuData();
  state.dialog = {
    title: '编辑菜单',
    visible: true
  };
  const id = row.menu_id as number;
  getMenuDetail(id).then(({ data }) => {
    state.formData = data;
    cacheData.value.menuType = data.type;
    cacheData.value.menuPath = data.path;
  });
}

/**
 * 菜单类型 change
 */
function handleMenuTypeChange(menuType: any) {
  if (menuType !== cacheData.value.menuType) {
    formData.value.path = undefined;
  } else {
    formData.value.path = cacheData.value.menuPath;
  }
}

/**
 * 菜单提交
 */
function submitForm() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      if (state.formData.type !== 'B') {
        formData.value.permission = undefined
        if (state.formData.type === 'M') {
          formData.value.redirect = undefined;
        }
      } else {
        formData.value.name = undefined
        formData.value.component = undefined
        formData.value.path = undefined
        formData.value.redirect = undefined
      }
      if (state.formData.menu_id) {
        updateMenu(state.formData.menu_id, state.formData).then(() => {
          ElMessage.success('修改成功');
          cancel();
          handleQuery();
        });
      } else {
        addMenu(state.formData).then(() => {
          ElMessage.success('新增成功');
          cancel();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 删除菜单
 *
 * @param row
 */
function handleDelete(row: any) {
  const id = row.menu_id;
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteMenus({ menu_id: id }).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
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
 * 重置表单
 */
function reset() {
  formData.value.parent_id = 0
  formData.value.title = ''
  formData.value.name = undefined
  formData.value.hidden = '0'
  formData.value.component = undefined
  formData.value.path = undefined
  formData.value.permission = undefined
  formData.value.redirect = undefined
}
/**
 * 选择图标后事件
 */
function selected(name: string) {
  state.formData.icon = name;
  state.iconSelectVisible = false;
}

</script>
