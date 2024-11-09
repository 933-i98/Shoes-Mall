<template>
    <div class="dashboard-container">
        <!-- 侧边栏 -->
        <div class="sidebar" :class="{ 'sidebar-collapse': isCollapse }">
            <div class="logo-container">
                <span v-if="!isCollapse">后台管理系统</span>
            </div>
            <el-menu :default-active="activeMenu" class="sidebar-menu" :collapse="isCollapse" background-color="#001529"
                text-color="#fff" active-text-color="#409EFF" router>
                <el-sub-menu index="1">
                    <template #title>
                        <el-icon>
                            <ShoppingBag />
                        </el-icon>
                        <span>商品管理</span>
                    </template>
                    <el-menu-item index="/admin/products">商品列表</el-menu-item>
                    <el-menu-item index="/admin/products/add">添加商品</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="2">
                    <template #title>
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>用户管理</span>
                    </template>
                    <el-menu-item index="/admin/users">用户列表</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="3">
                    <template #title>
                        <el-icon>
                            <ShoppingCart />
                        </el-icon>
                        <span>订单管理</span>
                    </template>
                    <el-menu-item index="/admin/orders">订单列表</el-menu-item>
                </el-sub-menu>
            </el-menu>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-container">
            <!-- 顶部导航栏 -->
            <div class="navbar">
                <div class="navbar-left">
                    <el-button type="text" @click="toggleSidebar">
                        <el-icon>
                            <Fold v-if="!isCollapse" />
                            <Expand v-else />
                        </el-icon>
                    </el-button>
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{ currentPath }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="navbar-right">
                    <el-dropdown>
                        <span class="admin-info">
                            <el-avatar :size="32" :src="adminAvatar" />
                            <span class="admin-name">管理员</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>

            <!-- 内容区域 -->
            <div class="content">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    ShoppingBag,
    User,
    ShoppingCart,
    Fold,
    Expand
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)
const adminAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png')

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)

// 计算当前路径对应的中文名称
const currentPath = computed(() => {
    const pathMap = {
        '/admin/products': '商品列表',
        '/admin/products/add': '添加商品',
        '/admin/users': '用户列表',
        '/admin/orders': '订单列表'
    }
    return pathMap[route.path] || '首页'
})

// 切换侧边栏
const toggleSidebar = () => {
    isCollapse.value = !isCollapse.value
}

// 退出登录
const handleLogout = () => {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        localStorage.removeItem('token')
        router.push('/admin/login')
    })
}
</script>

<style scoped>
.dashboard-container {
    display: flex;
    height: 100vh;
}

.sidebar {
    width: 240px;
    height: 100%;
    background-color: #001529;
    transition: width 0.3s;
    overflow-x: hidden;
}

.sidebar-collapse {
    width: 64px;
}

.logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    color: white;
    background-color: #002140;
}

.logo {
    height: 32px;
    margin-right: 12px;
}

.sidebar-menu {
    border-right: none;
}

.main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.navbar {
    height: 60px;
    background-color: white;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
}

.navbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.navbar-right {
    display: flex;
    align-items: center;
}

.admin-info {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.admin-name {
    margin-left: 8px;
    font-size: 14px;
}

.content {
    flex: 1;
    padding: 20px;
    background-color: #f0f2f5;
    overflow-y: auto;
}

/* Element Plus 样式覆盖 */
:deep(.el-menu) {
    border-right: none;
}

:deep(.el-menu--collapse) {
    width: 64px;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
    height: 50px;
    line-height: 50px;
}
</style>