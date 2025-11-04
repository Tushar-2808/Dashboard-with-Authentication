import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import toast from "react-hot-toast";

const Register = ({ setCurrentUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const payload = { name, email, password, role, exp: Date.now() + 24*60*60*1000 };
    const token = btoa(JSON.stringify(payload));

    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      toast.error("This email is already registered!");
      setIsLoading(false);
      return;
    }

    // Add new user
    users.push(payload);
    localStorage.setItem("users", JSON.stringify(users));

    // Also store current user and token for login
    localStorage.setItem("currentUser", token);
    setCurrentUser(payload);

    toast.success(`Welcome, ${name}! Registration successful!`);
    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Create Account</h1>
        <p className="form-subtitle">Join JoinEazy today</p>
      </div>
      <form onSubmit={handleRegister} className="auth-form">
        <div className="input-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
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
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>
        <div className="input-group">
          <label htmlFor="role">I am a</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
          >
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="switch-text">
        Already have an account?{" "}
        <span className="switch-link" onClick={() => navigate("/login")}>
          Sign In
        </span>
      </p>
    </div>
  );
};

export default Register;
