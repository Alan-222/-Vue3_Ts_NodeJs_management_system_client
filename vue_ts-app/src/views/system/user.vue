<template>
  <div class="content-title">用户管理</div>
  <div class="content-container">
    <!-- 搜索栏、表格 -->
    <dataTable ref="dataTableRef" :requestApi="listUser" :tableColumn="tableColumn" :otherConfig="otherConfig"
      :pageSizes="[1, 3, 5, 10]" :dict="dict" selection="multiple" :tableColumnConfig="tableColumnConfig"
      :setupConfig="setupConfig" :searchConfig="searchConfig" :searchReset="searchReset"
      :searchBtnConfig="searchBtnConfig" border>
      <!-- 角色项插槽 -->
      <template #roles="{ row, index }">
        {{ role_name(row.roles) }}
      </template>
      <!-- 批量操作按钮插槽 -->
      <template #multiple-operation="{ selectionData }">
        <el-button color="#3c8dbc" :icon="CirclePlus" v-hasPerm="['system:user:add']" @click="handleAdd">新增
        </el-button>
        <el-button color="#3c8dbc" :icon="Remove" @click="handleDelete(selectionData)" v-hasPerm="['system:user:del']"
          :disabled="!selectionData.length">批量删除</el-button>
      </template>
      <!-- 表格操作栏按钮插槽 -->
      <template #setup="{ row, index }">
        <el-button link type="primary" size="small" v-hasPerm="['system:user:edit']" @click="handleEdit(row.user_id)">
          编辑</el-button>
        <el-button link type="primary" size="small" v-hasPerm="['system:user:del']" @click="handleDelete(row)">
          删除</el-button>
        <el-button link type="primary" size="small" v-hasPerm="['system:user:edit']"
          @click="handleReset(row.user_id)">重置密码
        </el-button>
      </template>
    </dataTable>

    <!-- 新增、编辑、详情弹窗 -->
    <el-dialog v-model="dialogFormVisible" :title="title" width="25%">
      <!-- 新增及编辑弹窗表单 -->
      <L-form v-model:formData="form" :options="formOptions" :formConfig="formConfig" label-width="6em"
        ref="editFormRef">
        <template #action="{ form, model }">
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm(form)" :loading="buttonLoading">保存</el-button>
            <el-button @click="dialogClose">取消</el-button>
          </div>
        </template>
      </L-form>

    </el-dialog>
  </div>

</template>

<script lang="ts">
export default { name: 'User' };
</script>

<script setup lang="ts">
import dataTable from '@/components/table/table.vue'
import { CirclePlus, Refresh, Search, Remove } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, computed, toRefs, nextTick } from 'vue'
import { ElTable, ElMessageBox, ElMessage, FormInstance } from 'element-plus'
import { listUser, addUser, updateUser, updatePwd, delUser, getUserInfoById } from '@/utils/API/user/user'
import { allRole } from '@/utils/API/user/role'
import { useStore } from '@/store'
/**
 * 调用获取用户列表
 */
onMounted(() => {
  // 获取角色
  getRoles()
})

/**
 * 表格参数
 */
const dataTableRef = ref()
const tableState = reactive({
  tableColumn: [
    { prop: 'user_id', label: '用户编号' },
    { prop: 'username', label: '用户账号' },
    { prop: 'roles', label: '角色', slot: true },
    { prop: 'status', label: '状态', dictCode: 'status' },
    { prop: 'create_time', label: '创建时间' },
  ],
  tableColumnConfig: {
    border: 'border',
    align: "center"
  },
  otherConfig: {
    list: 'rows'
  },
  setupConfig: {
    fixed: "right",
    align: "center"
  },
  dict: {
    status: [
      { code: 0, name: '停用' },
      { code: 1, name: '启用' }
    ]
  },
  searchConfig: [
    { type: 'input', prop: 'username', label: "用户账号" },
    {
      type: 'select',
      prop: 'status',
      label: '状态',
      selectList: [
        { code: 0, name: '停用' },
        { code: 1, name: '启用' }
      ],
      listLabel: 'name',
      listValue: 'code',
    }
  ],
  searchReset: {
    username: undefined,
    status: undefined
  },
  searchBtnConfig: {
    color: "#3c8dbc"
  }
})
const { tableColumn, tableColumnConfig, otherConfig, setupConfig, dict, searchConfig, searchReset, searchBtnConfig } = toRefs(tableState)
// 获取vuex
const store = useStore()
/**
 * 获取用户列表
 */

// 角色数据转换为角色名称
let role_name = computed(() =>
  (roles: any) => roles.map((item: any) => item.role_name)
)
// 按照分页显示数据的函数
const getListUser = () => {
  dataTableRef.value.getData()
}
const roles = ref([] as RoleItem[])
const getRoles = () => {
  allRole().then(res => {
    roles.value = res.data.map((item: RoleItem) => {
      item.type = 'option'
      return item
    })
  })
}

/**
 * 弹窗参数
 */
// 验证旧密码
const validateOldPwd = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入原密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6'))
  } else {
    callback()
  }
}
// 验证密码
const validatePwd = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能小于6'))
  } else {
    callback()
  }
}
// 二次验证密码
const validateRePwd = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}
/**
 * 新增编辑及修改密码弹窗
 */
