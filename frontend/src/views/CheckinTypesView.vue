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
      <p v-else-if="checkinTypes.length === 0">您还没有创建任何打卡内容，快去创建一个吧！</p>
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

// 获取所有打卡内容
const fetchCheckinTypes = async () => {
  listLoading.value = true;
  listError.value = '';
  try {
    checkinTypes.value = await getCheckinTypes();
  } catch (err) {
    listError.value = err.response?.data?.message || '获取打卡内容失败。';
    console.error('获取打卡内容错误:', err);
  } finally {
    listLoading.value = false;
  }
};

// 添加打卡内容
const handleAddCheckinType = async () => {
  addError.value = '';
  addLoading.value = true;
  try {
    const createdType = await createCheckinType(newCheckinTypeName.value, newCheckinTypeDescription.value);
    checkinTypes.value.unshift(createdType); // 添加到列表顶部
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
  updateError.value = ''; // 清除编辑错误
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
      checkinTypes.value[index] = updatedType; // 更新列表中的数据
    }
    alert('打卡内容更新成功！');
    cancelEdit(); // 退出编辑模式
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
  deleteLoading.value[id] = true; // 设置单独的删除加载状态
  try {
    await deleteCheckinType(id);
    checkinTypes.value = checkinTypes.value.filter(type => type._id !== id); // 从列表中移除
    alert('打卡内容删除成功！');
  } catch (err) {
    alert(err.response?.data?.message || '删除打卡内容失败。');
    console.error('删除打卡内容错误:', err);
  } finally {
    deleteLoading.value[id] = false;
  }
};

// 组件挂载时获取打卡内容列表
onMounted(() => {
  fetchCheckinTypes();
});
</script>

<style scoped>
.checkin-types-container {
  padding-top: 30px;
}

.checkin-types-container h1 {
  text-align: center;
  margin-bottom: 30px;
}

.create-form-card {
  margin-bottom: 30px;
}

.checkin-types-list ul {
  list-style: none;
  padding: 0;
}

.checkin-type-item {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checkin-type-item h4 {
  margin: 0;
  color: var(--secondary-color);
}

.checkin-type-item p {
  margin: 0;
  font-size: 0.95em;
  color: #666;
}

.actions, .edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.edit-button, .update-button {
  background-color: #3498db; /* 蓝色 */
}

.edit-button:hover, .update-button:hover {
  background-color: #2980b9;
}

.delete-button {
  background-color: var(--error-color); /* 红色 */
}

.delete-button:hover {
  background-color: #c0392b;
}

.cancel-button {
  background-color: #95a5a6; /* 灰色 */
}
.cancel-button:hover {
  background-color: #7f8c8d;
}

.edit-input, .edit-textarea {
  margin-bottom: 5px;
}
</style>