import api from './api'; // Adjust this import based on your actual axios instance path

const analyticsService = {
  getAnalytics: async (params) => {
    const response = await api.get('/api/analytics', { params });
    return response;
  }
};

export default analyticsService;