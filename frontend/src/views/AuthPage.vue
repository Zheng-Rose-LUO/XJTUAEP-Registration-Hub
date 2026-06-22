<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-logo">
        <span class="logo-dot"></span>
        <span class="logo-text">越杰社区</span>
      </div>
      <h2 class="auth-title">{{ isLogin ? '欢迎回来' : '加入越杰' }}</h2>
      <p class="auth-sub">{{ isLogin ? '登录你的越杰账号' : '创建你的越杰账号' }}</p>

      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" size="large" />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" size="large" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password size="large" />
        </el-form-item>
        <el-button class="submit-btn" @click="submit" :loading="loading">
          {{ isLogin ? '登 录' : '注 册' }}
        </el-button>
      </el-form>

      <div class="auth-switch">
        <span @click="isLogin = !isLogin; formRef?.resetFields()">
          {{ isLogin ? '还没有账号？去注册 →' : '已有账号？去登录 →' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref(true)
const loading = ref(false)
const formRef = ref()
const form = reactive({ phone: '', password: '', name: '' })

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

async function submit() {
  await formRef.value.validate()
  loading.value = true
  try {
    const url = isLogin.value ? '/api/auth/login' : '/api/auth/register'
    const { data } = await axios.post(url, form)
    if (isLogin.value) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.userId)
      ElMessage.success('登录成功')
      router.push('/home')
    } else {
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      formRef.value.resetFields()
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background: #F8F9FA;
}
.auth-card {
  width: 420px; background: #fff; border-radius: 16px;
  padding: 40px 40px 32px;
  box-shadow: 0 8px 40px rgba(134,121,251,0.10);
}
.auth-logo {
  display: flex; align-items: center; gap: 8px; margin-bottom: 28px;
}
.logo-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #8679FB; display: inline-block;
}
.logo-text { font-size: 15px; font-weight: 700; color: #344054; }
.auth-title { font-size: 24px; font-weight: 700; color: #344054; margin: 0 0 6px; }
.auth-sub { font-size: 14px; color: #9099A6; margin: 0 0 28px; }
.submit-btn {
  width: 100%; height: 44px; margin-top: 8px;
  background: #8679FB; border: none; border-radius: 8px;
  color: #fff; font-size: 15px; font-weight: 600; cursor: pointer;
}
.submit-btn:hover { background: #7468e8; }
.auth-switch {
  text-align: center; margin-top: 20px;
  font-size: 13px; color: #8679FB; cursor: pointer;
}
.auth-switch span:hover { text-decoration: underline; }
</style>
