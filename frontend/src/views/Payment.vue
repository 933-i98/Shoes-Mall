<template>
    <div class="payment-container">
        <el-button class="back-button" @click="$router.back()" :icon="ArrowLeft">返回</el-button>

        <el-card class="payment-card">
            <template #header>
                <div class="payment-header">
                    <h2>订单支付</h2>
                </div>
            </template>

            <div class="payment-content">
                <div class="order-info">
                    <p class="order-number">订单编号：{{ orderId }}</p>
                </div>

                <div class="payment-qr">
                    <h3>请使用支付宝扫码支付</h3>
                    <div class="qr-wrapper" v-loading="isLoading">
                        <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="支付宝支付二维码" />
                    </div>
                </div>

                <div class="payment-status">
                    <p v-if="paymentStatus === 'pending'" class="status-text">等待支付...</p>
                    <p v-else-if="paymentStatus === 'success'" class="status-success">支付成功！</p>
                    <p v-else-if="paymentStatus === 'failed'" class="status-failed">支付失败，请重试</p>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const orderId = ref('')
const qrCodeUrl = ref('')
const isLoading = ref(true)
const paymentStatus = ref('pending')
let checkPaymentTimer = null

// 获取支付二维码
const getPaymentQRCode = async () => {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('请先登录')
            return
        }

        const response = await axios.get(`http://22f8a8d6.r25.cpolar.top/pay/getQRCode/${orderId.value}`, {
            headers: {
                'Authorization': token
            }
        })

        if (response.data.code === 200) {
            qrCodeUrl.value = response.data.data
            isLoading.value = false
            // 开始轮询支付状态
            startCheckingPaymentStatus()
        } else {
            ElMessage.error(response.data.message || '获取支付二维码失败')
        }
    } catch (error) {
        ElMessage.error('获取支付二维码失败')
        console.error('获取支付二维码失败:', error)
        isLoading.value = false
    }
}

// 检查支付状态
const checkPaymentStatus = async () => {
    try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await axios.get(`http://22f8a8d6.r25.cpolar.top/pay/checkStatus/${orderId.value}`, {
            headers: {
                'Authorization': token
            }
        })

        if (response.data.code === 200) {
            if (response.data.data === 'PAID') {
                paymentStatus.value = 'success'
                stopCheckingPaymentStatus()
                ElMessage.success('支付成功！')
                // 延迟跳转到订单页面
                setTimeout(() => {
                    router.push('/orders')
                }, 2000)
            }
        }
    } catch (error) {
        console.error('检查支付状态失败:', error)
    }
}

// 开始轮询支付状态
const startCheckingPaymentStatus = () => {
    checkPaymentTimer = setInterval(checkPaymentStatus, 3000) // 每3秒检查一次
}

// 停止轮询
const stopCheckingPaymentStatus = () => {
    if (checkPaymentTimer) {
        clearInterval(checkPaymentTimer)
        checkPaymentTimer = null
    }
}

onMounted(() => {
    orderId.value = route.query.orderId
    if (!orderId.value) {
        ElMessage.error('订单编号不存在')
        router.push('/')
        return
    }
    getPaymentQRCode()
})

onUnmounted(() => {
    stopCheckingPaymentStatus()
})
</script>

<style scoped>
.payment-container {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
    margin-top: 100px;
}

.payment-card {
    margin-bottom: 20px;
}

.payment-header {
    text-align: center;
}

.payment-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

.order-info {
    margin-bottom: 30px;
    width: 100%;
    text-align: center;
}

.order-number {
    font-size: 18px;
    color: #606266;
}

.payment-qr {
    text-align: center;
    margin-bottom: 30px;
}

.qr-wrapper {
    margin-top: 20px;
    width: 200px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.qr-wrapper img {
    max-width: 100%;
    max-height: 100%;
}

.payment-status {
    margin-top: 20px;
    text-align: center;
}

.status-text {
    color: #909399;
}

.status-success {
    color: #67C23A;
    font-weight: bold;
}

.status-failed {
    color: #F56C6C;
    font-weight: bold;
}

.back-button {
    margin-bottom: 20px;
}
</style>