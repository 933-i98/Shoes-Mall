<template>
    <div class="login-container">
        <div class="login-content">
            <!-- 左侧品牌区域 -->
            <div class="brand-section">
                <h1 class="brand-slogan">后台管理系统</h1>
                <p class="brand-desc">管理员登录入口</p>
            </div>

            <!-- 右侧登录区域 -->
            <div class="login-section">
                <div class="login-box">
                    <h2>管理员登录</h2>
                    <p class="welcome-text">请输入管理员账号密码</p>

                    <el-form ref="formRef" :model="loginForm" :rules="rules" @submit.prevent="handleLogin">
                        <el-form-item prop="phonenumber">
                            <el-input v-model="loginForm.phonenumber" placeholder="请输入管理员手机号码" :prefix-icon="Phone"
                                size="large" />
                        </el-form-item>

                        <el-form-item prop="password">
                            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"
                                :prefix-icon="Lock" size="large" show-password />
                        </el-form-item>

                        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">
                            登录
                        </el-button>

                        <div class="register-link">
                            <el-link type="primary" @click="$router.push('/login')">
                                返回用户登录
                            </el-link>
                        </div>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Phone, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
    phonenumber: '',
    password: '',
})

const rules = {
    phonenumber: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
    ]
}

const handleLogin = async () => {
    try {
        loading.value = true
        const response = await axios.post('http://22f8a8d6.r25.cpolar.top/admin/login', {
            account: loginForm.phonenumber,
            password: loginForm.password,
        })

        if (response.data.code === 200) {
            ElMessage.success('登录成功')
            localStorage.setItem('token', response.data.data)
            router.push('/admin')
        } else {
            ElMessage.error(response.data.message || '登录失败')
        }
    } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}

.login-content {
    display: flex;
    width: 1000px;
    height: 600px;
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.brand-section {
    flex: 1;
    background: linear-gradient(135deg, #1a237e 0%, #303f9f 100%);
    /* 修改为深蓝色主题 */
    color: white;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.login-section {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #fff;
}

.login-box {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.login-box h2 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #333;
}

.welcome-text {
    color: #666;
    font-size: 14px;
    margin-bottom: 30px;
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    padding: 1px 11px;
    border-radius: 4px;
    width: 100%;
    background-color: #fff;
    display: flex;
    align-items: center;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #303f9f inset;
    /* 修改为深蓝色 */
}

:deep(.el-input__inner) {
    height: 36px !important;
    line-height: 36px !important;
    font-size: 14px;
    padding: 0;
    margin: 0;
}

:deep(.el-input__prefix) {
    display: flex;
    align-items: center;
    margin-right: 8px;
}

/* 登录按钮 */
.submit-btn {
    width: 100%;
    height: 40px;
    font-size: 15px;
    background: #1a237e;
    /* 修改为深蓝色 */
    border: none;
    margin: 20px 0;
    border-radius: 4px;
}

.submit-btn:hover {
    background: #303f9f;
    /* 修改为较浅的深蓝色 */
}

/* 返回链接 */
.register-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
}

.register-link .el-link {
    margin-left: 5px;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-form-item) {
    margin-bottom: 20px;
}

:deep(.el-button--primary) {
    background: #1a237e;
    /* 修改为深蓝色 */
    border: none;
}

:deep(.el-button--primary:hover) {
    background: #303f9f;
    /* 修改为较浅的深蓝色 */
}

:deep(.el-link) {
    font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 1024px) {
    .login-content {
        width: 90%;
        height: auto;
        flex-direction: column;
    }

    .brand-section {
        padding: 30px;
    }

    .login-section {
        padding: 30px;
    }
}
</style>