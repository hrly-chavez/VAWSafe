// src/context/AuthContext.js
// import { createContext, useState } from "react";
// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const stored = localStorage.getItem("vawsafeAuth");
//     return stored ? JSON.parse(stored).user : null;
//   });

//   const login = (userData, tokens) => {
//     // Store user and token
//     localStorage.setItem(
//       "vawsafeAuth",
//       JSON.stringify({ ...tokens, user: userData })
//     );
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem("vawsafeAuth"); // remove everything
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

import { createContext, useEffect, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // 1) make sure CSRFTOKEN is set for this host
        await api.get("/api/auth/me/"); // @ensure_csrf_cookie seeds csrftoken (even if not authenticated)

        // 2) silently refresh access (if refresh cookie exists & valid)
        try { await api.post("/api/auth/refresh/"); } catch {}

        // 3) now get the user
        const me = await api.get("/api/auth/me/");
        if (mounted && me.data?.authenticated) {
          setUser(me.data.user);
        }
      } finally {
        if (mounted) setBootstrapped(true);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const login  = (userData) => setUser(userData);
  const logout = async () => {
    try { await api.post("/api/auth/logout/"); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, bootstrapped }}>
      {children}
    </AuthContext.Provider>
  );
}
