<template>
    <div class="category-page">
        <!-- 顶部导航 -->
        <div class="page-header">
            <el-button class="back-button" @click="$router.back()" :icon="ArrowLeft">返回</el-button>
        </div>

        <!-- 商品列表 -->
        <div class="products">
            <el-card v-for="product in products" :key="product.id" class="product-card" :body-style="{ padding: '0px' }"
                @click="handleProductClick(product.id)">
                <el-image :src="product.image" fit="cover" class="product-img" />
                <div style="padding: 14px;">
                    <h3>{{ product.name }}</h3>
                    <div class="price-row">
                        <el-text type="danger" size="large">¥{{ product.price }}</el-text>
                    </div>
                </div>
            </el-card>
        </div>
        <div v-if="products.length === 0" class="empty-tip">该分类暂无商品</div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const products = ref([])
const categoryName = ref('')

const fetchProducts = async () => {
    try {
        const response = await axios.get(`http://22f8a8d6.r25.cpolar.top/item/${route.params.id}/getShoesByCateId`)
        products.value = response.data.data.map(product => ({
            id: product.id,
            name: product.productName,
            price: product.price,
            image: product.imageUrl
        }))
        console.log(products.value)
    } catch (error) {
        ElMessage.error('获取分类商品失败')
        console.error('获取分类商品失败:', error)
    }
}

//点击商品跳转至商品详情
const handleProductClick = (productId) => {
    router.push(`/product/${productId}`)
}

onMounted(() => {
    categoryName.value = route.query.name
    fetchProducts()
})


</script>

<style scoped>
.category-page {
    padding: 20px;
}

.page-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 20px;
}

.category-title {
    font-size: 24px;
    font-weight: bold;
}

.products {
    margin-top: 80px;
    /* 为固定定位的header留出空间 */
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.product-card {
    transition: all 0.3s;
    cursor: pointer;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.product-img {
    height: 200px;
    width: 100%;
    display: block;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.back-button {
    margin-right: 10px;
}

.empty-tip {
    text-align: center;
    color: #909399;
    margin-top: 40px;
    font-size: 16px;
}
</style>