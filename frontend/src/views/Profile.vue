<template>
    <div class="profile-container">
        <el-button class="back-button" @click="$router.back()" :icon="ArrowLeft">返回</el-button>

        <el-card class="profile-info-card">
            <div class="profile-info">
                <div class="profile-avatar">
                    <el-avatar :size="100" :src="userInfo.imageUrl">
                        <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                    </el-avatar>
                    <el-upload v-if="isEditing" class="avatar-uploader"
                        action="http://2bca4053.r25.cpolar.top/group1/upload" :headers="{ 'Authorization': token }"
                        :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload"
                        :disabled="!isEditing">
                        <el-button type="primary" size="small" :loading="!canUpload" :disabled="!isEditing">
                            更换头像
                        </el-button>
                    </el-upload>
                </div>
                <div class="profile-details">
                    <div class="info-row">
                        <span class="info-label">昵称：</span>
                        <el-input v-model="userInfo.nickname" size="small" style="width: 200px"
                            :disabled="!isEditing" />
                    </div>
                    <div class="info-row">
                        <span class="info-label">年龄：</span>
                        <el-input-number v-model="userInfo.age" :min="1" :max="120" size="small"
                            :disabled="!isEditing" />
                    </div>
                    <div class="info-row">
                        <span class="info-label">性别：</span>
                        <el-radio-group v-model="userInfo.gender" :disabled="!isEditing">
                            <el-radio :value="'男'">男</el-radio>
                            <el-radio :value="'女'">女</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="info-row">
                        <span class="info-label">生日：</span>
                        <el-date-picker v-model="userInfo.birthday" type="date" size="small" style="width: 200px"
                            :disabled="!isEditing" value-format="YYYY-MM-DD" />
                    </div>
                    <div class="info-actions">
                        <el-button v-if="!isEditing" type="primary" @click="startEditing">
                            编辑资料
                        </el-button>
                        <template v-else>
                            <el-button @click="cancelEditing">取消</el-button>
                            <el-button type="primary" @click="saveUserInfo">保存</el-button>
                        </template>
                    </div>
                </div>
            </div>
        </el-card>

        <el-card class="profile-card">
            <template #header>
                <div class="profile-header">
                    <h2>个人中心</h2>
                </div>
            </template>

            <el-tabs v-model="activeTab">
                <!-- 订单列表标签页 -->
                <el-tab-pane label="我的订单" name="orders">
                    <el-table v-loading="ordersLoading" :data="groupedOrders" style="width: 100%">
                        <el-table-column label="订单编号" prop="orderNumber" />
                        <el-table-column label="创建时间" prop="createdTime" />
                        <el-table-column label="商品数量">
                            <template #default="{ row }">
                                {{ row.items.length }}件商品
                            </template>
                        </el-table-column>
                        <el-table-column label="订单总额">
                            <template #default="{ row }">
                                ¥{{ row.totalPrice }}
                            </template>
                        </el-table-column>
                        <el-table-column label="订单状态" prop="orderStatus">
                            <template #default="{ row }">
                                <el-tag :type="getOrderStatusType(row.orderStatus)">
                                    {{ row.orderStatus }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="200">
                            <template #default="{ row }">
                                <el-button v-if="row.orderStatus === '待支付'" type="primary"
                                    @click="goToPay(row.orderNumber)">
                                    去支付
                                </el-button>
                                <el-button type="info" @click="showOrderDetail(row)">
                                    查看详情
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 地址管理标签页 -->
                <el-tab-pane label="地址管理" name="addresses">
                    <div class="address-list">
                        <el-button type="primary" @click="showAddressDialog('add')" class="add-address-btn">
                            添加新地址
                        </el-button>

                        <el-card v-for="address in addresses" :key="address.id" class="address-card">
                            <div class="address-content">
                                <div class="address-info">
                                    <p><strong>收货人：</strong>{{ address.recipientName }}</p>
                                    <p><strong>电话：</strong>{{ address.phoneNumber }}</p>
                                    <p><strong>地址：</strong>{{ address.address }}</p>
                                </div>
                                <div class="address-actions">
                                    <el-button type="primary" @click="showAddressDialog('edit', address)">
                                        编辑
                                    </el-button>
                                    <el-button type="danger" @click="deleteAddress(address.id)">
                                        删除
                                    </el-button>
                                </div>
                            </div>
                        </el-card>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 地址编辑对话框 -->
        <el-dialog :title="addressDialog.type === 'add' ? '添加新地址' : '编辑地址'" v-model="addressDialog.visible"
            width="500px">
            <el-form :model="addressForm" ref="addressFormRef" :rules="addressRules" label-width="100px">
                <el-form-item label="收货人" prop="recipientName">
                    <el-input v-model="addressForm.recipientName" />
                </el-form-item>
                <el-form-item label="联系电话" prop="phoneNumber">
                    <el-input v-model="addressForm.phoneNumber" />
                </el-form-item>
                <el-form-item label="详细地址" prop="address">
                    <el-input v-model="addressForm.address" type="textarea" :rows="3" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="addressDialog.visible = false">取消</el-button>
                <el-button type="primary" @click="saveAddress">保存</el-button>
            </template>
        </el-dialog>

        <!-- 修改订单详情对话框 -->
        <el-dialog title="订单详情" v-model="orderDetailDialog.visible" width="600px" @close="closeOrderDetail"
            :before-close="closeOrderDetail">
            <div v-if="orderDetailDialog.data">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="订单编号">
                        {{ orderDetailDialog.data.orderNumber }}
                    </el-descriptions-item>
                    <el-descriptions-item label="创建时间">
                        {{ orderDetailDialog.data.createdTime }}
                    </el-descriptions-item>
                    <el-descriptions-item label="订单状态">
                        <el-tag :type="getOrderStatusType(orderDetailDialog.data.orderStatus)">
                            {{ orderDetailDialog.data.orderStatus }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="商品信息">
                        <div v-if="orderDetailDialog.loading">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else-if="orderDetailDialog.productInfo">
                            <div v-for="(item, index) in orderDetailDialog.data.items" :key="index">
                                <template v-if="orderDetailDialog.productInfo[item.productId]">
                                    商品名称：{{ orderDetailDialog.productInfo[item.productId].productName }}<br>
                                    单价：¥{{ item.itemPrice }}<br>
                                    数量：{{ item.itemCount }}<br>
                                    <el-button type="danger" size="small"
                                        @click="cancelOrderItem(orderDetailDialog.productInfo[item.productId].id)"
                                        :loading="cancelLoading" v-if="orderDetailDialog.data.orderStatus === '待支付'">
                                        取消商品
                                    </el-button>
                                    <el-divider v-if="index !== orderDetailDialog.data.items.length - 1" />
                                </template>
                                <template v-else>
                                    <el-alert type="info" :closable="false" show-icon>
                                        商品信息加载失败
                                    </el-alert>
                                </template>
                            </div>
                        </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="订单总价">
                        ¥{{ orderDetailDialog.data.totalPrice }}
                    </el-descriptions-item>
                </el-descriptions>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closeOrderDetail">关闭</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const activeTab = ref('orders')
const orders = ref([])
const addresses = ref([])
const ordersLoading = ref(false)

// 地址表单相关
const addressDialog = ref({
    visible: false,
    type: 'add' // 'add' 或 'edit'
})

const addressForm = ref({
    id: null,
    recipientName: '',
    phoneNumber: '',
    address: ''
})

const addressRules = {
    recipientName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
    phoneNumber: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

// 订单详情对话框
const orderDetailDialog = ref({
    visible: false,
    data: {},
    productInfo: {},
    loading: false
})

// 个人信息相关
const userInfo = ref({
    nickname: '',
    age: 0,
    gender: '男',
    imageUrl: '',
    birthday: ''
})
const isEditing = ref(false)
const token = computed(() => localStorage.getItem('token'))
const originalUserInfo = ref(null)

// 添加上传状态控制
const canUpload = ref(true)

// 获取用户信息
const getUserInfo = async () => {
    try {
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/user/queryMyInfo', {
            headers: { 'Authorization': token.value }
        })

        if (response.data.code === 200) {
            const userData = response.data.data

            userInfo.value = userData
            originalUserInfo.value = { ...userData }
        }
    } catch (error) {
        ElMessage.error('获取用户信息失败')
        console.error('获取用户信息失败:', error)
    }
}

// 开始编辑
const startEditing = () => {
    isEditing.value = true
    originalUserInfo.value = { ...userInfo.value }
}

// 取消编辑
const cancelEditing = () => {
    isEditing.value = false
    userInfo.value = { ...originalUserInfo.value }
}

// 保存用户信息
const saveUserInfo = async () => {
    try {
        // 检查 token 是否存在
        if (!token.value) {
            ElMessage.error('未登录或登录已过期')
            router.push('/login')
            return
        }

        // 构造请求数据
        const updateData = {
            nickname: userInfo.value.nickname?.trim() || '',
            age: parseInt(userInfo.value.age) || 0,
            gender: userInfo.value.gender || '男',
            birthday: userInfo.value.birthday || '',
            imageUrl: userInfo.value.imageUrl || ''
        }

        console.log('准备提交的数据:', updateData)
        console.log('当前token:', token.value)

        // 尝试发送请求
        const response = await axios.put(
            'http://22f8a8d6.r25.cpolar.top/user/updateMyInfo', userInfo.value,
            {
                headers: { 'Authorization': token.value }
            }
        )

        console.log('服务器响应:', response)

        if (response.data.code === 200) {
            ElMessage.success('保存成功')
            isEditing.value = false
            originalUserInfo.value = { ...userInfo.value }
        } else {
            throw new Error(response.data.message || '保存失败')
        }
    } catch (error) {
        console.error('完整错误信息:', error)

        // 根据错误类型显示不同的错误信息
        if (error.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请检查网络后重试')
        } else if (error.message.includes('Network Error')) {
            ElMessage.error('网络连接失败，请检查')
        } else if (error.response) {
            ElMessage.error(`请求失败: ${error.response.data?.message || '未知错误'}`)
        } else {
            ElMessage.error('请求失败，请稍后重试')
        }
    }
}

// 修改头像上传相关方法
const handleAvatarSuccess = (response) => {
    canUpload.value = true
    if (response) {
        userInfo.value.imageUrl = response
        ElMessage.success('头像上传成功,请点击保存确认修改')

    } else {
        ElMessage.error('头像上传失败：返回数据格式错误')
        console.error('上传响应数据:', response) // 调试用
    }
}

const beforeAvatarUpload = (file) => {
    canUpload.value = false
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG) {
        ElMessage.error('头像只能是 JPG 或 PNG 格式!')
        canUpload.value = true
        return false
    }
    if (!isLt2M) {
        ElMessage.error('头像大小不能超过 2MB!')
        canUpload.value = true
        return false
    }
    return true
}

