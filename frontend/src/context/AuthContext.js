// src/context/AuthContext.js
import { createContext, useState } from "react";

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     const stored = localStorage.getItem("vawsafeAuth");
//     return stored ? JSON.parse(stored) : null;
//   });

//   const login = (data) => {
//     localStorage.setItem("vawsafeAuth", JSON.stringify(data));
//     setUser(data);
//   };

//   const logout = () => {
//     localStorage.removeItem("vawsafeAuth");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("vawsafeAuth");
    return stored ? JSON.parse(stored).user : null;
  });

  const login = (userData, tokens) => {
    // Store user and token
    localStorage.setItem(
      "vawsafeAuth",
      JSON.stringify({ ...tokens, user: userData })
    );
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("vawsafeAuth"); // remove everything
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
