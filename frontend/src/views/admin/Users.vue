<template>
    <div class="users-container">
        <div class="header">
            <h2>用户列表</h2>
        </div>

        <el-table :data="userList" style="width: 100%" v-loading="loading" table-layout="fixed">
            <el-table-column prop="userId" label="用户ID" width="80" />
            <el-table-column label="头像" width="80">
                <template #default="scope">
                    <el-avatar :size="35" :src="getFullImageUrl(scope.row.imageUrl)" />
                </template>
            </el-table-column>
            <el-table-column prop="nickname" label="昵称" width="100" />
            <el-table-column prop="age" label="年龄" width="60" />
            <el-table-column prop="gender" label="性别" width="60">
                <template #default="scope">
                    {{ scope.row.gender === 1 ? '男' : '女' }}
                </template>
            </el-table-column>
            <el-table-column prop="birthday" label="生日" width="100" />
            <el-table-column prop="balance" label="余额" min-width="100">
                <template #default="scope">
                    ¥{{ scope.row.balance ? scope.row.balance.toFixed(2) : '0.00' }}
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
const userList = ref([])

const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('http')) return imageUrl
    return `http://2bca4053.r25.cpolar.top${imageUrl}`
}

// 获取用户列表
const getUsers = async () => {
    loading.value = true
    try {
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/admin/userDetailInfo')
        if (response.data.code === 200) {
            userList.value = response.data.data
        } else {
            ElMessage.error(response.data.msg || '获取用户列表失败')
        }
    } catch (error) {
        console.error('获取用户列表错误:', error)
        ElMessage.error('获取用户列表失败')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    getUsers()
})
</script>

<style scoped>
.users-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
}

.header {
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    font-size: 20px;
}

.el-table {
    flex: 1;
    overflow: auto;
}
</style>