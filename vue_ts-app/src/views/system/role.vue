
<template>
  <div class="content-title">用户管理</div>
  <div class="content-container">
    <!-- 搜索表单 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item>
        <el-button color="#3c8dbc" :icon="CirclePlus" v-hasPerm="['system:role:add']" @click="handleAdd">新增</el-button>
        <el-button color="#3c8dbc" :icon="Remove" v-hasPerm="['system:role:del']" :disabled="multiple"
          @click="handleDelete">批量删除</el-button>
      </el-form-item>

      <el-form-item prop="role_name" v-hasPerm="['system:role:query']">
        <el-input v-model="queryParams.role_name" placeholder="角色名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <el-form-item>
        <el-button color="#3c8dbc" :icon="Search" v-hasPerm="['system:role:query']" @click="handleQuery">搜索</el-button>
        <el-button color="#3c8dbc" :icon="Refresh" v-hasPerm="['system:role:query']" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table ref="dataTableRef" v-loading="loading" :data="roleList" @selection-change="handleSelectionChange"
      highlight-current-row border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色名称" prop="role_name" align="center" />
      <el-table-column label="角色描述" prop="remark" align="center" />

      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="create_time" label="创建时间" align="center" />
      <el-table-column prop="update_time" label="修改时间" align="center" />

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" size="small" @click.stop="openRoleResourceDialog(scope.row)"
            v-hasPerm="['system:role:edit']">
            分配资源
          </el-button>
          <el-button link type="primary" size="small" circle plain @click.stop="handleUpdate(scope.row)"
            v-hasPerm="['system:role:edit']">
            编辑
          </el-button>
          <el-button link type="primary" size="small" circle plain @click.stop="handleDelete(scope.row)"
            v-hasPerm="['system:role:del']">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页工具条 -->
    <el-pagination :total="total" v-model:currentPage="queryParams.currentPage" v-model:page-size="queryParams.pageSize"
      :page-sizes="[1, 3, 5, 10]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" style="margin-top: 20px;" />

    <!-- 表单弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" destroy-on-close>
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="formData.role_name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色描述" prop="remark">
          <el-input v-model="formData.remark" placeholder="请输入角色描述" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormData">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--分配资源弹窗-->
    <el-dialog :title="'【' + checkedRole.role_name + '】资源分配'" v-model="resourceDialogVisible" width="800px">
      <el-scrollbar max-height="600px" v-loading="loading">
        <el-tree ref="resourceRef" node-key="value" show-checkbox :data="resourceOptions" :default-expand-all="true"
          @check-change="handleResourceCheckChange">
          <template #default="{ data }">
            <span>{{ data.label }}</span>

            <div v-if="data.perms" class="resource-tree-node">
              <el-divider direction="vertical" />
              <div class="node-content">
                <el-checkbox v-for="perm in data.perms" :key="perm.value" :label="perm.value" border size="small"
                  v-model="btnPerms[perm.value]">{{ perm.label }}</el-checkbox>
              </div>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleRoleResourceSubmit">确 定</el-button>
          <el-button @click="cancelResourceAssign">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'role'
};
</script>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, toRefs } from 'vue';
import {
  listRolePages,
  updateRole,
  getRoleFormDetail,
  addRole,
  deleteRoles,
  getRoleResources,
  updateRoleResource
} from '@/utils/api/user/role';
import { listMenuOptions } from '@/utils/api/user/menu';

import { ElForm, ElMessage, ElMessageBox, ElTree } from 'element-plus';
import { Search, CirclePlus, Refresh, Remove } from '@element-plus/icons-vue';


const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);
const resourceRef = ref(ElTree);

const state = reactive({
  loading: true,
  // 选中ID数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  queryParams: {
    currentPage: 1,
    pageSize: 10,
    role_name: undefined
  } as RoleQueryParam,
  roleList: [] as RoleItem[],
  total: 0,
  dialog: {
    title: '',
    visible: false
  },
  formData: {
    role_name: '',
    remark: '',
    status: 1
  } as RoleFormData,
  rules: {
    role_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    remark: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
  },
  resourceDialogVisible: false,
  resourceOptions: [] as Resource[],
  btnPerms: {} as any,
  // 勾选的菜单ID
  checkedMenuIds: new Set([]),
  allPermIds: [] as string[],
  // 选中的角色
  checkedRole: {
    role_id: 0,
    role_name: ''
  }
});

const {
  loading,
  multiple,
  queryParams,
  roleList,
  total,
  dialog,
  formData,
  rules,
  resourceDialogVisible,
  checkedRole,
  resourceOptions,
  btnPerms
} = toRefs(state);

