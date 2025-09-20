  // src/api/axios.js
  import axios from "axios";

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    withCredentials: false,
  });

  api.interceptors.request.use((config) => {
    const auth = localStorage.getItem("vawsafeAuth");
    if (auth) {
      const token = JSON.parse(auth).access;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    res => res,
    err => {
      if (err.response && err.response.status === 401) {
        // optional: clear localStorage and reload to force login
        localStorage.removeItem("vawsafeAuth");
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );

  export default api;
