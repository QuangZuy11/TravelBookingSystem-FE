import apiClient from "../config/apiClient";

const authService = {
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: ({ email, token, newPassword }) =>
    apiClient.post("/auth/reset-password", { email, token, newPassword }),
};

export default authService;