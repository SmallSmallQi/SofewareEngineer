// self-discipline-app/frontend/src/api/challenges.js
import axios from './axiosInstance';

export const createChallenge = async (challengeData) => {
    try {
        const response = await axios.post('/challenges', challengeData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getChallenges = async () => {
    try {
        const response = await axios.get('/challenges');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getChallengeById = async (id) => {
    try {
        const response = await axios.get(`/challenges/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};


export const updateChallenge = async (id, challengeData) => {
    try {
        const response = await axios.put(`/challenges/${id}`, challengeData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteChallenge = async (id) => {
    try {
        const response = await axios.delete(`/challenges/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};