// src/components/ProtectedRoute.js
// import React, { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// export default function ProtectedRoute({ children, roles }) {
//   // roles: string or array of strings (case-insensitive)
//   const ctx = useContext(AuthContext) || {};
//   const auth = ctx.auth ?? null;

//   // fallback to localStorage if context isn't populated yet
//   const stored = typeof window !== "undefined" ? localStorage.getItem("vawsafeAuth") : null;
//   const storedUser = stored ? JSON.parse(stored)?.user : null;
//   const user = auth?.user ?? storedUser;

//   // Not logged in -> send to login
//   if (!user) return <Navigate to="/login" replace />;

//   // If roles specified, ensure user.role is allowed
//   if (roles) {
//     const allowed = Array.isArray(roles)
//         ? roles.map(r => r.toString().toLowerCase())
//         : [roles.toString().toLowerCase()];

//     const userRole = (user.role || "").toString().toLowerCase();

//     if (!allowed.includes(userRole)) return <Navigate to="/unauthorized" replace />;
//     }

//   // OK
//   return children;
// }

import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, bootstrapped } = useContext(AuthContext);

  if (!bootstrapped) return null; // or a spinner

  if (!user) return <Navigate to="/login" replace />;

  if (roles) {
    const allowed = (Array.isArray(roles) ? roles : [roles]).map(r => r.toLowerCase());
    const userRole = (user.role || "").toLowerCase();
    if (!allowed.includes(userRole)) return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
