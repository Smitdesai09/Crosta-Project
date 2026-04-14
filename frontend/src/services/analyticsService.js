import api from './api'; // Adjust this import based on your actual axios instance path

const analyticsService = {
  getAnalytics: async (params) => {
    const response = await api.get('/api/analytics', { params });
    return response;
  },
  downloadAnalyticsReport: async (params) => {
    const response = await api.get('/api/analytics/export', {
      params,
      responseType: 'blob'
    });
    return response;
  }
};

export default analyticsService;
