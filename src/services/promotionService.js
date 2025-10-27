import apiClient from '../config/apiClient';

const promotionService = {
  createPromotion: (data) => apiClient.post('/provider/promotions', data),
  getMyPromotions: (params) => apiClient.get('/provider/promotions', { params }),
  getActivePromotions: (query) => apiClient.get('/traveler/promotions', { params: query }),
};

export default promotionService;
