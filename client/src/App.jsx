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
import Footer from "./components/Footer";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
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
      default:
        return <Homepage />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {currentPage !== "dashboard" && currentPage !== "transactions" && currentPage !== "plans" && (
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} isAuthenticated={isAuthenticated} />
      )}
      {renderPage()}
      {currentPage !== "dashboard" && currentPage !== "transactions" && currentPage !== "plans" && <Footer />}
    </div>
  );
}

export default App;
