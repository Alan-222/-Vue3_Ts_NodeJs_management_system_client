<template>
  <div class="loginbody">
    <div class="logindata">
      <div class="logintext">
        <h2>Welcome</h2>
      </div>
      <div class="form">
        <el-form ref="ruleFormRef" :model="form" :rules="rules">
          <el-form-item prop="username">
            <el-input v-model="form.username" clearable placeholder="请输入账号"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" clearable placeholder="请输入密码" show-password></el-input>
          </el-form-item>
          <el-form-item prop="checkCode">
            <el-input v-model="form.checkCode" placeholder="请输入验证码" class="login-code-input" maxlength="4" minlength="4"
              clearable></el-input>
            <div class="login-code" @click="getCode" v-html="verifyImg">
            </div>
          </el-form-item>
          <el-form-item prop="remember">
            <el-checkbox v-model="form.remember" class="check-box">记住密码</el-checkbox>
          </el-form-item>
        </el-form>
      </div>
      <div class="butt">
        <el-button :loading="loading" type="primary" @click="submitForm(ruleFormRef)">登录</el-button>
        <el-button @click="ruleFormRef?.resetFields()">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default { name: 'Login' };
</script>
<script lang="ts" setup>
import { ref, reactive, toRefs, watch, onMounted } from 'vue'
import router from '@/router'
import type { FormInstance, FormRules } from 'element-plus'
import { useStore } from '@/store'
import { useRoute } from 'vue-router'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { getCheckCode } from '@/utils/API/user/user'

// 获取state、route
const store = useStore()
const route = useRoute()
// 要重定向的地址
const redirect = ref(undefined as string | undefined)
// 重定向路由其它query信息
const otherQuery = ref({})
// 登录变量、方法
const loading = ref(false)
const ruleFormRef = ref<FormInstance>()
const form = reactive<loginForm>({
  username: '',
  password: '',
  checkCode: '',
  remember: false,
  uuid: 0
})
// 验证码图片
let verifyImg = ref('')
const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  checkCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }, { min: 4, max: 4, message: '长度为4个字符！', trigger: 'blur' }],
})
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      // 记住密码存储用户信息
      if (form.remember) {
        Cookies.set('username', form.username, { expires: 7 })
        Cookies.set('password', encrypt(form.password), { expires: 7 })
        Cookies.set('remember', form.remember, { expires: 7 })
      } else {
        // 移除用户信息
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('remember')
      }
      store.dispatch('user/login', form).then(() => {
        router.push({ path: redirect.value || '/', query: otherQuery.value })
        loading.value = false
      })
        .catch(() => {
          getCode()
          loading.value = false
        })
    }
  })
}
// 监听重定向信息
watch(
  route,
  () => {
    const query = route.query;
    if (query) {
      redirect.value = query.redirect as string;
      otherQuery.value = getOtherQuery(query);
    }
  },
  {
    immediate: true
  }
);
// 获取重定向query其它信息
function getOtherQuery(query: any) {
  return Object.keys(query).reduce((acc: any, cur: any) => {
    if (cur !== 'redirect') {
      acc[cur] = query[cur];
    }
    return acc;
  }, {});
}
// 获取cookie中的用户名密码信息
function getCookie() {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const remember = Cookies.get('remember')

  form.username = username === undefined ? form.username : username
  form.password = password === undefined ? form.password : decrypt(password)
  form.remember = remember === undefined ? form.remember : Boolean(remember)
}
// 获取验证码
function getCode() {
  const uuid = new Date().getTime()
  form.uuid = uuid
  getCheckCode(uuid).then(res => {
    verifyImg.value = res.data
  })
}
onMounted(() => {
  getCode()
  getCookie()
})
</script>

<style lang="scss" scoped>
.loginbody {
  width: 100%;
  height: 100%;
  background-image: url('../assets/images/cool-background.png');
  background-size: cover;
  background-repeat: no-repeat;
  position: fixed;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logintext {
  margin-bottom: 20px;
  line-height: 50px;
  text-align: center;
  font-size: 30px;
  font-weight: bolder;
  color: #fbffc8;
  text-shadow: 2px 2px 4px #000000;
}

.logindata {
  width: 400px;
  height: 300px;
  margin-bottom: 150px;
}

.form {
  width: 100%;

  .el-input {
    font-size: 16px;
    width: 100%;
    height: 40px;
    line-height: 40px;
  }

  .login-code-input {
    position: relative;
  }

  .login-code {
    position: absolute;
    right: 6px;
    top: 4px;
    vertical-align: center;
    width: 100px;
    height: 32px;
    cursor: pointer;
    vertical-align: middle;

  }

  .check-box {
    font-size: 16px;
    font-weight: 600
  }
}

.tool {
  display: flex;
  justify-content: space-between;
  color: #606266;
}

.butt {
  font-size: 16px;
  margin-top: 10px;
  text-align: center;
}

.shou {
  cursor: pointer;
  color: #606266;
}
</style>