// 获取订单列表
const getOrders = async () => {
    ordersLoading.value = true
    try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/order/allOrder', {
            headers: { 'Authorization': token }
        })

        if (response.data.code === 200) {
            orders.value = response.data.data
        }
    } catch (error) {
        ElMessage.error('获取订单列表失败')
        console.error('获取订单失败:', error)
    } finally {
        ordersLoading.value = false
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

// 显示地址编辑对话框
const showAddressDialog = (type, address = null) => {
    addressDialog.value.type = type
    addressDialog.value.visible = true
    if (type === 'edit' && address) {
        addressForm.value = { ...address }
    } else {
        addressForm.value = {
            id: null,
            recipientName: '',
            phoneNumber: '',
            address: ''
        }
    }
}

// 保存地址
const saveAddress = async () => {
    try {
        const token = localStorage.getItem('token')

        // 根据类型区分是新增���是编辑
        if (addressDialog.value.type === 'add') {
            // 增地址
            const response = await axios.post('http://22f8a8d6.r25.cpolar.top/user/newAddress',
                {
                    recipientName: addressForm.value.recipientName,
                    phoneNumber: addressForm.value.phoneNumber,
                    address: addressForm.value.address
                },
                {
                    headers: { 'Authorization': token }
                }
            )

            if (response.data.code === 200) {
                ElMessage.success('添加成功')
                addressDialog.value.visible = false
                getAddresses()
            }
        } else {
            // 编辑地址
            const response = await axios.patch('http://22f8a8d6.r25.cpolar.top/user/updateAddress',
                {
                    id: addressForm.value.id,
                    recipientName: addressForm.value.recipientName,
                    phoneNumber: addressForm.value.phoneNumber,
                    address: addressForm.value.address
                },
                {
                    headers: { 'Authorization': token }
                }
            )

            if (response.data.code === 200) {
                ElMessage.success('更新成功')
                addressDialog.value.visible = false
                getAddresses()
            }
        }
    } catch (error) {
        ElMessage.error(addressDialog.value.type === 'add' ? '添加地址失败' : '更新地址失败')
        console.error('保存地址失败:', error)
    }
}

// 删除地址
const deleteAddress = async (addressId) => {
    try {
        await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
            type: 'warning'
        })

        const token = localStorage.getItem('token')
        const response = await axios.delete(`http://22f8a8d6.r25.cpolar.top/user/${addressId}/deleteAddress/`, {
            headers: { 'Authorization': token }
        })

        if (response.data.code === 200) {
            ElMessage.success('删除成功')
            getAddresses()
        }
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除地址失败')
            console.error('删除地址失败:', error)
        }
    }
}

