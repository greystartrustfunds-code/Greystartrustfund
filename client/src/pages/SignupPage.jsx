import React, { useState } from "react";
import { authAPI } from "../services/api";

const SignupPage = ({ setCurrentPage, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.signup(formData);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setIsAuthenticated(true);
        setSuccess("Account created successfully! Redirecting...");
        
        setTimeout(() => {
          setCurrentPage("dashboard");
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="bg-slate-800 bg-opacity-80 backdrop-blur-md p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-rubik">
            Create Your <span className="text-orange-400">Account</span>
          </h1>
          <p className="text-gray-400 mt-2">Join our community of traders.</p>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow duration-200"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow duration-200"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition-shadow duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => setCurrentPage("login")}
            className="font-medium text-orange-400 hover:text-orange-500"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
