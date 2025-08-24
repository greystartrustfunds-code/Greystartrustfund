import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Homepage from "./pages/Homepage";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Plans from "./pages/Plans";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
import Footer from "./components/Footer";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminToken) {
      setIsAdminAuthenticated(true);
      setCurrentPage("admin-dashboard");
    } else if (token) {
      setIsAuthenticated(true);
      setCurrentPage("dashboard");
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "about":
        return <AboutUs />;
      case "contact":
        return <Contact />;
      case "faqs":
        return <Faq />;
      case "login":
        return <LoginPage setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case "signup":
        return <SignupPage setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case "dashboard":
        return <Dashboard setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case "transactions":
        return <Transactions setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case "plans":
        return <Plans setCurrentPage={setCurrentPage} setIsAuthenticated={setIsAuthenticated} />;
      case "admin-login":
        return <AdminLogin setCurrentPage={setCurrentPage} setIsAdminAuthenticated={setIsAdminAuthenticated} />;
      case "admin-dashboard":
        return <AdminDashboard setCurrentPage={setCurrentPage} setIsAdminAuthenticated={setIsAdminAuthenticated} />;
      case "admin-users":
        return <AdminUsers setCurrentPage={setCurrentPage} setIsAdminAuthenticated={setIsAdminAuthenticated} />;
      case "admin-transactions":
        return <AdminTransactions setCurrentPage={setCurrentPage} setIsAdminAuthenticated={setIsAdminAuthenticated} />;
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {!currentPage.startsWith("admin") && currentPage !== "dashboard" && currentPage !== "transactions" && currentPage !== "plans" && (
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} isAuthenticated={isAuthenticated} />
      )}
      {renderPage()}
      {!currentPage.startsWith("admin") && currentPage !== "dashboard" && currentPage !== "transactions" && currentPage !== "plans" && <Footer />}
    </div>
  );
}

export default App;