// 订单状态处理
const getOrderStatusText = (status) => {
    const statusMap = {
        'UNPAID': '待支付',
        'PAID': '已支付',
        'SHIPPED': '已发货',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消'
    }
    return statusMap[status] || status
}

const getOrderStatusType = (status) => {
    const typeMap = {
        '待支付': 'warning',
        '已支付': 'success',
        '已发货': 'primary',
        '已完成': 'success',
        '已取消': 'info'
    }
    return typeMap[status] || ''
}

// 修改支付方法
const goToPay = (orderNumber) => {
    // 打开支付页面
    const payWindow = window.open(`http://22f8a8d6.r25.cpolar.top/pay/payPage?orderNumber=${orderNumber}`)

    // 监听支付窗口关闭事件
    const checkWindowClosed = setInterval(() => {
        if (payWindow.closed) {
            clearInterval(checkWindowClosed)
            // 刷新订单列表
            getOrders()
        }
    }, 1000)
}

// 修改查看订单详情法
const showOrderDetail = async (order) => {
    if (!order) return

    try {
        orderDetailDialog.value = {
            visible: true,
            data: order,
            productInfo: {},
            loading: true
        }

        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('未登录或登录已过期')
            return
        }

        if (!order.items || !Array.isArray(order.items)) {
            ElMessage.error('订单数据格式错误')
            return
        }

        const productPromises = order.items.map(item => {
            if (!item.productId) return Promise.resolve({ data: { code: 500 } })

            return axios.get(
                `http://22f8a8d6.r25.cpolar.top/item/${item.productId}/getOneShoes`,
                {
                    headers: { 'Authorization': token }
                }
            ).catch(error => {
                console.error(`获取商品 ${item.productId} 详情失败:`, error)
                return { data: { code: 500 } }
            })
        })

        const responses = await Promise.all(productPromises)
        const productInfo = {}

        responses.forEach((response, index) => {
            if (response.data.code === 200 && order.items[index]) {
                const productId = order.items[index].productId
                productInfo[productId] = response.data.data
            }
        })

        if (orderDetailDialog.value) {
            orderDetailDialog.value.productInfo = productInfo
        }
    } catch (error) {
        ElMessage.error('获取订单详情失败')
        console.error('获取订单详情失败:', error)
    } finally {
        if (orderDetailDialog.value) {
            orderDetailDialog.value.loading = false
        }
    }
}

