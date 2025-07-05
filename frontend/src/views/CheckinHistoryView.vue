<!-- self-discipline-app/frontend/src/views/CheckinHistoryView.vue -->
<template>
  <div class="checkin-history-container container">
    <h1>打卡历史</h1>

    <div class="card filters-card">
      <h3>筛选条件</h3>
      <form @submit.prevent="applyFilters">
        <div class="form-group">
          <label for="filterStartDate">开始日期:</label>
          <input type="date" id="filterStartDate" v-model="filters.startDate">
        </div>
        <div class="form-group">
          <label for="filterEndDate">结束日期:</label>
          <input type="date" id="filterEndDate" v-model="filters.endDate">
        </div>
        <div class="form-group">
          <label for="filterCheckinType">打卡内容类型:</label>
          <select id="filterCheckinType" v-model="filters.checkinTypeId">
            <option value="">所有类型</option>
            <option v-for="type in checkinTypes" :key="type._id" :value="type._id">{{ type.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="filterChallenge">挑战:</label>
          <select id="filterChallenge" v-model="filters.challengeId">
            <option value="">所有挑战</option>
            <option v-for="challenge in challenges" :key="challenge._id" :value="challenge._id">{{ challenge.name }}</option>
          </select>
        </div>
        <button type="submit">应用筛选</button>
        <button type="button" @click="clearFilters" class="cancel-button" style="margin-left: 10px;">清除筛选</button>
      </form>
    </div>

    <div class="card records-list">
      <h3>打卡记录</h3>
      <p v-if="listLoading">加载中...</p>
      <p v-else-if="listError" class="error-message">{{ listError }}</p>
      <p v-else-if="!records || records.length === 0">没有找到任何打卡记录。</p>
      <ul v-else class="checkin-record-ul">
        <li v-for="record in records" :key="record._id" class="checkin-record-item">
          <div class="record-details">
            <h4>{{ record.checkinTypeId?.name || '未知类型' }}</h4>
            <p><strong>日期:</strong> {{ formatDate(record.checkinDate) }}</p>
            <p v-if="record.value && record.value !== 1"><strong>值:</strong> {{ record.value }} {{ record.unit || '' }}</p>
            <p v-if="record.notes"><strong>备注:</strong> {{ record.notes }}</p>
            <p v-if="record.challengeId"><strong>挑战:</strong> {{ record.challengeId?.name || '未知挑战' }}</p>
            <p><strong>记录时间:</strong> {{ formatDateTime(record.createdAt) }}</p>
          </div>
          <div class="record-actions">
            <button @click="startEdit(record)" class="edit-button">编辑</button>
            <button @click="handleDeleteRecord(record._id)" class="delete-button" :disabled="deleteLoading[record._id]">
                {{ deleteLoading[record._id] ? '删除中...' : '删除' }}
            </button>
          </div>
        </li>
      </ul>
      <!-- 编辑弹窗或表单 -->
        <div v-if="editingRecord" class="edit-modal">
            <div class="modal-content card">
                <h3>编辑打卡记录</h3>
                <div class="form-group">
                    <label for="editCheckinType">打卡内容类型:</label>
                    <select id="editCheckinType" v-model="editRecord.checkinTypeId">
                        <option v-for="type in checkinTypes" :key="type._id" :value="type._id">{{ type.name }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editCheckinDate">打卡日期:</label>
                    <input type="date" id="editCheckinDate" v-model="editRecord.checkinDate">
                </div>
                <div class="form-group">
                    <label for="editValue">值:</label>
                    <input type="number" id="editValue" v-model.number="editRecord.value">
                </div>
                <div class="form-group">
                    <label for="editUnit">单位:</label>
                    <input type="text" id="editUnit" v-model="editRecord.unit">
                </div>
                <div class="form-group">
                    <label for="editNotes">备注:</label>
                    <textarea id="editNotes" v-model="editRecord.notes"></textarea>
                </div>
                <div class="form-group">
                    <label for="editChallenge">挑战:</label>
                    <select id="editChallenge" v-model="editRecord.challengeId">
                        <option value="">无挑战</option>
                        <option v-for="challenge in challenges" :key="challenge._id" :value="challenge._id">{{ challenge.name }}</option>
                    </select>
                </div>
                <button @click="handleUpdateRecord" :disabled="updateLoading">{{ updateLoading ? '保存中...' : '保存' }}</button>
                <button @click="cancelEdit" class="cancel-button" style="margin-left: 10px;">取消</button>
                <p v-if="updateError" class="error-message">{{ updateError }}</p>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getCheckinRecords, updateCheckinRecord, deleteCheckinRecord } from '../api/checkinRecords';
import { getCheckinTypes } from '../api/checkinTypes'; // 用于筛选和编辑时选择打卡类型
import { getChallenges } from '../api/challenges'; // 用于筛选和编辑时选择挑战

// 筛选条件
const filters = ref({
  startDate: '',
  endDate: '',
  checkinTypeId: '',
  challengeId: ''
});

// 数据列表
const records = ref([]);
const listLoading = ref(false);
const listError = ref('');

// 下拉选择数据
const checkinTypes = ref([]);
const challenges = ref([]);

// 编辑状态
const editingRecord = ref(null); // 当前正在编辑的记录对象
const editRecord = ref({}); // 用于修改的记录数据副本
const updateLoading = ref(false);
const updateError = ref('');

// 删除状态
const deleteLoading = ref({});

// 获取所有打卡内容类型和挑战 (用于筛选和编辑下拉框)
const fetchSelectData = async () => {
    try {
        const types = await getCheckinTypes();
        checkinTypes.value = types;
        console.log('CheckinHistoryView: 获取打卡内容类型成功:', types); // <-- 添加这行

        const chals = await getChallenges();
        challenges.value = chals;
        console.log('CheckinHistoryView: 获取挑战成功:', chals); // <-- 添加这行
    } catch (err) {
        console.error('CheckinHistoryView: 获取下拉数据失败:', err);
    }
};

// 获取打卡记录
const fetchCheckinRecords = async () => {
  listLoading.value = true;
  listError.value = '';
  try {
    const params = { ...filters.value };
    if (params.startDate) params.startDate = new Date(params.startDate).toISOString();
    if (params.endDate) params.endDate = new Date(params.endDate).toISOString();

    const recordsData = await getCheckinRecords(params);
    records.value = recordsData;
    console.log('CheckinHistoryView: 获取打卡记录成功:', recordsData); // <-- 添加这行
  } catch (err) {
    listError.value = err.response?.data?.message || '获取打卡记录失败。';
    console.error('CheckinHistoryView: 获取打卡记录错误:', err);
  } finally {
    listLoading.value = false;
  }
};

// 应用筛选
const applyFilters = () => {
  fetchCheckinRecords();
};

// 清除筛选
const clearFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    checkinTypeId: '',
    challengeId: ''
  };
  fetchCheckinRecords(); // 清除后重新获取所有记录
};

