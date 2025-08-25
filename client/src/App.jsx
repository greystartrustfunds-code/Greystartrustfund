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
import AdminChats from "./pages/AdminChats";
import ChatSupport from "./pages/ChatSupport";
import Footer from "./components/Footer";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Handle URL routing
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      
      // Handle admin routes first
      if (path.startsWith('/admin/')) {
        const adminRoutes = {
          '/admin/login': 'admin-login',
          '/admin/dashboard': 'admin-dashboard',
          '/admin/users': 'admin-users',
          '/admin/transactions': 'admin-transactions',
          '/admin/chats': 'admin-chats'
        };
        
        if (adminRoutes[path]) {
          setCurrentPage(adminRoutes[path]);
          return;
        }
      }
      
      // Handle regular routes
      const pathToPageMap = {
        '/': 'home',
        '/about': 'about',
        '/contact': 'contact',
        '/faqs': 'faqs',
        '/login': 'login',
        '/signup': 'signup',
        '/dashboard': 'dashboard',
        '/transactions': 'transactions',
        '/plans': 'plans',
        '/chat': 'chat'
      };

      const page = pathToPageMap[path] || 'home';
      setCurrentPage(page);
    };

    // Check URL on initial load
    handleUrlChange();

    // Listen for browser back/forward button
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");

    // Only override URL routing if user has tokens and URL is not already set
    if (adminToken && !window.location.pathname.startsWith('/admin')) {
      setIsAdminAuthenticated(true);
      setCurrentPage("admin-dashboard");
      window.history.pushState(null, '', '/admin/dashboard');
    } else if (token && window.location.pathname === '/') {
      setIsAuthenticated(true);
      setCurrentPage("dashboard");
      window.history.pushState(null, '', '/dashboard');
    }
  }, []);

  // Helper function to navigate and update URL
  // Removed unused navigateToPage function to fix compile error.

  const renderPage = () => {
    switch (currentPage) {
      case "about":
        return <AboutUs />;
      case "contact":
        return <Contact />;
      case "faqs":
        return <Faq />;
      case "login":
        return (
          <LoginPage
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
          />
        );
      case "signup":
        return (
          <SignupPage
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
          />
        );
      case "dashboard":
        return (
          <Dashboard
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
          />
        );
      case "transactions":
        return (
          <Transactions
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
          />
        );
      case "plans":
        return (
          <Plans
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
          />
        );
      case "admin-login":
        return (
          <AdminLogin
            setCurrentPage={setCurrentPage}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
          />
        );
      case "admin-dashboard":
        return (
          <AdminDashboard
            setCurrentPage={setCurrentPage}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
          />
        );
      case "admin-users":
        return (
          <AdminUsers
            setCurrentPage={setCurrentPage}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
          />
        );
      case "admin-transactions":
        return (
          <AdminTransactions
            setCurrentPage={setCurrentPage}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
          />
        );
      case "admin-chats":
        return (
          <AdminChats
            setCurrentPage={setCurrentPage}
            setIsAdminAuthenticated={setIsAdminAuthenticated}
          />
        );
      case "chat":
        return (
          <ChatSupport
            setCurrentPage={setCurrentPage}
            setIsAuthenticated={setIsAuthenticated}
          />
        );
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {!currentPage.startsWith("admin") &&
        currentPage !== "dashboard" &&
        currentPage !== "transactions" &&
        currentPage !== "plans" &&
        currentPage !== "chat" && (
          <Header
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isAuthenticated={isAuthenticated}
            isAdminAuthenticated={isAdminAuthenticated}
          />
        )}
      {renderPage()}
      {!currentPage.startsWith("admin") &&
        currentPage !== "dashboard" &&
        currentPage !== "transactions" &&
        currentPage !== "plans" &&
        currentPage !== "chat" && (
          <Footer isAdminAuthenticated={isAdminAuthenticated} />
        )}
    </div>
  );
}

export default App;