// 添加关闭对话框的方法
const closeOrderDetail = () => {
    orderDetailDialog.value = {
        visible: false,
        data: {},
        productInfo: {},
        loading: false
    }
}

// 处理订单数据分组
const groupedOrders = computed(() => {
    const groups = {}
    orders.value.forEach(order => {
        if (!groups[order.orderNumber]) {
            groups[order.orderNumber] = {
                orderNumber: order.orderNumber,
                createdTime: order.createdTime,
                orderStatus: order.orderStatus,
                totalPrice: order.totalPrice,
                items: [{  // 初始化 items 数组
                    productId: order.productId,
                    itemPrice: order.itemPrice,
                    itemCount: order.itemCount
                }]
            }
        } else {
            // 如果订单已存在，将商品添加到 items 数组
            groups[order.orderNumber].items.push({
                productId: order.productId,
                itemPrice: order.itemPrice,
                itemCount: order.itemCount
            })
        }
    })
    return Object.values(groups)
})

const cancelLoading = ref(false)

const cancelOrderItem = async (orderId) => {
    const maxRetries = 3;
    let currentRetry = 0;

    try {
        await ElMessageBox.confirm('确定要取消该商品吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });

        cancelLoading.value = true;
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('未登录或登录已过期');
        }

        // 创建重试函数
        const makeRequest = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await axios({
                    method: 'DELETE',
                    url: `http://22f8a8d6.r25.cpolar.top/order/${orderId}/deleteOrder`,
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000,
                });

                clearTimeout(timeoutId);
                return response.data;
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        };

        while (currentRetry < maxRetries) {
            try {
                const data = await makeRequest();

                if (data.code === 200) {
                    ElMessage.success('商品取消成功');
                    // 关闭订单详情对话框
                    closeOrderDetail();
                    // 刷新页面
                    window.location.reload();
                    return;
                } else {
                    throw new Error(data.msg || '请求失败');
                }
            } catch (error) {
                currentRetry++;
                console.log(`请求失败，第 ${currentRetry} 次重试...`, error);

                if (currentRetry === maxRetries) {
                    throw error;
                }

                await new Promise(resolve => setTimeout(resolve, currentRetry * 1000));
            }
        }
    } catch (error) {
        if (error === 'cancel') {
            return;
        }
        ElMessage.error(errorMessage);
        console.error('取消商品失败:', error);
    } finally {
        cancelLoading.value = false;
    }
};

