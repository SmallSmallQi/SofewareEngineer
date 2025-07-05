// self-discipline-app/frontend/src/api/checkinRecords.js
import axios from './axiosInstance';

export const createCheckinRecord = async (recordData) => {
    try {
        const response = await axios.post('/checkins', recordData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCheckinRecords = async (filters = {}) => {
    try {
        // 将过滤器作为查询参数发送
        const response = await axios.get('/checkins', { params: filters });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateCheckinRecord = async (id, recordData) => {
    try {
        const response = await axios.put(`/checkins/${id}`, recordData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteCheckinRecord = async (id) => {
    try {
        const response = await axios.delete(`/checkins/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};