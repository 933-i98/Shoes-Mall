<template>
    <div class="register-container">
        <div class="register-content">
            <!-- 左侧品牌区域 -->
            <div class="brand-section">
                <h1 class="brand-slogan">SHOES MALL</h1>
                <p class="brand-desc">加入我们，开启你的高品味之旅</p>
            </div>

            <!-- 右侧注册区域 -->
            <div class="register-section">
                <div class="register-box">
                    <h2>注册账号</h2>
                    <p class="welcome-text">欢迎加入，请填写注册信息</p>

                    <el-form ref="formRef" :model="registerForm" :rules="rules" @submit.prevent="handleRegister">

                        <el-form-item prop="phonenumber">
                            <el-input v-model="registerForm.phonenumber" placeholder="请输入手机号码" :prefix-icon="Phone"
                                size="large" />
                        </el-form-item>

                        <el-form-item prop="password">
                            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"
                                :prefix-icon="Lock" size="large" show-password />
                        </el-form-item>


                        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister">
                            注册
                        </el-button>

                        <div class="login-link">
                            <span>已有账号？</span>
                            <el-link type="primary" @click="$router.push('/login')">
                                立即登录
                            </el-link>
                        </div>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Phone, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const captchaUrl = ref('')
const captchaId = ref('')

const registerForm = reactive({
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
    ],

}


// 注册处理
const handleRegister = async () => {
    try {
        loading.value = true
        const response = await axios.post('http://22f8a8d6.r25.cpolar.top/user/register', {
            phoneNumber: registerForm.phonenumber,
            password: registerForm.password
        })

        if (response.data.code === 200) {
            ElMessage.success('注册成功')
            router.push('/login')
        } else {
            ElMessage.error(response.data.message)
        }
    } catch (error) {
        ElMessage.error('注册失败，请稍后重试')
    } finally {
        loading.value = false
    }
}

</script>

<style scoped>
.register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}

.register-content {
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
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: white;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.register-section {
    flex: 1;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #fff;
}

.register-box h2 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #333;
}

.welcome-text {
    color: #666;
    font-size: 14px;
    margin-bottom: 30px;
}

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
    box-shadow: 0 0 0 1px #409eff inset;
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

.captcha-container {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
}

.captcha-container .el-input {
    flex: 1;
}

.captcha-img {
    height: 36px;
    width: 120px;
    cursor: pointer;
    border-radius: 4px;
}

.submit-btn {
    width: 100%;
    height: 40px;
    font-size: 15px;
    background: #000;
    border: none;
    margin: 20px 0;
    border-radius: 4px;
}

.submit-btn:hover {
    background: #333;
}

.login-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
}

.login-link .el-link {
    margin-left: 5px;
}

:deep(.el-form-item) {
    margin-bottom: 20px;
}
</style>