// 开始编辑模式
const startEdit = (record) => {
  editingRecord.value = record;
  // 创建一个副本用于编辑，并格式化日期
  editRecord.value = {
    ...record,
    checkinTypeId: record.checkinTypeId?._id || '', // 确保是 ID
    challengeId: record.challengeId?._id || '', // 确保是 ID
    checkinDate: record.checkinDate ? new Date(record.checkinDate).toISOString().split('T')[0] : '', // YYYY-MM-DD
  };
  updateError.value = ''; // 清除之前的错误
};

// 取消编辑
const cancelEdit = () => {
  editingRecord.value = null;
  editRecord.value = {};
  updateError.value = '';
};

// 更新打卡记录
const handleUpdateRecord = async () => {
  updateError.value = '';
  updateLoading.value = true;
  try {
    const recordId = editingRecord.value._id;
    const dataToUpdate = {
        ...editRecord.value
    };
    // 转换日期为 ISO 格式
    if (dataToUpdate.checkinDate) {
        dataToUpdate.checkinDate = new Date(dataToUpdate.checkinDate).toISOString();
    }

    const updatedRecord = await updateCheckinRecord(recordId, dataToUpdate);

    // 更新列表中的数据，保持 populate 后的数据
    const index = records.value.findIndex(r => r._id === recordId);
    if (index !== -1) {
        // 由于 populate 字段在前端更新后不会自动回来，这里需要重新获取列表或手动更新
        // 为了简单起见，这里直接调用 fetchCheckinRecords 重新加载，这在实际应用中更可靠
        // 如果需要更精细的更新，可以根据 updatedRecord 提供的 ID 和 name 更新本地的 checkinTypeId 和 challengeId 显示
        await fetchCheckinRecords();
    }
    alert('打卡记录更新成功！');
    cancelEdit();
  } catch (err) {
    updateError.value = err.response?.data?.message || '更新打卡记录失败。';
    console.error('更新打卡记录错误:', err);
  } finally {
    updateLoading.value = false;
  }
};

// 删除打卡记录
const handleDeleteRecord = async (id) => {
  if (!confirm('确定要删除这条打卡记录吗？')) {
    return;
  }
  deleteLoading.value[id] = true;
  try {
    await deleteCheckinRecord(id);
    records.value = records.value.filter(record => record._id !== id);
    alert('打卡记录删除成功！');
  } catch (err) {
    alert(err.response?.data?.message || '删除打卡记录失败。');
    console.error('删除打卡记录错误:', err);
  } finally {
    deleteLoading.value[id] = false;
  }
};

// 格式化日期显示（仅日期）
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

// 格式化日期时间显示
const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(); // 包含日期和时间
};

// 组件挂载时获取数据
onMounted(() => {
  console.log('CheckinHistoryView: onMounted 钩子触发，开始加载数据...'); // <-- 添加这行
  fetchSelectData();
  fetchCheckinRecords();
});

// 监听 filters 变化，自动重新获取记录 (可选，如果希望筛选条件改变就立即更新)
// watch(filters, fetchCheckinRecords, { deep: true }); // 如果希望输入就立即筛选，可以使用这个
</script>

<style scoped>
.checkin-history-container {
  padding-top: 30px;
}

.checkin-history-container h1 {
  text-align: center;
  margin-bottom: 30px;
}

.filters-card {
  margin-bottom: 30px;
}

.filters-card form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.filters-card button {
  margin-top: 10px;
}

.records-list ul {
  list-style: none;
  padding: 0;
}

.checkin-record-item {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* 允许换行 */
}

.record-details {
  flex-grow: 1;
}

.record-details h4 {
  margin: 0 0 5px 0;
  color: var(--secondary-color);
}

.record-details p {
  margin: 0 0 3px 0;
  font-size: 0.9em;
  color: #555;
}

.record-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px; /* 移动到下一行时留间距 */
}

/* 编辑弹窗样式 */
.edit-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: var(--card-bg);
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    max-height: 80vh; /* 限制高度 */
    overflow-y: auto; /* 允许滚动 */
}

/* 按钮样式复用自 main.css */
.edit-button {
  background-color: #3498db;
}
.edit-button:hover {
  background-color: #2980b9;
}
.delete-button {
  background-color: var(--error-color);
}
.delete-button:hover {
  background-color: #c0392b;
}
.cancel-button {
  background-color: #95a5a6;
}
.cancel-button:hover {
  background-color: #7f8c8d;
}
</style>