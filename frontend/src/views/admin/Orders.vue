<template>
    <div class="orders-container">
        <div class="header">
            <h2>订单列表</h2>
        </div>

        <el-table :data="orderList" style="width: 100%" v-loading="loading">
            <el-table-column prop="orderNumber" label="订单编号" width="180" />
            <el-table-column prop="shippingId" label="收货地址" width="120" />
            <el-table-column prop="totalAmount" label="商品总数" width="100" />
            <el-table-column prop="createdTime" label="创建时间" width="180" />
            <el-table-column prop="orderStatus" label="订单状态" width="120">
                <template #default="scope">
                    <el-tag :type="getTagType(scope.row.orderStatus)">
                        {{ getOrderStatusText(scope.row.orderStatus) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="itemCount" label="商品数量" width="100" />
            <el-table-column prop="totalPrice" label="订单总价" width="120">
                <template #default="scope">
                    ¥{{ scope.row.totalPrice.toFixed(2) }}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const orderList = ref([])


// 获取订单列表
const getOrders = async () => {
    loading.value = true
    try {
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/admin/order')
        if (response.data.code === 200) {
            orderList.value = response.data.data
            console.log(orderList.value)
        } else {
            ElMessage.error(response.data.msg || '获取订单列表失败')
        }
    } catch (error) {
        console.error('获取订单列表错误:', error)
        ElMessage.error('获取订单列表失败')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    getOrders()
})

// 添加以下函数来处理订单状态的显示
const getTagType = (status) => {
    const typeMap = {
        'PENDING': 'warning',
        'PAID': 'success',
        'SHIPPED': 'primary',
        'COMPLETED': 'success',
        'CANCELLED': 'danger'
    }
    return typeMap[status] || 'info'
}

const getOrderStatusText = (status) => {
    const textMap = {
        'PENDING': '待付款',
        'PAID': '已付款',
        'SHIPPED': '已发货',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
    }
    return textMap[status] || status
}
</script>

<style scoped>
.orders-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
}

.header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    font-size: 20px;
}
</style>