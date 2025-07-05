<!-- self-discipline-app/frontend/src/views/CheckinTypesView.vue -->
<template>
  <div class="checkin-types-container container">
    <h1>打卡内容管理</h1>

    <div class="card create-form-card">
      <h3>创建新的打卡内容</h3>
      <form @submit.prevent="handleAddCheckinType">
        <div class="form-group">
          <label for="newCheckinTypeName">名称:</label>
          <input type="text" id="newCheckinTypeName" v-model="newCheckinTypeName" required>
        </div>
        <div class="form-group">
          <label for="newCheckinTypeDescription">描述 (可选):</label>
          <textarea id="newCheckinTypeDescription" v-model="newCheckinTypeDescription"></textarea>
        </div>
        <button type="submit" :disabled="addLoading">{{ addLoading ? '添加中...' : '添加打卡内容' }}</button>
        <p v-if="addError" class="error-message">{{ addError }}</p>
      </form>
    </div>

    <div class="card checkin-types-list">
      <h3>我的打卡内容</h3>
      <p v-if="listLoading">加载中...</p>
      <p v-else-if="listError" class="error-message">{{ listError }}</p>
      <!-- 这里的条件判断已经包含对 checkinTypes 为空或 undefined 的检查 -->
      <p v-else-if="!checkinTypes || checkinTypes.length === 0">您还没有创建任何打卡内容，快去创建一个吧！</p>
      <ul v-else class="checkin-type-ul">
        <li v-for="type in checkinTypes" :key="type._id" class="checkin-type-item">
          <div v-if="editingId === type._id" class="edit-mode">
            <input type="text" v-model="editName" class="edit-input" required>
            <textarea v-model="editDescription" class="edit-textarea"></textarea>
            <div class="edit-actions">
              <button @click="handleUpdateCheckinType(type._id)" class="update-button" :disabled="updateLoading">
                {{ updateLoading ? '保存中...' : '保存' }}
              </button>
              <button @click="cancelEdit" class="cancel-button">取消</button>
            </div>
            <p v-if="updateError" class="error-message">{{ updateError }}</p>
          </div>
          <div v-else class="view-mode">
            <h4>{{ type.name }}</h4>
            <p>{{ type.description || '无描述' }}</p>
            <div class="actions">
              <button @click="startEdit(type)" class="edit-button">编辑</button>
              <button @click="handleCheckin(type._id)" class="checkin-button" :disabled="checkinLoading[type._id]">
                {{ checkinLoading[type._id] ? '打卡中...' : '打卡' }}
              </button>
              <button @click="handleDeleteCheckinType(type._id)" class="delete-button" :disabled="deleteLoading[type._id]">
                {{ deleteLoading[type._id] ? '删除中...' : '删除' }}
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { createCheckinType, getCheckinTypes, updateCheckinType, deleteCheckinType } from '../api/checkinTypes';
import { createCheckinRecord } from '../api/checkinRecords';

// 添加新打卡内容
const newCheckinTypeName = ref('');
const newCheckinTypeDescription = ref('');
const addLoading = ref(false);
const addError = ref('');

// 打卡内容列表
const checkinTypes = ref([]);
const listLoading = ref(false);
const listError = ref('');

// 编辑状态
const editingId = ref(null);
const editName = ref('');
const editDescription = ref('');
const updateLoading = ref(false);
const updateError = ref('');

// 删除状态
const deleteLoading = ref({});

// 打卡状态
const checkinLoading = ref({});

// 获取所有打卡内容
const fetchCheckinTypes = async () => {
  listLoading.value = true;
  listError.value = '';
  try {
    const types = await getCheckinTypes();
    checkinTypes.value = types;
    console.log('CheckinTypesView: 获取打卡内容类型成功:', types);
  } catch (err) {
    listError.value = err.response?.data?.message || '获取打卡内容失败。';
    console.error('CheckinTypesView: 获取打卡内容错误:', err);
  } finally {
    listLoading.value = false;
  }
};

// 处理打卡内容添加
const handleAddCheckinType = async () => {
  addError.value = '';
  addLoading.value = true;
  try {
    const createdType = await createCheckinType(newCheckinTypeName.value, newCheckinTypeDescription.value);
    checkinTypes.value.unshift(createdType);
    newCheckinTypeName.value = '';
    newCheckinTypeDescription.value = '';
    alert('打卡内容添加成功！');
  } catch (err) {
    addError.value = err.response?.data?.message || '添加打卡内容失败。';
    console.error('添加打卡内容错误:', err);
  } finally {
    addLoading.value = false;
  }
};

