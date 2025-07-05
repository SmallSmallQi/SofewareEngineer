<!-- self-discipline-app/frontend/src/views/ChallengesView.vue -->
<template>
  <div class="challenges-container container">
    <h1>我的挑战</h1>

    <div class="card create-form-card">
      <h3>创建新挑战</h3>
      <form @submit.prevent="handleAddChallenge">
        <div class="form-group">
          <label for="challengeName">挑战名称:</label>
          <input type="text" id="challengeName" v-model="newChallenge.name" required>
        </div>
        <div class="form-group">
          <label for="challengeDescription">描述 (可选):</label>
          <textarea id="challengeDescription" v-model="newChallenge.description"></textarea>
        </div>
        <div class="form-group">
          <label for="challengeStartDate">开始日期:</label>
          <input type="date" id="challengeStartDate" v-model="newChallenge.startDate" required>
        </div>
        <div class="form-group">
          <label for="challengeEndDate">结束日期:</label>
          <input type="date" id="challengeEndDate" v-model="newChallenge.endDate" required>
        </div>
        <div class="form-group">
            <label for="challengeCheckinType">关联打卡内容 (可选):</label>
            <select id="challengeCheckinType" v-model="newChallenge.checkinTypeId">
                <option value="">无关联</option>
                <option v-for="type in checkinTypes" :key="type._id" :value="type._id">{{ type.name }}</option>
            </select>
        </div>
        <div class="form-group">
            <label for="challengeTargetValue">目标值 (可选):</label>
            <input type="number" id="challengeTargetValue" v-model.number="newChallenge.targetValue">
        </div>
        <div class="form-group">
            <label for="challengeTargetUnit">目标单位 (可选):</label>
            <input type="text" id="challengeTargetUnit" v-model="newChallenge.targetUnit">
        </div>
        <div class="form-group">
            <label for="challengeFrequency">频率:</label>
            <select id="challengeFrequency" v-model="newChallenge.frequency" required>
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="custom">自定义</option>
            </select>
        </div>

        <button type="submit" :disabled="addLoading">{{ addLoading ? '创建中...' : '创建挑战' }}</button>
        <p v-if="addError" class="error-message">{{ addError }}</p>
      </form>
    </div>

    <div class="card challenges-list">
      <h3>所有挑战</h3>
      <p v-if="listLoading">加载中...</p>
      <p v-else-if="listError" class="error-message">{{ listError }}</p>
      <p v-else-if="!challenges || challenges.length === 0">您还没有创建任何挑战，快去创建一个吧！</p>
      <ul v-else class="challenge-ul">
        <li v-for="challenge in challenges" :key="challenge._id" class="challenge-item">
          <div v-if="editingId === challenge._id" class="edit-mode">
            <input type="text" v-model="editChallenge.name" required>
            <textarea v-model="editChallenge.description"></textarea>
            <input type="date" v-model="editChallenge.startDate" required>
            <input type="date" v-model="editChallenge.endDate" required>
            <select v-model="editChallenge.checkinTypeId">
                <option value="">无关联</option>
                <option v-for="type in checkinTypes" :key="type._id" :value="type._id">{{ type.name }}</option>
            </select>
            <input type="number" v-model.number="editChallenge.targetValue">
            <input type="text" v-model="editChallenge.targetUnit">
            <select v-model="editChallenge.frequency" required>
                <option value="daily">每日</option>
                <option value="weekly">每周</option>
                <option value="custom">自定义</option>
            </select>
            <div class="edit-actions">
              <button @click="handleUpdateChallenge(challenge._id)" class="update-button" :disabled="updateLoading">
                {{ updateLoading ? '保存中...' : '保存' }}
              </button>
              <button @click="cancelEdit" class="cancel-button">取消</button>
            </div>
            <p v-if="updateError" class="error-message">{{ updateError }}</p>
          </div>
          <div v-else class="view-mode">
            <h4>{{ challenge.name }}</h4>
            <p>{{ challenge.description || '无描述' }}</p>
            <p><strong>日期:</strong> {{ formatDate(challenge.startDate) }} - {{ formatDate(challenge.endDate) }}</p>
            <p v-if="challenge.checkinTypeId"><strong>关联打卡:</strong> {{ challenge.checkinTypeId.name }}</p>
            <p v-if="challenge.targetValue"><strong>目标:</strong> {{ challenge.targetValue }} {{ challenge.targetUnit }}</p>
            <p><strong>频率:</strong> {{ getFrequencyText(challenge.frequency) }}</p>
            <p><strong>进度:</strong> {{ challenge.currentProgress }} / {{ challenge.targetValue || '无目标' }}</p>
            <p><strong>状态:</strong> <span :class="{'active': challenge.isActive, 'inactive': !challenge.isActive}">{{ challenge.isActive ? '活跃' : '已完成/暂停' }}</span></p>
            <div class="actions">
              <button @click="startEdit(challenge)" class="edit-button">编辑</button>
              <button @click="handleDeleteChallenge(challenge._id)" class="delete-button" :disabled="deleteLoading[challenge._id]">
                {{ deleteLoading[challenge._id] ? '删除中...' : '删除' }}
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
import { createChallenge, getChallenges, updateChallenge, deleteChallenge } from '../api/challenges';
import { getCheckinTypes } from '../api/checkinTypes'; // 导入获取打卡内容类型的API

// 新建挑战表单数据
const newChallenge = ref({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  checkinTypeId: '', // 用于下拉选择关联的打卡类型ID
  targetValue: 0,
  targetUnit: '',
  frequency: 'daily',
});
const addLoading = ref(false);
const addError = ref('');

// 挑战列表
const challenges = ref([]);
const listLoading = ref(false);
const listError = ref('');

