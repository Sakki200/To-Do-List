import axios from "axios";
import cookie from "js-cookie";

const apiClient = axios.create({
  baseURL: process.env.PUBLIC_URL_API,
  withCredentials: true, 
});

apiClient.interceptors.request.use((config) => {
  const token = cookie.get("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default apiClient;