function handleQuery() {
  state.loading = true;
  listRolePages(state.queryParams).then(({ data }) => {
    state.roleList = data.rows;
    state.total = data.count;
    state.loading = false;
  });
}
// 每页显示条数改变 就会触发这个函数
const handleSizeChange = (val: number) => {
  // 保存每页显示的条数
  queryParams.value.pageSize = val;
  queryParams.value.currentPage = 1;
  // 调用分页函数
  handleQuery();
}
// 当前页码改变 就会触发这个函数
const handleCurrentChange = (val: number) => {
  // 保存当前页码
  queryParams.value.currentPage = val;
  // 调用分页函数
  handleQuery();
}
/**
 * 查询重置
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.role_id);
  state.single = selection.length !== 1;
  state.multiple = !selection.length;
}

function handleAdd() {
  state.dialog = {
    title: '添加角色',
    visible: true
  };
}

function handleUpdate(row: any) {
  state.dialog = {
    title: '修改角色',
    visible: true
  };
  const roleId = row.role_id || state.ids;
  getRoleFormDetail(roleId).then(({ data }) => {
    state.formData = data;
  });
}

function submitFormData() {
  loading.value = true;
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      if (state.formData.role_id) {
        updateRole(state.formData.role_id as any, state.formData).then(() => {
          ElMessage.success('修改角色成功');
          cancel();
          handleQuery();
          loading.value = false;
        });
      } else {
        addRole(state.formData).then(() => {
          cancel();
          ElMessage.success('新增角色成功');
          handleQuery();
          loading.value = false;
        });
      }
    }
  });
}

/**
 * 取消
 */
function cancel() {
  dialog.value.visible = false;
  formData.value.role_id = undefined;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
}

/**
 *  删除
 */
function handleDelete(row: any) {
  const ids = row.role_id || state.ids;
  ElMessageBox.confirm('确认删除已选中的数据项?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteRoles({ role_ids: ids }).then(() => {
        ElMessage.success('删除成功');
        handleQuery();
      });
    })
    .catch(() => ElMessage.info('已取消删除'));
}
// 树形控件菜单勾/反选方法
const handleResourceCheckChange = (
  data: Resource,
  isCheck: boolean,
  sonHasCheck: boolean
) => {
  console.log('data', data);
  console.log('isCheck', isCheck);
  // 当勾/反选的菜单存在按钮时，按钮的状态改成对应菜单状态
  if (data.perms) {
    data.perms.forEach(item => {
      btnPerms.value[item.value] = isCheck;
    });
  }
};

/**
 * 资源分配
 */
function openRoleResourceDialog(row: RoleItem) {
  resourceDialogVisible.value = true;
  loading.value = true;

  const roleId: number = row.role_id;
  checkedRole.value = {
    role_id: roleId,
    role_name: row.role_name
  };

  // 获取所有的资源
  listMenuOptions().then(response => {
    resourceOptions.value = response.data;

    // 获取角色拥有的资源
    getRoleResources(roleId).then(({ data }) => {
      // 勾选的菜单回显
      const checkedMenuIds = data.menu_ids;
      resourceRef.value.setCheckedKeys(checkedMenuIds);

      nextTick(() => {
        // 勾选的权限回显
        const rolePermIds = data.permIds;

        state.allPermIds = filterResourcePermIds(response.data, []);
        if (state.allPermIds) {
          state.allPermIds.forEach(permId => {
            if (rolePermIds.indexOf(permId) > -1) {
              btnPerms.value[permId] = true;
            } else {
              btnPerms.value[permId] = false;
            }
          });
        }
        loading.value = false;
      });
    });
  });
}

const filterResourcePermIds = (resources: Resource[], permIds: string[]) => {
  resources.forEach(resource => {
    if (resource.perms) {
      resource.perms.forEach(perm => {
        permIds.push(perm.value);
      });
    }
    if (resource.children) {
      filterResourcePermIds(resource.children, permIds);
    }
  });
  return permIds;
};
/**
 * 分配资源提交
 */
function handleRoleResourceSubmit() {
  const checkedMenuIds: any[] = resourceRef.value
    .getCheckedNodes(false, true)
    .map((node: any) => node.value);

  const checkedPermIds = [] as string[];
  if (state.allPermIds) {
    state.allPermIds.forEach(permId => {
      if (btnPerms.value[permId]) {
        checkedPermIds.push(permId);
      }
    });
  }

  const RoleResource = {
    menu_ids: checkedMenuIds,
    permIds: checkedPermIds
  };

  updateRoleResource(checkedRole.value.role_id, RoleResource).then(res => {
    ElMessage.success('分配权限成功');
    state.resourceDialogVisible = false;
    handleQuery();
  });
}

/**
 * 取消资源分配
 */
function cancelResourceAssign() {
  state.resourceDialogVisible = false;
}

onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss">
.resource-tree-node {
  flex-wrap: wrap;
  display: inline-flex;
  font-size: 14px;
  justify-content: flex-end;

  .node-content {
    width: 600px;
    display: flex;
    flex-wrap: wrap;
  }

  .el-divider--vertical {
    height: 1.5em !important;
  }
}


.el-tree-node__content {
  height: auto !important;
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;

  &:hover {
    background-color: var(--el-tree-node-hover-bg-color);
  }

  &:active {
    background-color: var(--el-tree-node-hover-bg-color);
  }
}

.el-checkbox.el-checkbox--small {
  margin: 5px;
  z-index: 999;
  background: #fff;
}
</style>
