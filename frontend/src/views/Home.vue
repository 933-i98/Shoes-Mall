<template>
    <div class="home">
        <!-- 顶部模块 -->
        <el-header class="header">
            <div class="logo">
                <el-text size="large" tag="b">SHOES MALL</el-text>
            </div>
            <div class="search-box">
                <el-input v-model="searchText" placeholder="搜索商品..." :prefix-icon="Search" clearable>
                    <template #append>
                        <el-button :icon="Search" @click="handleSearch">搜索</el-button>
                    </template>
                </el-input>
            </div>
            <div class="nav">
                <el-button type="primary" :icon="UserFilled" @click="$router.push('/profile')">
                    个人中心
                </el-button>
                <el-button v-if="isLoggedIn" type="primary" :icon="ShoppingCart" @click="$router.push('/cart')">
                    购物车
                </el-button>
                <el-button v-if="!isLoggedIn" type="primary" :icon="User" @click="$router.push('/login')">
                    登录
                </el-button>
                <el-button v-else type="info" :icon="SwitchButton" @click="logout">
                    退出
                </el-button>
            </div>
        </el-header>

        <!-- 分类导航栏 -->
        <div class="category-nav">
            <el-menu mode="horizontal" :router="true" class="categories">
                <el-menu-item index="/" disabled style="cursor: default;">
                    <el-text size="large" style="color: #000000; font-weight: bold; cursor: default;">鞋子分类：</el-text>
                </el-menu-item>
                <el-menu-item v-for="category in categories" :key="category.id" :index="'/category/' + category.id"
                    @click="handleCategoryClick(category)">
                    {{ category.categoryName }}
                </el-menu-item>
            </el-menu>
        </div>

        <!-- 中间内容模块 -->
        <el-main class="main-content">
            <!-- 搜索结果展示 -->
            <div v-if="showSearchResults">
                <el-divider>
                    <el-text size="large" type="primary">搜索结果 (共{{ searchTotal }}件商品)</el-text>
                </el-divider>
                <div class="products">
                    <el-card v-for="product in searchResults" :key="product.id" class="product-card"
                        :body-style="{ padding: '0px' }" @click="handleProductClick(product.id)">
                        <el-image :src="product.imageUrl" fit="cover" class="product-img" />
                        <div style="padding: 14px;">
                            <h3>{{ product.productName }}</h3>
                            <p class="description">{{ product.productDescription }}</p>
                            <div class="product-info">
                                <el-tag size="small">{{ product.brand }}</el-tag>
                                <el-tag size="small" type="success">尺码: {{ product.size }}</el-tag>
                                <el-tag size="small" type="warning" v-if="product.stockQuantity < 10">
                                    库存紧张: {{ product.stockQuantity }}
                                </el-tag>
                            </div>
                            <div class="price-row">
                                <el-text type="danger" size="large">¥{{ product.price }}</el-text>
                                <el-text type="info" size="small">库存: {{ product.stockQuantity }}</el-text>
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>

            <!-- 原有的轮播图和商品展示部分 -->
            <div v-else-if="!selectedCategory">
                <!-- 轮播图 -->
                <el-carousel :interval="4000" type="card" height="400px">
                    <el-carousel-item v-for="item in carouselItems" :key="item.id" @click="handleProductClick(item.id)">
                        <el-image :src="item.image" fit="contain" :alt="item.title" class="carousel-image" />
                    </el-carousel-item>
                </el-carousel>

                <!-- 最新商品 -->
                <el-divider>
                    <el-text size="large" type="primary">最新上架</el-text>
                </el-divider>
                <div class="products">
                    <el-card v-for="product in newProducts" :key="product.id" class="product-card"
                        :body-style="{ padding: '0px' }" @click="handleProductClick(product.id)">
                        <el-image :src="product.image" fit="cover" class="product-img" />
                        <div style="padding: 14px;">
                            <h3>{{ product.name }}</h3>
                            <div class="price-row">
                                <el-text type="danger" size="large">¥{{ product.price }}</el-text>
                            </div>
                        </div>
                    </el-card>
                </div>

                <!-- 热门推荐 -->
                <el-divider>
                    <el-text size="large" type="primary">热门推荐</el-text>
                </el-divider>
                <div class="products">
                    <el-card v-for="product in hotProducts" :key="product.id" class="product-card"
                        :body-style="{ padding: '0px' }" @click="handleProductClick(product.id)">
                        <el-image :src="product.image" fit="cover" class="product-img" />
                        <div style="padding: 14px;">
                            <h3>{{ product.name }}</h3>
                            <div class="price-row">
                                <el-text type="danger" size="large">¥{{ product.price }}</el-text>
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>
        </el-main>

        <!-- 底部模块 -->
        <el-footer class="footer">
            <div class="footer-content">
                <el-text>© 2024 SHOES MALL 版权所有</el-text>
                <el-divider direction="vertical" />
                <el-text>联系电话:400-123-4567</el-text>
                <el-divider direction="vertical" />
                <el-text>地址:河南省焦作市解放区解放中路146号</el-text>
            </div>
        </el-footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
    Search,
    ShoppingCart,
    User,
    SwitchButton,
    UserFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const searchText = ref('')
const isLoggedIn = ref(!!localStorage.getItem('token'))
const newProducts = ref([])
const hotProducts = ref([])
const carouselItems = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const router = useRouter()