onMounted(async () => {
    await nextTick()
    await Promise.all([
        getUserInfo(),
        getOrders(),
        getAddresses()
    ])
})

onBeforeUnmount(() => {
    orderDetailDialog.value = {
        visible: false,
        data: {},
        productInfo: {},
        loading: false
    }
})

// 添加全局 axios 配置
axios.defaults.timeout = 15000
axios.defaults.withCredentials = true

// 修改请求拦截器
axios.interceptors.request.use(
    config => {
        // 添加时间戳防止缓存
        if (config.method === 'get') {
            config.params = { ...config.params, _t: Date.now() }
        }

        const token = localStorage.getItem('token')
        if (token) {
            config.headers['Authorization'] = token
        }

        // 打印请求配置用于调试
        console.log('请求配置:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        })

        return config
    },
    error => {
        console.error('请求拦截器错误:', error)
        return Promise.reject(error)
    }
)

// 修改响应拦截器
axios.interceptors.response.use(
    response => {
        console.log('响应数据:', response.data)
        return response
    },
    error => {
        console.error('响应拦截器错误:', {
            message: error.message,
            config: error.config,
            response: error.response
        })

        if (error.response?.status === 401) {
            ElMessage.error('登录已过期，请重新登录')
            localStorage.removeItem('token')
            router.push('/login')
        }

        return Promise.reject(error)
    }
)
</script>

<style scoped>
.profile-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    margin-top: 100px;
}

.profile-card {
    margin-bottom: 20px;
}

.profile-header {
    text-align: center;
}

.back-button {
    margin-bottom: 20px;
}

.address-list {
    margin-top: 20px;
}

.add-address-btn {
    margin-bottom: 20px;
}

.address-card {
    margin-bottom: 15px;
}

.address-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.address-info {
    flex: 1;
}

.address-actions {
    display: flex;
    gap: 10px;
}

.order-total {
    margin-top: 20px;
    text-align: right;
    font-size: 18px;
    font-weight: bold;
    color: #f56c6c;
}

.profile-info-card {
    margin-bottom: 20px;
}

.profile-info {
    display: flex;
    gap: 40px;
    padding: 20px;
}

.profile-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.profile-details {
    flex: 1;
}

.info-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.info-label {
    width: 80px;
    color: #606266;
}

.info-actions {
    margin-top: 30px;
}

.avatar-uploader {
    margin-top: 10px;
}
</style>