// 新增编辑及修改密码弹窗变量及方法
const state = reactive({
  title: '' as string,
  roles: [] as RoleItem[],
  dialogFormVisible: false as boolean,
  formConfig: {
    showStatus: ''
  },
  formOptions: [
    {
      type: 'input',
      value: '',
      prop: 'username',
      label: '用户账号',
      placeholder: '请输入用户账号',
      rules: [
        {
          required: true,
          message: '用户名称不能为空',
          trigger: 'blur'
        },
        { min: 3, max: 12, message: '帐号长度3-12之内', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9]+$/, message: '帐号只能字母数字组成', trigger: 'blur' }
      ],
      show: ['add', 'edit']
    },
    {
      type: 'select',
      value: '',
      label: '角色',
      placeholder: "请选择角色",
      prop: 'role_ids',
      childLabel: 'role_name',
      childValue: 'role_id',
      children: roles,
      rules: [
        {
          required: true,
          message: '角色不能为空',
          trigger: 'blur'
        }
      ],
      attrs: {
        multiple: true
      },
      show: ['add', 'edit']
    },
    {
      type: 'input',
      value: '',
      label: "旧密码",
      placeholder: '请输入旧密码',
      prop: 'old_password',
      rules: [{ validator: validateOldPwd, trigger: 'blur' }],
      attrs: {
        type: 'password',
        showPassword: true,
        clearable: true
      },
      show: ['edit-pwd']
    },
    {
      type: 'input',
      value: '',
      label: "密码",
      placeholder: '请输入密码',
      prop: 'password',
      rules: [{ validator: validatePwd, trigger: 'blur' }],
      attrs: {
        type: 'password',
        showPassword: true,
        clearable: true
      },
      show: ['add', 'edit-pwd']
    },
    {
      type: 'input',
      value: '',
      label: "确认密码",
      placeholder: '请输入确认密码',
      prop: 'repassword',
      rules: [{ validator: validateRePwd, trigger: 'blur' }],
      attrs: {
        type: 'password',
        showPassword: true,
        clearable: true
      },
      show: ['add', 'edit-pwd']
    },
    {
      type: 'radio-group',
      value: 0,
      prop: 'status',
      label: '状态',
      rules: [
        {
          required: true,
          message: '状态值不能为空',
          trigger: 'change'
        }
      ],
      children: [
        {
          type: 'radio',
          label: '正常',
          value: 1
        },
        {
          type: 'radio',
          label: "停用",
          value: 0
        }
      ],
      show: ['add', 'edit']
    },
  ]
})
const { title, dialogFormVisible, formOptions, formConfig } = toRefs(state)
const editFormRef = ref()


const form = reactive<userEditForm>({
  user_id: 0,
  action: '',
  username: '',
  old_password: '',
  password: '',
  repassword: '',
  status: 1,
  role_ids: []
})

const buttonLoading = ref(false)


const dialogClose = () => {
  resetFrom()
  dialogFormVisible.value = false
}

const resetFrom = () => {
  form.action = ''
  form.username = ''
  form.user_id = 0
  form.old_password = ''
  form.password = ''
  form.repassword = ''
  form.role_ids = []
  form.status = 1
  editFormRef.value.resetFields()
}
const handleAdd = () => {
  title.value = "添加用户"
  state.formConfig.showStatus = 'add'
  dialogFormVisible.value = true
}
const handleReset = (user_id: number) => {
  getUserInfoById(user_id).then(res => {
    form.user_id = res.data.user_id
    state.formConfig.showStatus = 'edit-pwd'
    form.action = 'edit-pwd'
    dialogFormVisible.value = true
    title.value = "重置密码"
  })
}
const handleEdit = (user_id: number) => {
  getUserInfoById(user_id).then(res => {
    form.user_id = res.data.user_id
    form.username = res.data.username
    form.status = res.data.status
    state.formConfig.showStatus = 'edit'
    form.role_ids = res.data.roles.map((item: RoleItem) => {
      if (item.role_id) {
        return item.role_id
      }
    })
    dialogFormVisible.value = true
    title.value = "编辑用户信息"
  })
}
const handleDelete = (rows: { [key: string]: any }) => {
  let userIds: number | number[];
  if (Array.isArray(rows)) {
    userIds = rows.map((item) => item.user_id)
  } else {
    userIds = rows.user_id
  }

  ElMessageBox.confirm(
    '是否确认删除用户编号为「' + userIds + '」的数据项?',
    'Warning',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    delUser({ user_ids: userIds }).then(res => {
      ElMessage.success(
        '删除成功'
      )
      getListUser()
    })
  })
    .catch(() => ElMessage.info('已取消删除'))
}
const reLogin = () => {
  ElMessageBox.confirm('修改成功，请重新登录', '重新登录', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning'
  }).finally(() => {
    store.dispatch('user/resetToken').then(() => {
      location.reload()
    })
  })
}
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      buttonLoading.value = true
      if (form.action === 'edit-pwd') {
        updatePwd({ user_id: form.user_id, old_password: form.old_password, password: form.password, repassword: form.repassword }).then(res => {
          console.log(form.user_id, store.state.user.user_id);

          if (form.user_id === store.state.user.user_id) {
            reLogin()
          }
          ElMessage.success("重置密码成功")
          dialogClose()
          // 重新获取表格数据
          getListUser()
        })
          .finally(() => {
            buttonLoading.value = false
          })
        return false;
      }
      if (form.user_id) {
        updateUser(form)
          .then((res) => {
            ElMessage.success('修改用户成功')
            // 关闭弹窗
            dialogClose()
            // 重新获取表格数据
            getListUser()
          })
          .finally(() => {
            buttonLoading.value = false
          })
      } else {
        addUser(form)
          .then((res) => {
            ElMessage.success('新增用户成功')
            // 关闭弹窗
            dialogClose()
            // 重新获取表格数据
            getListUser()
          })
          .finally(() => {
            buttonLoading.value = false
          })
      }
    }
  })
}

</script>
