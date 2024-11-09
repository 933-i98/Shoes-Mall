<template>
    <div class="cart-container">
        <el-button class="back-button" @click="$router.back()" :icon="ArrowLeft">返回</el-button>

        <el-card class="cart-card">
            <template #header>
                <div class="cart-header">
                    <h2>我的购物车</h2>
                    <div class="cart-summary">
                        <span>共 {{ getTotalQuantity }} 件商品</span>
                        <span class="total-price">总计：¥{{ getTotalPrice }}</span>
                    </div>
                </div>
            </template>

            <div class="cart-items">
                <el-empty v-if="!cartItems.length" description="购物车是空的" />

                <el-table v-else :data="cartItems" style="width: 100%">
                    <el-table-column label="商品" prop="productInfo.productName">
                        <template #default="{ row }">
                            <div class="product-info">
                                <el-image :src="row.productInfo.imageUrl" style="width: 80px; height: 80px"
                                    fit="cover" />
                                <span>{{ row.productInfo.productName }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="单价" prop="productInfo.price">
                        <template #default="{ row }">
                            <span>¥{{ row.productInfo.price }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="数量" width="150">
                        <template #default="{ row }">
                            <el-input-number v-model="row.cartInfo.quantity" :min="1" :max="99"
                                @change="updateQuantity(row)" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120">
                        <template #default="{ row }">
                            <el-button type="danger" @click="removeItem(row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <div v-if="cartItems.length" class="cart-footer">
                    <el-button type="primary" size="large" @click="submitOrder">提交订单</el-button>
                </div>
            </div>
        </el-card>

        <!-- 添加地址选择对话框 -->
        <el-dialog v-model="addressDialog.visible" title="选择收货地址" width="500px">
            <div v-if="addresses.length === 0" class="no-address">
                <el-empty description="暂无收货地址">
                    <el-button type="primary" @click="goToAddAddress">添加地址</el-button>
                </el-empty>
            </div>
            <div v-else class="address-list">
                <el-radio-group v-model="selectedAddressId">
                    <div v-for="address in addresses" :key="address.id" class="address-item">
                        <el-radio :label="address.id">
                            <div class="address-details">
                                <p><strong>{{ address.recipientName }}</strong> {{ address.phoneNumber }}</p>
                                <p>{{ address.address }}</p>
                            </div>
                        </el-radio>
                    </div>
                </el-radio-group>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="addressDialog.visible = false">取消</el-button>
                    <el-button type="primary" @click="confirmOrder" :disabled="!selectedAddressId">
                        确认提交
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const cartItems = ref([])
const router = useRouter()

// 添加新的响应式变量
const addresses = ref([])
const selectedAddressId = ref(null)
const addressDialog = ref({
    visible: false
})

const getCartInfo = async () => {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('请先登录')
            return
        }

        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/cart/getCart', {
            headers: {
                'Authorization': token
            }
        })

        if (response.data.code === 200) {
            cartItems.value = Array.isArray(response.data.data) ? response.data.data : []
        } else {
            cartItems.value = []
            ElMessage.error(response.data.message || '获取购物车信息失败')
        }
    } catch (error) {
        cartItems.value = []
        ElMessage.error('获取购物车信息失败')
        console.error('获取购物车失败:', error)
    }
}

const updateQuantity = async (item) => {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('请先登录')
            return
        }

        const response = await axios.patch(
            `http://22f8a8d6.r25.cpolar.top/cart/${item.productInfo.id}/${item.cartInfo.quantity}/updateQuantity`,
            null,
            {
                headers: {
                    'Authorization': token
                }
            }
        )

        if (response.data.code === 200) {
            ElMessage.success('数量已更新')
            // 重新获取购物车信息以确保数据同步
            await getCartInfo()
        } else {
            ElMessage.error(response.data.message || '更新数量失败')
            // 如果更新失败，重新获取购物车信息以恢复正确的数量
            await getCartInfo()
        }
    } catch (error) {
        ElMessage.error('更新数量失败')
        console.error('更新数量失败:', error)
        // 发生错误时也重新获取购物车信息
        await getCartInfo()
    }
}

const removeItem = async (item) => {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('请先登录')
            return
        }

        const response = await axios.delete(`http://22f8a8d6.r25.cpolar.top/cart/${item.productInfo.id}/removeShoesInCart`, {
            headers: {
                'Authorization': token
            }
        })

        if (response.data.code === 200) {
            ElMessage.success('商品已成功删除')
            // 重新获取购物车信息
            await getCartInfo()
        } else {
            ElMessage.error(response.data.message || '删除商品失败')
        }
    } catch (error) {
        ElMessage.error('删除商品失败')
        console.error('删除商品失败:', error)
    }
}

// 获取地址列表
const getAddresses = async () => {
    try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/user/myAddress', {
            headers: { 'Authorization': token }
        })

        if (response.data.code === 200) {
            addresses.value = response.data.data
        }
    } catch (error) {
        ElMessage.error('获取地址列表失败')
        console.error('获取地址失败:', error)
    }
}

// 修改提交订单方法
const submitOrder = async () => {
    if (!cartItems.value.length) {
        ElMessage.warning('购物车为空')
        return
    }

    // 先获取地址列表
    await getAddresses()

    // 显示地址选择对话框
    addressDialog.value.visible = true
}

// 确认订单方法
const confirmOrder = async () => {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('请先登录')
            return
        }

        // 准备订单数据
        const orderItems = cartItems.value.map(item => ({
            productId: item.productInfo.id,
            itemCount: item.cartInfo.quantity,
            shippingId: selectedAddressId.value
        }))

        const response = await axios.post('http://22f8a8d6.r25.cpolar.top/order/createOrder',
            orderItems,
            {
                headers: {
                    'Authorization': token
                }
            }
        )

        if (response.data.code === 200) {
            const orderId = response.data.data
            ElMessage.success('订单创建成功')
            addressDialog.value.visible = false
            window.open(`http://22f8a8d6.r25.cpolar.top/pay/payPage?orderNumber=${orderId}`)
        } else {
            throw new Error(response.data.message || '创建订单失败')
        }
    } catch (error) {
        ElMessage.error(error.message || '创建订单失败')
        console.error('创建订单失败:', error)
    }
}

// 跳转到个人中心添加地址
const goToAddAddress = () => {
    router.push('/profile')
    nextTick(() => {
        // 设置个人中心的标签页为地址管理
        activeTab.value = 'addresses'
    })
}

const getTotalQuantity = computed(() => {
    return Array.isArray(cartItems.value)
        ? cartItems.value.reduce((total, item) => total + item.cartInfo.quantity, 0)
        : 0
})

const getTotalPrice = computed(() => {
    return Array.isArray(cartItems.value)
        ? cartItems.value.reduce((total, item) => {
            return total + (item.cartInfo.quantity * item.productInfo.price)
        }, 0)
        : 0
})

onMounted(() => {
    getCartInfo()
})
</script>

<style scoped>
.cart-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    margin-top: 100px;
}

.cart-card {
    margin-bottom: 20px;
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cart-summary {
    display: flex;
    gap: 20px;
}

.total-price {
    color: #f56c6c;
    font-size: 18px;
    font-weight: bold;
}

.product-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.cart-footer {
    margin-top: 20px;
    text-align: right;
}

.back-button {
    margin-bottom: 20px;
}

.address-list {
    max-height: 400px;
    overflow-y: auto;
}

.address-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
}

.address-item:last-child {
    border-bottom: none;
}

.address-details {
    margin-left: 10px;
}

.address-details p {
    margin: 5px 0;
}

.no-address {
    text-align: center;
    padding: 20px;
}
</style>