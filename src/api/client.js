import axios from "axios";
import { getUserId } from "../config/session";

const apiClient = axios.create({
  baseURL: "http://localhost:8081/api/v1",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const userId = getUserId();
    if (userId) {
      config.headers["X-User-Id"] = userId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
   
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else {
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;