// 添加搜索结果数据的ref
const searchResults = ref([])
const showSearchResults = ref(false)

// 添加新的ref
const searchTotal = ref(0)

const getProducts = async () => {
    carouselItems.value = [
        {
            id: 1,
            image: '/assert/af1.jpg',
            link: '/products/new'
        },
        {
            id: 2,
            image: '/assert/ss.jpg',
            link: '/products/sale'
        },
        {
            id: 3,
            image: '/assert/ree.jpg',
            link: '/products/brand'
        },
    ]

    try {
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/item/1/getShoesByCateId')
        if (response.data.data) {
            newProducts.value = response.data.data.slice(0, 4).map(product => ({
                id: product.id,
                name: product.productName,
                price: product.price,
                image: product.imageUrl
            }))
        }
    } catch (error) {
        console.error('获取最新商品失败:', error)
        newProducts.value = [
            { id: 4, name: 'NIKE-AF1', price: 799, image: '/assert/af1.jpg' },
            { id: 5, name: 'Adidas-Superstar', price: 328, image: '/assert/ss.jpg' },
            { id: 6, name: 'ANTA-狂潮5', price: 494, image: '/assert/kc5.jpg' },
            { id: 15, name: 'NIKE-LBJ18', price: 489, image: '/assert/lbj.jpg' }
        ]
    }

    try {
        // 获取分类2的商品作为热门推荐
        const hotResponse = await axios.get('http://22f8a8d6.r25.cpolar.top/item/2/getShoesByCateId')
        if (hotResponse.data.data) {
            // 只取前4个商品
            hotProducts.value = hotResponse.data.data.slice(0, 4).map(product => ({
                id: product.id,
                name: product.productName,
                price: product.price,
                image: product.imageUrl
            }))
        }
    } catch (error) {
        console.error('获取热门商品失败:', error)
        // 使用默认数据作为后备
        hotProducts.value = [
            { id: 16, name: 'ADIDAS-哈登8', price: 899, image: '/assert/hd.jpg' },
            { id: 17, name: '361-AG4', price: 486, image: '/assert/ag.jpg' },
            { id: 18, name: 'PEAK-AW1', price: 634, image: '/assert/peak.jpg' },
            { id: 19, name: 'NIKE-AirMax97', price: 679, image: '/assert/am97.jpg' }
        ]
    }
}

const handleService = () => {
    ElMessage({
        message: '客服联系方式:400-123-4567',
        type: 'info',
        duration: 3000,
        showClose: true,
        center: true
    })
}

const addToCart = async (product) => {
    if (!isLoggedIn.value) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
    }

    try {
        const token = localStorage.getItem('token')
        const response = await axios.post('http://22f8a8d6.r25.cpolar.top/cart/addCart',
            {
                productId: product.id,
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

const logout = () => {
    localStorage.removeItem('token')
    isLoggedIn.value = false
    ElMessage.success('已退出登录')
}

// 获取分类数据
const getCategories = async () => {
    try {
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/item/getAllCategory')
        categories.value = response.data.data
    } catch (error) {
        ElMessage.error('获取分类信息失败')
        console.error('获取分类失败:', error)
    }
}

// 修改处理分类点击事件
const handleCategoryClick = (category) => {
    router.push({
        path: `/category/${category.id}`,
    })
}

//点击商品跳转至商品详情
const handleProductClick = (productId) => {
    router.push(`/product/${productId}`)
}

// 修改搜索处理函数
const handleSearch = async () => {
    if (!searchText.value.trim()) {
        ElMessage.warning('请输入搜索关键词')
        return
    }

    try {
        const response = await axios.get(`http://22f8a8d6.r25.cpolar.top/item/queryShoes`, {
            params: {
                condition: searchText.value.trim()
            }
        })

        if (response.data.list && response.data.list.length > 0) {
            searchResults.value = response.data.list
            searchTotal.value = response.data.total
            showSearchResults.value = true
        } else {
            ElMessage.warning('未找到相关商品')
            searchResults.value = []
            searchTotal.value = 0
        }
    } catch (error) {
        console.error('搜索失败:', error)
        ElMessage.error('搜索失败，请稍后重试')
    }
}

// 添加生命周期钩子，组件挂载时获取数据
onMounted(() => {
    getProducts()
    getCategories()
})
</script>

<style scoped>
.home {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f5f7fa;
}

.header {
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 50px;
    height: 80px;
    position: fixed;
    width: 100%;
    z-index: 999;
}

.search-box {
    width: 400px;
}

.nav {
    display: flex;
    gap: 10px;
}

.main-content {
    margin-top: 130px;
    padding: 20px 50px;
}

.products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin: 20px 0;
}

.product-card {
    transition: all 0.3s;
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

.footer {
    background-color: #fff;
    padding: 30px 0;
    margin-top: auto;
}

.footer-content {
    text-align: center;
    color: #909399;
}

:deep(.el-carousel__item) {
    border-radius: 8px;
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
}

.carousel-image {
    height: 100%;
    width: 100%;
    object-fit: contain;
    padding: 20px;
}

:deep(.el-carousel__item img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.category-nav {
    position: fixed;
    top: 80px;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    z-index: 998;
}

.categories {
    padding: 0 50px;
}

.product-info {
    margin: 10px 0;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.description {
    color: #666;
    font-size: 14px;
    margin: 8px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
