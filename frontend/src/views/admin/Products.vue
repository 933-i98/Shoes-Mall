<template>
    <div class="products-container">
        <div class="header">
            <h2>商品列表</h2>
            <el-button type="primary" @click="$router.push('/admin/products/add')">添加商品</el-button>
        </div>

        <el-table :data="productList" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="商品图片" width="120">
                <template #default="scope">
                    <el-image style="width: 80px; height: 80px" :src="scope.row.imageUrl"
                        :preview-src-list="[scope.row.imageUrl]" fit="cover" />
                </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="brand" label="品牌" width="120" />
            <el-table-column prop="price" label="价格" width="120">
                <template #default="scope">
                    ¥{{ scope.row.price }}
                </template>
            </el-table-column>
            <el-table-column prop="stockQuantity" label="库存" width="120" />
            <el-table-column prop="shoeSize" label="鞋码" width="100" />
            <el-table-column label="操作" width="150">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 商品描述弹窗 -->
        <el-dialog v-model="dialogVisible" title="商品描述" width="50%">
            <p>{{ currentDescription }}</p>
        </el-dialog>

        <!-- 添加编辑对话框 -->
        <el-dialog v-model="editDialogVisible" title="编辑商品" width="60%">
            <el-form ref="editFormRef" :model="editForm" :rules="rules" label-width="120px" class="product-form">
                <el-form-item label="商品名称" prop="productName">
                    <el-input v-model="editForm.productName" placeholder="请输入商品名称" />
                </el-form-item>

                <el-form-item label="商品图片" prop="imageUrl">
                    <el-upload class="avatar-uploader" :show-file-list="false"
                        :action="'http://2bca4053.r25.cpolar.top/group1/upload'" :before-upload="beforeAvatarUpload"
                        :on-success="handleEditAvatarSuccess">
                        <img v-if="editForm.imageUrl" :src="editForm.imageUrl" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>

                <el-form-item label="商品价格" prop="price">
                    <el-input-number v-model="editForm.price" :precision="2" :step="0.1" :min="0" />
                </el-form-item>

                <el-form-item label="商品库存" prop="stockQuantity">
                    <el-input-number v-model="editForm.stockQuantity" :min="0" :precision="0" />
                </el-form-item>

                <el-form-item label="商品分类" prop="categoryName">
                    <el-select v-model="editForm.categoryName" placeholder="请选择商品分类">
                        <el-option label="篮球鞋" value="篮球鞋" />
                        <el-option label="跑步鞋" value="跑步鞋" />
                        <el-option label="足球鞋" value="足球鞋" />
                        <el-option label="训练鞋" value="训练鞋" />
                        <el-option label="户外鞋" value="户外鞋" />
                        <el-option label="登山鞋" value="登山鞋" />
                        <el-option label="滑板鞋" value="滑板鞋" />
                        <el-option label="休闲鞋" value="休闲鞋" />
                        <el-option label="正装鞋" value="正装鞋" />
                    </el-select>
                </el-form-item>

                <el-form-item label="商品描述" prop="productDescription">
                    <el-input v-model="editForm.productDescription" type="textarea" rows="4" />
                </el-form-item>

                <el-form-item label="商品品牌" prop="brand">
                    <el-input v-model="editForm.brand" placeholder="请输入商品品牌" />
                </el-form-item>

                <el-form-item label="鞋码" prop="size">
                    <el-select v-model="editForm.size" placeholder="请选择鞋码">
                        <el-option v-for="size in shoesSizes" :key="size" :label="size" :value="size" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitEdit">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const productList = ref([])
const dialogVisible = ref(false)
const currentDescription = ref('')
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editForm = ref({})
const canCommit = ref(true)
const shoesSizes = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]

// 表单验证规则
const rules = {
    productName: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    imageUrl: [
        { required: true, message: '请上传商品图片', trigger: 'change' }
    ],
    price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' }
    ],
    stockQuantity: [
        { required: true, message: '请输入商品库存', trigger: 'blur' }
    ],
    categoryName: [
        { required: true, message: '请选择商品分类', trigger: 'change' }
    ],
    productDescription: [
        { required: true, message: '请输入商品描述', trigger: 'blur' }
    ],
    brand: [
        { required: true, message: '请输入商品品牌', trigger: 'blur' }
    ],
    size: [
        { required: true, message: '请选择鞋码', trigger: 'change' }
    ]
}

// 获取商品列表
const getProducts = async () => {
    loading.value = true
    try {
        const response = await axios.get('http://22f8a8d6.r25.cpolar.top/admin/product')
        if (response.data.code === 200) {
            productList.value = response.data.data.map(item => ({
                ...item,
                shoeSize: 42,
                imageUrl: item.imageUrl
            }))
        } else {
            ElMessage.error(response.data.msg || '获取商品列表失败')
        }
    } catch (error) {
        console.error('获取商品列表错误:', error)
        ElMessage.error('获取商品列表失败')
    } finally {
        loading.value = false
    }
}


const handleViewDescription = (row) => {
    currentDescription.value = row.productDescription
    dialogVisible.value = true
}

// 编辑按钮点击处理
const handleEdit = (row) => {
    editForm.value = { ...row }
    editDialogVisible.value = true
}

const handleDelete = (row) => {
    ElMessageBox.confirm(
        '确定要删除该商品吗？',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            const response = await axios.delete('http://22f8a8d6.r25.cpolar.top/admin/delproduct', {
                data: {
                    id: row.id
                }
            })
            if (response.data.code === 200) {
                ElMessage.success('删除成功')
                getProducts() // 重新加载商品列表
            } else {
                ElMessage.error(response.data.msg || '删除失败')
            }
        } catch (error) {
            console.error('删除商品错误:', error)
            ElMessage.error('删除失败')
        }
    })
}

// 图片上传相关方法
const handleEditAvatarSuccess = (response) => {
    canCommit.value = true
    editForm.value.imageUrl = response
    ElMessage.success('图片上传成功')
}

const beforeAvatarUpload = (rawFile) => {
    canCommit.value = false
    if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('图片必须是jpeg或png格式')
        return false
    } else if (rawFile.size / 1024 / 1024 > 5) {
        ElMessage.error('图片不能超过5MB!')
        return false
    }
    return true
}

// 提交编辑
const submitEdit = async () => {
    if (!editFormRef.value || !canCommit.value) return

    await editFormRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const response = await axios.post('http://22f8a8d6.r25.cpolar.top/admin/products', {
                    id: editForm.value.id,
                    productName: editForm.value.productName,
                    categoryName: editForm.value.categoryName,
                    productDescription: editForm.value.productDescription,
                    stockQuantity: editForm.value.stockQuantity,
                    brand: editForm.value.brand,
                    size: editForm.value.size,
                    price: editForm.value.price,
                    imageUrl: editForm.value.imageUrl
                })

                if (response.data.code === 200) {
                    ElMessage.success('修改成功')
                    editDialogVisible.value = false
                    getProducts() // 重新加载商品列表
                } else {
                    ElMessage.error(response.data.message || '修改失败')
                }
            } catch (error) {
                console.error('修改商品出错：', error)
                ElMessage.error('修改失败，请稍后重试')
            }
        }
    })
}

onMounted(() => {
    getProducts()
})
</script>

<style scoped>
.products-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    font-size: 20px;
}

/* 添加商品描述的省略号样式 */
.description-cell {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}

/* 添加上传组件样式 */
.avatar-uploader {
    :deep(.el-upload) {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);
    }

    :deep(.el-upload:hover) {
        border-color: var(--el-color-primary);
    }
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
    line-height: 178px;
}

.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>