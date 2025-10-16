// //src/api/axios.js
// import axios from "axios";

//   const api = axios.create({
//     baseURL: "http://127.0.0.1:8000",
//     withCredentials: false,
//   });

// // Attach access token to every request
// api.interceptors.request.use((config) => {
//   const auth = localStorage.getItem("vawsafeAuth");
//   if (auth) {
//     const { access } = JSON.parse(auth);
//     if (access) config.headers.Authorization = `Bearer ${access}`;
//   }
//   return config;
// });

// // Handle expired access tokens
// api.interceptors.response.use(
//   res => res,
//   async (err) => {
//     const originalRequest = err.config;

//     if (err.response && err.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const auth = localStorage.getItem("vawsafeAuth");
//       if (auth) {
//         const { refresh, user } = JSON.parse(auth);

//         try {
//           console.log("[Axios] Access token expired. Trying refresh...");

//           // 🔑 Call refresh endpoint
//           const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh });

//           if (res.status === 200) {
//             const { access, refresh: newRefresh } = res.data;

//             const updatedAuth = {
//               access,
//               refresh: newRefresh || refresh, // use new refresh if rotation is enabled
//               user
//             };

//             localStorage.setItem("vawsafeAuth", JSON.stringify(updatedAuth));

//             console.log("[Axios] Token refreshed successfully:");
//             console.log("   New access:", access.slice(0, 20) + "...");
//             if (newRefresh) {
//               console.log("   New refresh:", newRefresh.slice(0, 20) + "...");
//             } else {
//               console.log("   Refresh unchanged (rotation disabled).");
//             }

//             // retry original request with new access token
//             originalRequest.headers["Authorization"] = `Bearer ${access}`;
//             return api(originalRequest);
//           }
//         } catch (refreshErr) {
//           console.error("[Axios] Refresh token expired/invalid", refreshErr);
//           localStorage.removeItem("vawsafeAuth");
//           window.location.href = "/login";
//         }
//       }
//     }

//     return Promise.reject(err);
//   }
// );

//   api.interceptors.response.use(
//     res => res,
//     err => {
//       if (err.response && err.response.status === 401) {
//         // optional: clear localStorage and reload to force login
//         localStorage.removeItem("vawsafeAuth");
//         window.location.href = "/login";
//       }
//       return Promise.reject(err);
//     }
//   );

//   export default api;

// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// ---- CSRF on unsafe methods ----
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}
api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (["post", "put", "patch", "delete"].includes(method)) {
    const token = getCookie("csrftoken");
    if (token) config.headers["X-CSRFToken"] = token;
  }
  return config;
});

// ---- 401 -> refresh -> retry, but with guards ----
const AUTH_PATH_PREFIX = "/api/auth/";
const PUBLIC_GETS = new Set([
  "/api/auth/me/",          // seeds csrftoken; can be unauthenticated
  "/api/auth/check-dswd/",  // your public probe
]);

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err;
    const url = (config?.url || "");

    // If no response or not 401, bail
    if (!response || response.status !== 401) return Promise.reject(err);

    // Don’t try to refresh if:
    // - we’re already retrying
    // - it’s any /api/auth/* endpoint
    // - it’s a known public GET that can return 401/unauth states
    if (
      config._retry ||
      url.startsWith(AUTH_PATH_PREFIX) ||
      (config.method?.toLowerCase() === "get" && PUBLIC_GETS.has(url))
    ) {
      return Promise.reject(err);
    }

    // Mark so we don’t loop
    config._retry = true;

    try {
      // Attempt cookie-based refresh
      await api.post("/api/auth/refresh/"); // CSRF header auto-added by request interceptor
      // Retry original request after successful refresh
      return api(config);
    } catch (refreshErr) {
      // Refresh failed (no cookie or expired) -> surface original 401
      return Promise.reject(err);
    }
  }
);

export default api;
