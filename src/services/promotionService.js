import apiClient from '../config/apiClient';

const promotionService = {
  createPromotion: (data) => apiClient.post('/provider/promotions', data),
  getMyPromotions: (params) => apiClient.get('/provider/promotions', { params }),
  getPromotionById: (promotionId) => apiClient.get(`/provider/promotions/${promotionId}`),
  updatePromotion: (promotionId, data) => apiClient.patch(`/provider/promotions/${promotionId}`, data),
  deletePromotion: (promotionId) => apiClient.delete(`/provider/promotions/${promotionId}`),
  getActivePromotions: (query) => apiClient.get('/traveler/promotions', { params: query }),
};

export default promotionService;
