//src/api/axios.js
import axios from "axios";

  const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    withCredentials: false,
  });

// Attach access token to every request
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem("vawsafeAuth");
  if (auth) {
    const { access } = JSON.parse(auth);
    if (access) config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Handle expired access tokens
api.interceptors.response.use(
  res => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const auth = localStorage.getItem("vawsafeAuth");
      if (auth) {
        const { refresh, user } = JSON.parse(auth);

        try {
          console.log("[Axios] Access token expired. Trying refresh...");

          // 🔑 Call refresh endpoint
          const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });

          if (res.status === 200) {
            const { access, refresh: newRefresh } = res.data;

            const updatedAuth = {
              access,
              refresh: newRefresh || refresh, // use new refresh if rotation is enabled
              user
            };

            localStorage.setItem("vawsafeAuth", JSON.stringify(updatedAuth));

            console.log("[Axios] Token refreshed successfully:");
            console.log("   New access:", access.slice(0, 20) + "...");
            if (newRefresh) {
              console.log("   New refresh:", newRefresh.slice(0, 20) + "...");
            } else {
              console.log("   Refresh unchanged (rotation disabled).");
            }

            // retry original request with new access token
            originalRequest.headers["Authorization"] = `Bearer ${access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          console.error("[Axios] Refresh token expired/invalid", refreshErr);
          localStorage.removeItem("vawsafeAuth");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(err);
  }
);

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
