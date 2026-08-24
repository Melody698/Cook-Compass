import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/logo.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login failed");
        return;
      }

      // Store user details in sessionStorage
      sessionStorage.setItem("userId", result.user.id);
      sessionStorage.setItem("userName", result.user.username);
      sessionStorage.setItem("userEmail", result.user.email);

      navigate("/home", { state: { user: result.user } });
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    }
  };

  const handleCreateUser = () => {
    navigate("/create-user");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="app-header">
          <img src={logo} alt="Cook Compass Logo" className="app-logo" />
          <h1 className="app-title">Cook Compass</h1>
        </div>

        {error && <p className="error-message">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button onClick={handleLogin} className="login-button">Login</button>
        <button onClick={handleCreateUser} className="create-user-button">Create Profile</button>
      </div>
    </div>
  );
};

export default Login;