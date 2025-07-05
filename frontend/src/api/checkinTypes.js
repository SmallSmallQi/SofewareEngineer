// self-discipline-app/frontend/src/api/checkinTypes.js
import axios from './axiosInstance';

export const createCheckinType = async (name, description) => {
    const response = await axios.post('/checkin-types', { name, description });
    return response.data;
};

export const getCheckinTypes = async () => {
    const response = await axios.get('/checkin-types');
    return response.data;
};

export const updateCheckinType = async (id, name, description) => {
    const response = await axios.put(`/checkin-types/${id}`, { name, description });
    return response.data;
};

export const deleteCheckinType = async (id) => {
    const response = await axios.delete(`/checkin-types/${id}`);
    return response.data;
};