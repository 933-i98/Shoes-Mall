<template>
    <div class="login-container">
        <el-card class="login-card">
            <!-- 标题区域 -->
            <div class="login-header">
                <el-avatar :size="60" :icon="User" />
                <h2>管理员登录</h2>
            </div>

            <!-- 表单区域 -->
            <el-form ref="formRef" :model="loginForm" :rules="rules" label-position="top" @submit.prevent="handleLogin">
                <el-form-item prop="username" label="管理员账号">
                    <el-input v-model="loginForm.username" :prefix-icon="User" placeholder="请输入管理员账号" />
                </el-form-item>

                <el-form-item prop="password" label="密码">
                    <el-input v-model="loginForm.password" :prefix-icon="Lock" type="password" placeholder="请输入密码"
                        show-password />
                </el-form-item>

                <div class="remember-forgot">
                    <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                    <el-link type="primary">忘记密码？</el-link>
                </div>

                <el-form-item>
                    <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 底部链接 -->
            <div class="bottom-links">
                <el-text>普通用户？</el-text>
                <el-link type="primary" @click="$router.push('/login')">
                    去用户登录
                </el-link>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
    username: '',
    password: ''
})

const rules = {
    username: [
        { required: true, message: '请输入管理员账号', trigger: 'blur' },
        { min: 3, message: '账号长度至少为3个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
    ]
}

const handleLogin = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true
                // 这里应该调用管理员登录API
                await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
                localStorage.setItem('token', 'admin-token')
                localStorage.setItem('isAdmin', 'true')
                ElMessage.success('登录成功')
                router.push('/admin')
            } catch (error) {
                ElMessage.error('登录失败，请检查账号密码')
            } finally {
                loading.value = false
            }
        }
    })
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
}

.login-card {
    width: 420px;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h2 {
    margin-top: 15px;
    color: #303133;
    font-size: 24px;
}

.remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.submit-btn {
    width: 100%;
    padding: 12px;
    font-size: 16px;
}

.bottom-links {
    margin-top: 20px;
    text-align: center;
}

:deep(.el-input__wrapper) {
    padding: 8px 15px;
}

:deep(.el-form-item__label) {
    font-weight: 500;
}

:deep(.el-button--primary) {
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    border: none;
    transition: all 0.3s;
}

:deep(.el-button--primary:hover) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}
</style>