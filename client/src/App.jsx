import React from 'react';
import './index.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SingleBook from "./components/SingleBook/SingleBook";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { ToastContainer } from "react-toastify";
import CartPage from './components/CartPage/CartPage';
import CheckOut from './components/CheckOut/CheckOut';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import TokenResetPassword from './components/TokenResetPassword/TokenResetPassword';
import Orders from './components/Orders/Orders';
import SingleAuthor from './components/SingleAuthor/SingleAuthor';
import Status from './components/Status/Status';
import VerifyOtpWithEmail from './components/VerifyOtpWithEmail/VerifyOtpWithEmail';
import VerifyOtpWithPhone from './components/VerifyOtpWithPhone/VerifyOtpWithPhone';
import ChooseVerification from './components/ChooseVerification/ChooseVerification';
import MobileViewAuthorYear from './components/MobileViewAuthorYear/MobileViewAuthorYear';

function App() {
  return (
    <Router>
      <ToastContainer />
      <Layout />
    </Router>
  );
}

const Layout = () => {
  const location = useLocation();
  const darkMode = useSelector((state) => state.theme.darkMode);
  
  // Show Navbar & Footer only on the Home page
  const isHomePage = location.pathname === '/';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
    }`}>

      {isHomePage && <Navbar />}
      <div className="min-h-screen">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/book/:id" element={<SingleBook />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path='/reset-password/:token' element={<TokenResetPassword />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/author/:name' element={<SingleAuthor />} />
            <Route path="/status/:tx_id" element={<Status />} />
            <Route path="/verify-email-otp" element={<VerifyOtpWithEmail />} />
            <Route path="/verify-phone-otp" element={<VerifyOtpWithPhone />} />
            <Route path="/choose-verification" element={<ChooseVerification />} />
            <Route path='/mobile-view-author-year' element={<MobileViewAuthorYear />} />
          </Routes>
      </div>
    

      {isHomePage && <Footer />}
    </div>
  );
}

export default App;
