// src/pages/Unauthorized.js
import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
        <p className="mb-4">You don't have permission to view this page.</p>
        <Link to="/login" className="text-blue-600 underline">Go to Login</Link>
      </div>
    </div>
  );
}
