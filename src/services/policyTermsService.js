import apiClient from '../config/apiClient';

const policyTermsService = {
  async list() {
    const response = await apiClient.get('/admin/terms-policies');
    return response?.data?.data ?? [];
  },

  async create(payload) {
    const response = await apiClient.post('/admin/terms-policies', payload);
    return response?.data?.data ?? null;
  },

  async update(id, payload) {
    if (!id) {
      throw new Error('Missing policy terms id');
    }

    const response = await apiClient.put(`/admin/terms-policies/${id}`, payload);
    return response?.data?.data ?? null;
  },

  async remove(id) {
    if (!id) {
      throw new Error('Missing policy terms id');
    }

    const response = await apiClient.delete(`/admin/terms-policies/${id}`);
    return response?.data ?? null;
  },

  async getById(id) {
    if (!id) {
      throw new Error('Missing policy terms id');
    }

    const response = await apiClient.get(`/admin/terms-policies/${id}`);
    return response?.data?.data ?? null;
  },
};

export default policyTermsService;
