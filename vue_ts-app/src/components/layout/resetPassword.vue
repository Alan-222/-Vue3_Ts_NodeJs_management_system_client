<template>
  <div>
    <el-form ref="ruleFormRef" :model="user" :rules="rules" label-width="80px">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input v-model="user.old_password" placeholder="请输入旧密码" type="password" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="user.password" placeholder="请输入新密码" type="password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="user.repassword" placeholder="请确认密码" type="password" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close(ruleFormRef)">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)">保存</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, FormInstance } from 'element-plus'
import { updatePwd } from '@/utils/API/user/user';
import { store } from '@/store';
import router from '@/router';
// 引入弹窗关闭的方法
const emit = defineEmits(['closeDialog'])
// 表单实例
const ruleFormRef = ref<FormInstance>()
// 表单数据对象
const user = reactive<resetpass>({
  old_password: '',
  password: '',
  repassword: ''
})
// 校验信息对象
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (user.repassword !== '') {
      if (!ruleFormRef.value) return
      ruleFormRef.value.validateField('confirmPassword', () => null)
    }
    callback()
  }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入确认密码'))
  } else if (value !== user.password) {
    callback(new Error("两次输入的密码不匹配！"))
  } else {
    callback()
  }
}
// 校验规则
const rules = reactive({
  old_password: [
    { required: true, message: "旧密码不能为空", trigger: "blur" }
  ],
  password: [{ validator: validatePass, trigger: 'blur' }],
  repassword: [{ validator: validatePass2, trigger: 'blur' }],
})
// 提交表单的方法
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    const form = {
      user_id: store.state.user.user_id,
      ...user
    }
    if (valid) {
      updatePwd(form).then(res => {
        ElMessage.success('重置密码成功')
        // 重置密码后重新登录
        store.dispatch('user/FedLogOut').then(() => {
          router.push('/login')
        });
        emit('closeDialog')
      })
    }
  })
}
// 关闭弹窗的方法
const close = (formEl: FormInstance | undefined) => {
  // 清空弹窗
  formEl?.resetFields()
  emit('closeDialog')
}

</script>

