<template>
    <div class="add-product-container">
        <div class="header">
            <h2>添加商品</h2>
            <el-button type="primary" @click="showUploadDialog">Excel导入</el-button>
        </div>

        <el-dialog v-model="dialogVisible" title="Excel导入" width="500px">
            <el-upload class="excel-upload" drag :show-file-list="false" name="files"
                action="http://22f8a8d6.r25.cpolar.top/admin/import" :before-upload="beforeExcelUpload"
                :on-success="handleExcelSuccess" accept=".xlsx, .xls">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    拖动到这里或者<em>单击选择文件</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        请选择上传文件，仅支持 xls 或 xlsx 格式
                    </div>
                </template>
            </el-upload>
        </el-dialog>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="product-form">
            <el-form-item label="商品名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>

            <el-form-item label="商品图片" prop="imageUrl">
                <el-upload class="avatar-uploader" :show-file-list="false"
                    :action="'http://2bca4053.r25.cpolar.top/group1/upload'" :before-upload="beforeAvatarUpload"
                    :on-success="handleAvatarSuccess">
                    <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar" />
                    <el-icon v-else class="avatar-uploader-icon">
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>

            <el-form-item label="商品价格" prop="price">
                <el-input-number v-model="form.price" :precision="2" :step="0.1" :min="0" placeholder="请输入商品价格" />
            </el-form-item>

            <el-form-item label="商品库存" prop="stock">
                <el-input-number v-model="form.stock" :min="0" :precision="0" placeholder="请输入商品库存" />
            </el-form-item>

            <el-form-item label="商品分类" prop="category">
                <el-select v-model="form.category" placeholder="请选择商品分类">
                    <el-option-group>
                        <el-option label="篮球鞋" value="篮球鞋" />
                        <el-option label="跑步鞋" value="跑步鞋" />
                        <el-option label="足球鞋" value="足球鞋" />
                        <el-option label="训练鞋" value="训练鞋" />
                        <el-option label="户外鞋" value="户外鞋" />
                        <el-option label="登山鞋" value="登山鞋" />
                        <el-option label="滑板鞋" value="滑板鞋" />
                        <el-option label="休闲鞋" value="休闲鞋" />
                        <el-option label="正装鞋" value="正装鞋" />
                    </el-option-group>
                </el-select>
            </el-form-item>

            <el-form-item label="商品描述" prop="description">
                <el-input v-model="form.description" type="textarea" rows="4" placeholder="请输入商品描述" />
            </el-form-item>


            <el-form-item label="商品品牌" prop="brand">
                <el-input v-model="form.brand" placeholder="请输入商品品牌" />
            </el-form-item>

            <el-form-item label="鞋码" prop="size">
                <el-select v-model="form.size" placeholder="请选择鞋码">
                    <el-option v-for="size in shoesSizes" :key="size" :label="size" :value="size" />
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="submitForm">立即创建</el-button>
                <el-button @click="resetForm">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, UploadFilled } from '@element-plus/icons-vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const formRef = ref(null)

const shoesSizes = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45]

const form = reactive({
    name: '',
    imageUrl: '',
    price: 0,
    stock: 0,
    category: '',
    description: '',
    status: 1,
    brand: '',
    size: '',
})

const rules = {
    name: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    imageUrl: [
        { required: true, message: '请上传商品图片', trigger: 'change' }
    ],
    price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' }
    ],
    stock: [
        { required: true, message: '请输入商品库存', trigger: 'blur' }
    ],
    category: [
        { required: true, message: '请选择商品分类', trigger: 'change' }
    ],
    description: [
        { required: true, message: '请输入商品描述', trigger: 'blur' }
    ],
    brand: [
        { required: true, message: '请输入商品品牌', trigger: 'blur' },
        { min: 1, max: 20, message: '品牌名称长度在 1 到 20 字符', trigger: 'blur' }
    ],
    size: [
        { required: true, message: '请选择鞋码', trigger: 'change' }
    ]
}

const canCommit = ref(true)

// 上传成功后的回调
const handleAvatarSuccess = (response, uploadFile) => {
    canCommit.value = true
    form.imageUrl = response
    console.log('上传成功,图片URL:', form.imageUrl)
    ElMessage.success('图片上传成功')
}

// 上传前的验证
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

const dialogVisible = ref(false)

const showUploadDialog = () => {
    dialogVisible.value = true
}

const handleExcelSuccess = (response) => {
    if (response.code === 200) {
        ElMessage.success('Excel导入成功')
        dialogVisible.value = false
        router.push('/admin/products')
    } else {
        ElMessage.error(response.message || '导入失败')
    }
}

const beforeExcelUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isExcel) {
        ElMessage.error('只能上传 Excel 文件!')
        return false
    }
    if (!isLt2M) {
        ElMessage.error('文件大小不能超过 2MB!')
        return false
    }
    return true
}

const submitForm = async () => {
    if (!formRef.value || !canCommit.value) return

    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const productData = {
                    productName: form.name,
                    productDescription: form.description,
                    stockQuantity: form.stock,
                    brand: form.brand,
                    size: form.size,
                    price: form.price,
                    imageUrl: form.imageUrl
                }

                const response = await axios.post(
                    `http://22f8a8d6.r25.cpolar.top/admin/products/${form.category}`,
                    productData
                )

                if (response.data.code === 200) {
                    ElMessage.success('添加商品成功')
                    resetForm()
                } else {
                    ElMessage.error(response.data.message || '添加商品失败')
                }
            } catch (error) {
                console.error('添加商品出错：', error)
                ElMessage.error('添加商品失败，请稍后重试')
            }
        }
    })
}

const resetForm = () => {
    if (!formRef.value) return
    formRef.value.resetFields()
}

const router = useRouter()
</script>

<style scoped>
.add-product-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
}

.header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header h2 {
    margin: 0;
    font-size: 20px;
}

.product-form {
    max-width: 800px;
}

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

.excel-upload {
    margin-left: 20px;

    :deep(.el-upload-dragger) {
        width: 360px;
        height: 180px;
    }

    :deep(.el-icon--upload) {
        margin-top: 40px;
        font-size: 48px;
        color: #409EFF;
    }

    :deep(.el-upload__text) {
        margin-top: 20px;
        color: #606266;

        em {
            color: #409EFF;
            font-style: normal;
        }
    }

    :deep(.el-upload__tip) {
        font-size: 12px;
        color: #909399;
        margin-top: 8px;
    }
}
</style>