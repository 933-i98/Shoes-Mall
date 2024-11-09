<template>
    <div class="login-container">
        <div class="login-content">
            <!-- 左侧品牌区域 -->
            <div class="brand-section">
                <h1 class="brand-slogan">SHOES MALL</h1>
                <p class="brand-desc">加入我们，开启你的高品味之旅</p>
            </div>

            <!-- 右侧登录区域 -->
            <div class="login-section">
                <div class="login-box">
                    <h2>登录账号</h2>
                    <p class="welcome-text">欢迎回来，请登录你的账号</p>

                    <!-- 添加登录方式切换 -->
                    <div class="login-type-switch">
                        <el-radio-group v-model="loginType" size="large">
                            <el-radio-button label="account">账号登录</el-radio-button>
                            <el-radio-button label="wechat">微信登录</el-radio-button>
                        </el-radio-group>
                    </div>

                    <!-- 账号密码登录表单 -->
                    <el-form v-if="loginType === 'account'" ref="formRef" :model="loginForm" :rules="rules"
                        @submit.prevent="handleLogin">
                        <el-form-item prop="phonenumber">
                            <el-input v-model="loginForm.phonenumber" placeholder="请输入手机号码" :prefix-icon="Phone"
                                size="large" />
                        </el-form-item>

                        <el-form-item prop="password">
                            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"
                                :prefix-icon="Lock" size="large" show-password />
                        </el-form-item>



                        <el-form-item prop="code">
                            <div class="captcha-container">
                                <el-input v-model="loginForm.code" placeholder="请输入验证码" :prefix-icon="Key"
                                    size="large" />
                                <img :src="captchaUrl" class="captcha-img" @click="refreshCaptcha" alt="验证码" />
                            </div>
                        </el-form-item>


                        <el-button type="primary" :loading="loading" class="submit-btn" @click="handleLogin">
                            登录
                        </el-button>

                        <div class="register-link">
                            <span>还没有账号？</span>
                            <el-link type="primary" @click="$router.push('/Register')">
                                立即注册
                            </el-link>
                            <el-divider direction="vertical" />
                            <el-link type="primary" @click="$router.push('/admin/login')">
                                管理员登录
                            </el-link>
                        </div>
                    </el-form>

                    <!-- 微信扫码登录区域 -->
                    <div v-else class="wechat-login-container">
                        <div class="qrcode-box">
                            <img :src="wximg" alt="微信扫码登录" class="qrcode-img" />
                        </div>
                        <p class="scan-tip">请使用微信扫一扫登录</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Phone, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)
const captchaUrl = ref('')
const captchaId = ref('')

// 添加登录方式切换变量
const loginType = ref('account')
const wximg = ref('')

const loginForm = reactive({
    phonenumber: '',
    password: '',
    code: ''
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
    code: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 4, message: '验证码长度为4位', trigger: 'blur' }
    ]
}

// 获取验证码
const getCaptcha = async () => {
    try {
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/user/getCaptcha')
        if (response.data.code === 200) {
            // 将Base64格式的验证码图片数据赋值给captchaUrl
            captchaUrl.value = 'data:image/gif;base64,' + response.data.data.img
            captchaId.value = response.data.data.captchaId
        }
    } catch (error) {
        ElMessage.error('获取验证码失败')
    }
}

// 刷新验证码
const refreshCaptcha = () => {
    getCaptcha()
}

// 登录处理
const handleLogin = async () => {
    try {
        loading.value = true
        const response = await axios.post('http://22f8a8d6.r25.cpolar.top/user/login', {
            phoneNumber: loginForm.phonenumber,
            password: loginForm.password,
            code: loginForm.code,
            captchaId: captchaId.value
        })

        if (response.data.code === 200) {
            ElMessage.success('登录成功')
            localStorage.setItem('token', response.data.data)
            router.push('/home')
        } else if (response.data.code === 400) {
            ElMessage.error(response.data.message)
            refreshCaptcha()
        } else {
            ElMessage.error('登录失败')
            refreshCaptcha()
        }
    } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
        refreshCaptcha()
    } finally {
        loading.value = false
    }
}

// 获取微信登录二维码的新方法
const getWeiXinMa = async () => {
    try {
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/user/getwechatcode')
        if (response.data.code === 200) {
            sessionStorage.setItem("state", response.data.data.state)
            wximg.value = "data:image/png;base64," + response.data.data.img
            window.setTimeout(startCheck, 2000)
        }
    } catch (error) {
        ElMessage.error('获取二维码失败')
    }
}

const checkTimer = ref(null) // 添加定时器引用

const startCheck = async () => {
    const key = sessionStorage.getItem("state")

    const check = async () => {
        try {
            const response = await axios.get('http://22f8a8d6.r25.cpolar.top/user/checkLogin', {
                params: {
                    state: key
                }
            })
            if (response.data.code === 200) {
                // 登录成功，清除定时器
                clearInterval(checkTimer.value)

                // 设置token并移除state
                localStorage.setItem('token', response.data.data)
                sessionStorage.removeItem("state")

                ElMessage.success("登录成功")
                router.push("/home")
            }
        } catch (error) {
            console.error("检查登录状态失败:", error)
        }
    }

    // 立即执行一次检查
    await check()

    // 设置定时器，每5秒检查一次
    checkTimer.value = setInterval(check, 5000)
}

// 在组件卸载时清除定时器
onUnmounted(() => {
    if (checkTimer.value) {
        clearInterval(checkTimer.value)
    }
})

// 修改监听登录方式切换的逻辑
watch(loginType, (newValue) => {
    if (newValue === 'wechat') {
        getWeiXinMa()
    }
})

onMounted(() => {
    getCaptcha()
})
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
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
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

/* 验证码区域 */
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

/* 记住我和忘记密码 */
.remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0;
}

/* 登录按钮 */
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

/* 注册链接 */
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
    background: #000;
    border: none;
}

:deep(.el-button--primary:hover) {
    background: #333;
}

:deep(.el-checkbox__label) {
    color: #666;
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

.login-type-switch {
    text-align: center;
    margin-bottom: 30px;
}

.wechat-login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
}

.qrcode-box {
    width: 200px;
    height: 200px;
    margin: 20px auto;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 4px;
}

.qrcode-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.scan-tip {
    color: #666;
    font-size: 14px;
    text-align: center;
    margin-top: 15px;
}
</style>