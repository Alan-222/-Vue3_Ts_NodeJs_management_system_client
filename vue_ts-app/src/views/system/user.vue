<template>
  <div class="content-title">用户管理</div>
  <div class="content-container">
    <el-form class="table-Handler" :model="queryParams" ref="queryFormRef">
      <el-row :gutter="15">
        <el-col :span="1.5">
          <el-button color="#3c8dbc" :icon="CirclePlus" v-hasPerm="['system:user:add']" @click="handleAdd">新增
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button color="#3c8dbc" :icon="Remove" @click="handleDelete" v-hasPerm="['system:user:del']"
            :disabled="select.multiple">批量删除</el-button>
        </el-col>
        <el-col :span="4">
          <el-form-item prop="name" label="用户名">
            <el-input placeholder="请输入用户名" v-model="queryParams.username" v-hasPerm="['system:user:query']"
              @keyup.enter="handleQuery"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item label="状态" prop="status" v-hasPerm="['system:user:query']">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable v-hasPerm="['system:user:query']">
              <el-option key="-1" label="全部" :value="undefined" />
              <el-option key="1" label="启用" :value="1" />
              <el-option key="0" label="停用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="1.5">
          <el-button color="#3c8dbc" :icon="Search" v-hasPerm="['system:user:query']" @click="handleQuery">搜索
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button color="#3c8dbc" :icon="Refresh" v-hasPerm="['system:user:query']"
            @click="resetQuery(queryFormRef)">重置</el-button>
        </el-col>
      </el-row>
    </el-form>
    <el-table ref="multipleTableRef" :data="tableData.data" v-loading="loading" highlight-current-row border
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="user_id" label="用户编号" align="center" />
      <el-table-column prop="username" label="用户帐号" align="center" />
      <el-table-column prop="roles" label="角色" align="center">
        <template #default="scope">
          {{ role_name(scope.row.roles) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'" disable-transitions>{{ scope.row.status ? '启用' :
              '停用'
          }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间" align="center" />
      <el-table-column fixed="right" label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" size="small" v-hasPerm="['system:user:edit']"
            @click="handleEdit(scope.row.user_id)">
            编辑</el-button>
          <el-button link type="primary" size="small" v-hasPerm="['system:user:del']" @click="handleDelete(scope.row)">
            删除</el-button>
          <el-button link type="primary" size="small" v-hasPerm="['system:user:edit']"
            @click="handleReset(scope.row.user_id)">重置密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-model:currentPage="queryParams.currentPage" v-model:page-size="queryParams.pageSize"
      :page-sizes="[1, 3, 5, 10]" layout="total, sizes, prev, pager, next, jumper" :total="userTotal"
      @size-change="handleSizeChange" @current-change="handleCurrentChange" style="margin-top: 20px;" />
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
        <el-form-item v-if="form.action !== 'edit-pwd'" label="角色" prop="role_ids">
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
import { CirclePlus, Refresh, Search, Remove } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, computed } from 'vue'
import { ElTable, ElMessageBox, ElMessage, FormInstance } from 'element-plus'
import { listUser, addUser, updateUser, updatePwd, delUser, getUserInfoById } from '@/utils/API/user/user'
import { allRole } from '@/utils/API/user/role'
import { useStore } from '@/store'
/**
 * 调用获取用户列表
 */
onMounted(() => {
  // 获取用户列表
  getListUser()
  // 获取角色
  getRoles()
})
// 获取vuex
const store = useStore()
/**
 * 获取用户列表
 */
// 分页参数
const queryParams = reactive<userQueryParams>({
  currentPage: 1,    // 当前页
  pageSize: 10,       // 每页条数
  username: undefined,
  status: undefined
})
const queryFormRef = ref<FormInstance>()
let userTotal = ref(0) // 数据总条数
let loading = ref(false)
let tableData = reactive({ data: [] })
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
// 多选框选中数据
const select = reactive({
  // 未选中禁用
  multiple: true,
  ids: []
})
const handleSelectionChange = (selection: any) => {
  select.ids = selection.map((item: any) => item.user_id);
  select.multiple = !selection.length;
}
// 角色数据转换为角色名称
let role_name = computed(() =>
  (roles: any) => roles.map((item: any) => item.role_name)
)
// 按照分页显示数据的函数
const getListUser = () => {
  loading.value = true
  // 发送ajax请求 把分页数据发送给后端
  listUser(queryParams)
    .then(res => {
      console.log(res);
      // 接收后端返回的数据总条数 total 和 对应页码的数据 data
      let { count, rows } = res.data;
      // 赋值给对应的变量即可
      userTotal.value = count;
      tableData.data = rows;
      // 如果当前页没有数据 且 排除第一页
      if (!rows.length && queryParams.currentPage !== 1) {
        // 页码减去 1
        queryParams.currentPage -= 1;
        // 再调用自己
        getListUser();
      }
    })
    .finally(() => {
      loading.value = false
    })
}
// 每页显示条数改变 就会触发这个函数
const handleSizeChange = (val: number) => {
  // 保存每页显示的条数
  queryParams.pageSize = val;
  queryParams.currentPage = 1;
  // 调用分页函数
  getListUser();
}
// 当前页码改变 就会触发这个函数
const handleCurrentChange = (val: number) => {
  // 保存当前页码
  queryParams.currentPage = val;
  // 调用分页函数
  getListUser();
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
  role_ids: [
    { required: true, message: '请选择角色', trigger: 'change', type: 'array' }
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
const resetQuery = (formEl: FormInstance | undefined) => {
  queryParams.username = undefined
  queryParams.status = undefined
  formEl?.resetFields()
  getListUser();
}
const dialogClose = (formEl: FormInstance | undefined) => {
  dialogFormVisible.value = false
  formEl?.resetFields()
  reset()
}
const handleQuery = () => {
  queryParams.currentPage = 1
  getListUser()
}
const handleAdd = () => {
  title.value = "添加用户"
  reset()
  dialogFormVisible.value = true
}
const handleReset = (user_id: number) => {
  loading.value = true
  reset()
  getUserInfoById(user_id).then(res => {
    loading.value = false
    form.user_id = res.data.user_id
    form.action = "edit-pwd"
    dialogFormVisible.value = true
    title.value = "重置密码"
  })
}
const handleEdit = (user_id: number) => {
  loading.value = true
  reset()
  getUserInfoById(user_id).then(res => {
    loading.value = false
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
const handleDelete = (row: { [key: string]: any }) => {
  const userIds = row.user_id || select.ids
  console.log(userIds);

  ElMessageBox.confirm(
    '是否确认删除用户编号为「' + userIds + '」的数据项?',
    'Warning',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    loading.value = true
    delUser({ user_ids: userIds }).then(res => {
      loading.value = false
      ElMessage.success(
        '删除成功'
      )
      const totalPage = Math.ceil((userTotal.value - 1) / queryParams.pageSize) // 总页数
      queryParams.currentPage = queryParams.currentPage > totalPage ? totalPage : queryParams.currentPage
      queryParams.currentPage = queryParams.currentPage < 1 ? 1 : queryParams.currentPage
      getListUser()
    })
      .finally(() => {
        loading.value = false
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

<style lang="scss" scoped>

</style>