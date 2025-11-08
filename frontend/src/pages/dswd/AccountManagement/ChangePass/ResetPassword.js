import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import zxcvbn from "zxcvbn";  // Import the zxcvbn library

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Handle password input change
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);

    // Check password strength using zxcvbn
    const strength = zxcvbn(password);
    setPasswordStrength(strength.score); // Score between 0-4
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/dswd/reset-pass/", {
        uid,
        token,
        new_password: newPassword,
      });
      setMessage("Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("Invalid or expired link.");
    }
  };

  const getStrengthLabel = (score) => {
    switch (score) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Strong";
      case 4:
        return "Very Strong";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl mb-4">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={handlePasswordChange}
          className="border p-2 rounded"
          required
        />
        <div className="mt-2">
          <p>Password Strength: {passwordStrength !== null && getStrengthLabel(passwordStrength)}</p>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
          disabled={passwordStrength < 2}  // Disable submit if password strength is below "Fair"
        >
          Reset Password
        </button>
      </form>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
}
