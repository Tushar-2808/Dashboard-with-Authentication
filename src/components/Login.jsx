import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import toast from "react-hot-toast";

const Login = ({ setCurrentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Simulate API call delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      toast.error("Invalid email or password!");
      setIsLoading(false);
      return;
    }

    const token = btoa(JSON.stringify(user));
    localStorage.setItem("currentUser", token);
    setCurrentUser(user);

    toast.success(`Welcome back, ${user.name}!`);
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Welcome Back</h1>
        <p className="form-subtitle">Sign in to your account</p>
      </div>
      <form onSubmit={handleLogin} className="auth-form">
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="switch-text">
        Don't have an account?{" "}
        <span className="switch-link" onClick={() => navigate("/register")}>
          Register
        </span>
      </p>
    </div>
  );
};

export default Login;
