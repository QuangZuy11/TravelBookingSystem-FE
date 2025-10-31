import api from './api';

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (typeof value === 'boolean') {
      searchParams.append(key, value ? 'true' : 'false');
      return;
    }

    searchParams.append(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const extractData = (response) => {
  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data?.data ?? [];
};

const termsPolicyService = {
  async list(params = {}) {
    const query = buildQueryString(params);
    const response = await api.get(`/terms-policies${query}`);
    return extractData(response);
  },

  async listForCurrentUser(params = {}) {
    const query = buildQueryString(params);
    const response = await api.get(`/terms-policies/me${query}`);
    return extractData(response);
  },
};

export default termsPolicyService;
