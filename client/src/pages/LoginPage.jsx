import React, { useState } from "react";
import { authAPI } from "../services/api";

const LoginPage = ({ setCurrentPage, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    try {
      const response = await authAPI.login(formData);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setIsAuthenticated(true);
        setCurrentPage("dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during login");
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
            Login to <span className="text-orange-400">Your Account</span>
          </h1>
          <p className="text-gray-400 mt-2">Welcome back, trader!</p>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-500 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-400"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-orange-400 hover:text-orange-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={() => setCurrentPage("signup")}
            className="font-medium text-orange-400 hover:text-orange-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