// 开始编辑模式
const startEdit = (type) => {
  editingId.value = type._id;
  editName.value = type.name;
  editDescription.value = type.description;
  updateError.value = '';
};

// 取消编辑模式
const cancelEdit = () => {
  editingId.value = null;
  editName.value = '';
  editDescription.value = '';
  updateError.value = '';
};

// 更新打卡内容
const handleUpdateCheckinType = async (id) => {
  updateError.value = '';
  updateLoading.value = true;
  try {
    const updatedType = await updateCheckinType(id, editName.value, editDescription.value);
    const index = checkinTypes.value.findIndex(type => type._id === id);
    if (index !== -1) {
      checkinTypes.value[index] = updatedType;
    }
    alert('打卡内容更新成功！');
    cancelEdit();
  } catch (err) {
    updateError.value = err.response?.data?.message || '更新打卡内容失败。';
    console.error('更新打卡内容错误:', err);
  } finally {
    updateLoading.value = false;
  }
};

// 删除打卡内容
const handleDeleteCheckinType = async (id) => {
  if (!confirm('确定要删除这个打卡内容吗？这将不可逆。')) {
    return;
  }
  deleteLoading.value[id] = true;
  try {
    await deleteCheckinType(id);
    checkinTypes.value = checkinTypes.value.filter(type => type._id !== id);
    alert('打卡内容删除成功！');
  } catch (err) {
    alert(err.response?.data?.message || '删除打卡内容失败。');
    console.error('删除打卡内容错误:', err);
  } finally {
    deleteLoading.value[id] = false;
  }
};

// 处理打卡
const handleCheckin = async (checkinTypeId) => {
  checkinLoading.value[checkinTypeId] = true;
  try {
    // 默认打卡值为 1，你可以根据需要添加一个弹窗让用户输入值和备注
    await createCheckinRecord({ checkinTypeId, value: 1, notes: '快速打卡' });
    alert('打卡成功！');
  } catch (err) {
    alert(err.response?.data?.message || '打卡失败。');
    console.error('打卡错误:', err);
  } finally {
    checkinLoading.value[checkinTypeId] = false;
  }
};

// 组件挂载时获取打卡内容列表
onMounted(() => {
  console.log('CheckinTypesView: onMounted 钩子触发，开始加载数据...');
  fetchCheckinTypes(); // 现在 fetchCheckinTypes 应该已经定义了
});
</script>

<style scoped>
/* 基本容器和卡片样式 */
.checkin-types-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--background-color-light);
  border-radius: 8px;
  box-shadow: var(--shadow-light);
}

h1 {
  color: var(--text-color-dark);
  text-align: center;
  margin-bottom: 2rem;
}

.card {
  background-color: var(--background-color-card);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  margin-bottom: 1.5rem;
}

.card h3 {
  color: var(--primary-color);
  margin-top: 0;
  margin-bottom: 1rem;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color-medium);
  font-weight: bold;
}

.form-group input[type="text"],
.form-group textarea {
  width: calc(100% - 20px); /* 减去 padding */
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--text-color-dark);
  background-color: var(--input-background-color);
  transition: border-color 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

button[type="submit"] {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 列表样式 */
.checkin-type-ul {
  list-style: none;
  padding: 0;
}

.checkin-type-item {
  background-color: var(--background-color-item);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-item);
  display: flex;
  flex-direction: column;
}

.view-mode h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color-dark);
}

.view-mode p {
  color: var(--text-color-medium);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.actions button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
  color: white;
}

.edit-button {
  background-color: var(--accent-color);
}

.edit-button:hover {
  background-color: var(--accent-color-dark);
}

.checkin-button {
  background-color: var(--primary-color); /* 可以和主色调一致 */
}

.checkin-button:hover {
  background-color: #369a6c;
}

.delete-button {
  background-color: var(--danger-color);
}

.delete-button:hover {
  background-color: var(--danger-color-dark);
}

.delete-button:disabled,
.checkin-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 编辑模式样式 */
.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.edit-input, .edit-textarea {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--text-color-dark);
}

.edit-input:focus, .edit-textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.update-button {
  background-color: var(--primary-color);
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.update-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.update-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-button {
  background-color: var(--secondary-color);
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.cancel-button:hover {
  background-color: var(--secondary-color-dark);
}

/* 错误消息 */
.error-message {
  color: var(--danger-color);
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .checkin-types-container {
    padding: 1rem;
    margin: 1rem auto;
  }
  .actions button {
    width: 100%; /* 小屏幕下按钮堆叠 */
  }
}
</style>