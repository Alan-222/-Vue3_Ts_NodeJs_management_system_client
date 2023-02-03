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
      <el-form :model="form" ref="editFormRef" :rules="rules" label-width="6em">
        <el-form-item v-if="form.action !== 'edit-pwd'" label="用户帐号" prop="username">
          <el-input v-model="form.username" placeholder="请输入帐号" />
        </el-form-item>
        <el-form-item v-if="form.action === 'edit-pwd'" label="原密码" prop="old_password">
          <el-input v-model="form.old_password" type="password" placeholder="请输入原用户密码" />
        </el-form-item>
        <el-form-item v-if="!form.user_id || form.action === 'edit-pwd'" label="用户密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入用户密码" />
        </el-form-item>
        <el-form-item v-if="!form.user_id || form.action === 'edit-pwd'" label="确认密码" prop="repassword">
          <el-input v-model="form.repassword" type="password" placeholder="请再次输入用户密码" />
        </el-form-item>
        <el-form-item v-if="form.action !== 'edit-pwd'" label="角色" prop="role_ids"
          :rules="{ required: true, message: '请选择角色', trigger: 'change', type: 'array' }">
          <el-select v-model="form.role_ids" multiple placeholder="请选择角色">
            <el-option v-for="item in roles" :key="item.role_id" :label="item.role_name" :value="item.role_id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.action !== 'edit-pwd'" label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">开启</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose(editFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(editFormRef)" :loading="buttonLoading">保存
        </el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script lang="ts">
export default { name: 'User' };
</script>

<script setup lang="ts">
import dataTable from '@/components/table/table.vue'
import { CirclePlus, Refresh, Search, Remove } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, computed, toRefs } from 'vue'
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
const state = reactive({
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
const { tableColumn, tableColumnConfig, otherConfig, setupConfig, dict, searchConfig, searchReset, searchBtnConfig } = toRefs(state)
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

/**
 * 新增编辑及修改密码弹窗
 */
// 新增编辑及修改密码弹窗变量及方法
let title = ref('')
let dialogFormVisible = ref(false)
const editFormRef = ref<FormInstance>()
// 表单校验
// 验证密码
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
const rules = reactive({
  username: [
    { required: true, message: '帐号不能为空', trigger: 'blur' },
    { min: 3, max: 12, message: '帐号长度3-12之内', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]+$/, message: '帐号只能字母数字组成', trigger: 'blur' }
  ],
  old_password: [{ validator: validateOldPwd, trigger: 'blur' }],
  password: [{ validator: validatePwd, trigger: 'blur' }],
  repassword: [{ validator: validateRePwd, trigger: 'blur' }]
})
const form = reactive<userEditForm>({
  user_id: 0,
  action: '',
  username: '',
  old_password: '',
  password: '',
  repassword: '',
  status: 0,
  role_ids: []
})
const roles = ref([] as RoleItem[])
const buttonLoading = ref(false)
const getRoles = () => {
  allRole().then(res => {
    roles.value = res.data
  })
}
const reset = () => {
  form.user_id = 0
  form.action = ''
  form.username = ''
  form.old_password = ''
  form.password = ''
  form.repassword = ''
  form.status = 0
  form.role_ids = []
}

const dialogClose = (formEl: FormInstance | undefined) => {
  dialogFormVisible.value = false
  formEl?.resetFields()
  reset()
}
const handleAdd = () => {
  title.value = "添加用户"
  reset()
  dialogFormVisible.value = true
}
const handleReset = (user_id: number) => {
  reset()
  getUserInfoById(user_id).then(res => {
    form.user_id = res.data.user_id
    form.action = "edit-pwd"
    dialogFormVisible.value = true
    title.value = "重置密码"
  })
}
const handleEdit = (user_id: number) => {
  reset()
  getUserInfoById(user_id).then(res => {
    form.user_id = res.data.user_id
    form.username = res.data.username
    form.status = res.data.status
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
          dialogClose(editFormRef.value)
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
            dialogClose(editFormRef.value)
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
            dialogClose(editFormRef.value)
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
