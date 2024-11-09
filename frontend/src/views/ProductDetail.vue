<template>
    <div class="product-detail" v-if="product">
        <el-button class="back-button" @click="$router.back()" :icon="ArrowLeft">返回</el-button>

        <el-row :gutter="40">
            <el-col :span="12">
                <el-image :src="product.imageUrl" fit="cover" class="product-image" />
            </el-col>
            <el-col :span="12">
                <div class="product-info">
                    <h1>{{ product.productName }}</h1>
                    <div class="brand-info">
                        <el-tag>{{ product.brand }}</el-tag>
                        <el-tag type="info">库存: {{ product.stockQuantity }}</el-tag>
                    </div>
                    <div class="price">
                        <el-text type="danger" size="large">¥{{ product.price }}</el-text>
                    </div>
                    <div class="size">
                        <span class="label">尺码：</span>
                        <el-tag>{{ product.size }}</el-tag>
                    </div>
                    <div class="description">
                        <h3>商品描述</h3>
                        <p>{{ product.productDescription }}</p>
                    </div>
                    <div class="actions">
                        <el-button type="primary" size="large" @click="handleAddToCart">
                            <el-icon>
                                <ShoppingCart />
                            </el-icon>
                            加入购物车
                        </el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
    <div v-else class="loading">
        <el-skeleton :rows="10" animated />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, ArrowLeft } from '@element-plus/icons-vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const product = ref(null)

const fetchProductDetail = async () => {
    try {
        const response = await axios.get(`http://22f8a8d6.r25.cpolar.top/item/${route.params.id}/getOneShoes`)
        if (response.data.code === 200) {
            product.value = {
                ...response.data.data,
                imageUrl: response.data.data.imageUrl
            }
            console.log('商品详情数据:', product.value)
        } else {
            ElMessage.error('获取商品详情失败')
        }
    } catch (error) {
        ElMessage.error('获取商品详情失败')
        console.error('获取商品详情失败:', error)
    }
}

const handleAddToCart = async () => {
    if (!localStorage.getItem('token')) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
    }

    try {
        const token = localStorage.getItem('token')
        const response = await axios.post('http://22f8a8d6.r25.cpolar.top/cart/addCart',
            {
                productId: route.params.id,
                quantity: 1
            },
            {
                headers: {
                    'Authorization': token
                }
            }
        )

        if (response.data.code === 200) {
            ElMessage.success('已添加到购物车')
        } else {
            ElMessage.error(response.data.msg || '添加失败')
        }
    } catch (error) {
        console.error('添加购物车失败:', error)
        ElMessage.error('添加购物车失败')
    }
}

onMounted(() => {
    fetchProductDetail()
})
</script>

<style scoped>
.product-detail {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.product-image {
    width: 100%;
    height: 500px;
    border-radius: 8px;
}

.product-info {
    padding: 20px;
}

.brand-info {
    margin: 15px 0;

    .el-tag {
        margin-right: 10px;
    }
}

.price {
    font-size: 24px;
    margin: 20px 0;
}

.size {
    margin: 15px 0;

    .label {
        margin-right: 10px;
    }
}

.description {
    margin: 20px 0;

    h3 {
        margin-bottom: 10px;
    }

    p {
        line-height: 1.6;
        color: #666;
    }
}

.actions {
    margin-top: 30px;
}

.loading {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.back-button {
    margin-bottom: 20px;
}
</style>