// 打卡内容类型列表 (用于选择关联类型)
const checkinTypes = ref([]);

// 编辑状态
const editingId = ref(null);
const editChallenge = ref({}); // 用于编辑当前挑战的数据
const updateLoading = ref(false);
const updateError = ref('');

// 删除状态
const deleteLoading = ref({});

// 获取所有打卡内容类型
const fetchCheckinTypes = async () => {
  try {
    const types = await getCheckinTypes();
    checkinTypes.value = types;
    console.log('ChallengesView: 获取打卡内容类型成功:', types); // <-- 添加这行
  } catch (err) {
    console.error('ChallengesView: 获取打卡内容类型失败:', err);
  }
};

// 获取所有挑战
const fetchChallenges = async () => {
  listLoading.value = true;
  listError.value = '';
  try {
    const fetchedChallenges = await getChallenges();
    challenges.value = fetchedChallenges;
    console.log('ChallengesView: 获取挑战成功:', fetchedChallenges); // <-- 添加这行
  } catch (err) {
    listError.value = err.response?.data?.message || '获取挑战失败。';
    console.error('ChallengesView: 获取挑战错误:', err);
  } finally {
    listLoading.value = false;
  }
};

// 添加挑战
const handleAddChallenge = async () => {
    addError.value = '';
    addLoading.value = true;

    // 格式化日期确保后端能够正确解析 (例如，new Date().toISOString().split('T')[0] 得到的 'YYYY-MM-DD')
    const challengeData = {
        ...newChallenge.value,
        startDate: newChallenge.value.startDate ? new Date(newChallenge.value.startDate).toISOString() : '',
        endDate: newChallenge.value.endDate ? new Date(newChallenge.value.endDate).toISOString() : '',
    };

    try {
        const createdChallenge = await createChallenge(challengeData);
        challenges.value.unshift(createdChallenge); // 添加到列表顶部
        // 重置表单
        newChallenge.value = {
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            checkinTypeId: '',
            targetValue: 0,
            targetUnit: '',
            frequency: 'daily',
        };
        alert('挑战创建成功！');
    } catch (err) {
        addError.value = err.response?.data?.message || '创建挑战失败。';
        console.error('创建挑战错误:', err);
    } finally {
        addLoading.value = false;
    }
};

// 开始编辑模式
const startEdit = (challenge) => {
  editingId.value = challenge._id;
  // Deep copy the challenge object for editing
  editChallenge.value = { 
    ...challenge,
    // 格式化日期为 input[type="date"] 接受的 'YYYY-MM-DD' 格式
    startDate: challenge.startDate ? new Date(challenge.startDate).toISOString().split('T')[0] : '',
    endDate: challenge.endDate ? new Date(challenge.endDate).toISOString().split('T')[0] : '',
    // 如果 checkinTypeId 是一个对象，需要提取其_id
    checkinTypeId: challenge.checkinTypeId?._id || ''
  };
  updateError.value = ''; // 清除编辑错误
};

// 取消编辑模式
const cancelEdit = () => {
  editingId.value = null;
  editChallenge.value = {};
  updateError.value = '';
};

// 更新挑战
const handleUpdateChallenge = async (id) => {
    updateError.value = '';
    updateLoading.value = true;

    // 格式化日期
    const updatedData = {
        ...editChallenge.value,
        startDate: editChallenge.value.startDate ? new Date(editChallenge.value.startDate).toISOString() : '',
        endDate: editChallenge.value.endDate ? new Date(editChallenge.value.endDate).toISOString() : '',
    };

    try {
        const updatedChallenge = await updateChallenge(id, updatedData);
        const index = challenges.value.findIndex(c => c._id === id);
        if (index !== -1) {
            challenges.value[index] = updatedChallenge; // 更新列表中的数据
        }
        alert('挑战更新成功！');
        cancelEdit(); // 退出编辑模式
    } catch (err) {
        updateError.value = err.response?.data?.message || '更新挑战失败。';
        console.error('更新挑战错误:', err);
    } finally {
        updateLoading.value = false;
    }
};

// 删除挑战
const handleDeleteChallenge = async (id) => {
  if (!confirm('确定要删除这个挑战吗？这将不可逆。')) {
    return;
  }
  deleteLoading.value[id] = true;
  try {
    await deleteChallenge(id);
    challenges.value = challenges.value.filter(c => c._id !== id); // 从列表中移除
    alert('挑战删除成功！');
  } catch (err) {
    alert(err.response?.data?.message || '删除挑战失败。');
    console.error('删除挑战错误:', err);
  } finally {
    deleteLoading.value[id] = false;
  }
};

// 格式化日期显示
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(); // 根据当地语言环境格式化日期
};

// 获取频率文本
const getFrequencyText = (frequency) => {
    switch (frequency) {
        case 'daily': return '每日';
        case 'weekly': return '每周';
        case 'custom': return '自定义';
        default: return frequency;
    }
};

onMounted(() => {
  console.log('ChallengesView: onMounted 钩子触发，开始加载数据...'); // <-- 添加这行
  fetchCheckinTypes();
  fetchChallenges();
});
</script>

<style scoped>
.challenges-container {
  padding-top: 30px;
}

.challenges-container h1 {
  text-align: center;
  margin-bottom: 30px;
}

.create-form-card {
  margin-bottom: 30px;
}

.challenges-list ul {
  list-style: none;
  padding: 0;
}

.challenge-item {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.challenge-item h4 {
  margin: 0;
  color: var(--secondary-color);
}

.challenge-item p {
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

.edit-mode input,
.edit-mode textarea,
.edit-mode select {
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.active {
    color: var(--primary-color);
    font-weight: bold;
}

.inactive {
    color: #e67e22; /* 橙色表示不活跃或完成 */
    font-weight: bold;
}
</style>