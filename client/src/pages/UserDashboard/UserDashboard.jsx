import React, { useState } from 'react';
import DarkMode from '../../components/DarkMode/DarkMode';
import { useNavigate } from 'react-router-dom';
import ResetPassword from "../../components/ResetPassword/ResetPassword";
import { IoArrowBack, IoLogOut, IoHome } from "react-icons/io5";
import { useSelector } from 'react-redux';
import Profile from '../../components/Profile/Profile';
import Orders from '../../components/Orders/Orders';
import { IoIosPerson } from 'react-icons/io';
import { FaFileInvoice } from "react-icons/fa6";
import { MdLockReset } from "react-icons/md";
import { TbCurrencyNaira } from "react-icons/tb";
import UserTransactions from '../../components/UserTransactions/UserTransactions';
import LivingSeed from "/LSeed-Logo-1.png";
import { persistor } from '../../redux/store/store';
import { useDispatch } from 'react-redux';

import { clearCart } from '../../redux/cartSlice/cartSlice';
import { resetTheme } from '../../redux/themeSlice/themeSlice';
import { bookAuthApi } from '../../redux/bookAuthApi/bookAuthApi';
import { orderAuthApi } from '../../redux/orderAuthApi/orderAuthApi';
import profileAuthApi, { useGetUserProfileQuery } from '../../redux/profileAuthApi/profileAuthApi';
import { flutterwaveAuthApi } from '../../redux/flutterwaveAuthApi/flutterwaveAuthApi';
import { newsLetterAuthApi } from '../../redux/newsLetterAuthApi/newsLetterAuthApi';
import userAuthApi from '../../redux/userAuthApi/userAuthApi';



const UserDashboard = () => {

  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);

  
    const { data: userProfile, isLoading: Loading } = useGetUserProfileQuery();

  
  const navigate = useNavigate();
    
    
    const [selectedComponent, setSelectedComponent] = useState(null);
    const handleComponentChange = (component) => {
      setSelectedComponent(component);
    };
  
    const goBack = () => {
      setSelectedComponent(null);
    };
  
    
  const logOut = async () => {
    // 1️⃣ pause redux-persist from re-saving anything
    persistor.pause();

    // 2️⃣ purge whatever persistReducer wrote
    await persistor.purge();

    // 3️⃣ nuke every browser storage key
    localStorage.clear();
    sessionStorage.clear();

    // 4️⃣ reset RTK Query state
    dispatch(bookAuthApi.util.resetApiState());
    dispatch(orderAuthApi.util.resetApiState());
    dispatch(profileAuthApi.util.resetApiState());
    dispatch(flutterwaveAuthApi.util.resetApiState());
    dispatch(newsLetterAuthApi.util.resetApiState());
    dispatch(userAuthApi.util.resetApiState());

    // 5️⃣ reset your non-persisted slices
    dispatch(clearCart());
    dispatch(resetTheme());

    // 6️⃣ hard‐reload to boot from a blank slate
    window.location.href = '/login';
  };



  return (
    <div className={`h-screen w-screen flex overflow-hidden ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
     <div className={`fixed inset-0 p-6 md:w-64 md:h-full md:relative flex flex-col justify-between h-full 
          ${darkMode ? "bg-amber-900 text-white" : "bg-amber-900 text-white"}
          ${selectedComponent ? "hidden md:flex" : "flex"}`}> 
        <div>
          <div className="flex justify-center items-center cursor-pointer" >
              <img src={LivingSeed} alt="Logo" className="w-30 sm:w-30 h-10 bg-white p-1 rounded-full shadow-md shadow-black backdrop-blur-md bg-opacity-30 animate-bounce"  onClick={() => navigate("/")}/>
          </div>
          <hr className="my-4 border-white" />
          <ul className="space-y-3">
            <li onClick={() => handleComponentChange("profile")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-600 rounded">
              <IoIosPerson className={`text-xl ${darkMode ? "text-white" : " text-white"}`} /> Profile
            </li>
            <li onClick={() => handleComponentChange("orders")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-600 rounded">
              <FaFileInvoice className={`text-xl ${darkMode ? "text-white" : " text-white"}`} /> Orders
            </li>
            <li onClick={() => handleComponentChange("user-transactions")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-600 rounded">
              <TbCurrencyNaira className={`text-xl ${darkMode ? "text-white" : " text-white"}`} /> Transactions
            </li>
          
            <li onClick={() => handleComponentChange("reset-password")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-600 rounded">
              <MdLockReset className={`text-xl ${darkMode ? "text-white" : " text-white"}`} /> Reset Password
            </li>
            <li>
              <DarkMode />
            </li>
          </ul>
        </div>

        {/* Logout & Profile Section */}
        <div className="mt-auto">
          <button onClick={logOut} className={`w-full flex items-center gap-2 py-4 px-4 rounded-md  cursor-pointer ${darkMode ? "bg-amber-700 hover:bg-amber-600 text-white" : "bg-amber-700 hover:bg-amber-600"}`}>
            <IoLogOut className="text-xl" /> Log out
          </button>

          {/* Profile Image & Name */}
          <div className="flex flex-row items-center gap-2 mt-6">
            <img
              src={userProfile?.image || "/profileIconBrown.jpeg"}
              alt="Profile"
              className="w-10 h-10 md:w-13 md:h-13 lg:w-13 lg:h-13 object-cover rounded-full shadow-md"
            />
            <span className="flex flex-wrap gap-1 text-sm md:text-sm lg:text-sm font-semibold text-center">
              <span>{userProfile?.username}</span>        
            </span>
          </div>
        </div>
      </div>     
    
         {/* Content Area */}
         <div className={`flex-1 p-6 bg-gray-100 transition-all duration-300 w-full overflow-hidden
         ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}
         ${selectedComponent ? "block" : "hidden md:block"} overflow-y-auto`}
       style={{ height: "100vh" }}
      >
        {/* Back Button for Mobile */}
        {selectedComponent && (
          <button onClick={goBack} className="md:hidden flex items-center gap-2 mb-4 py-4 px-4 text-white bg-amber-700 rounded-full hover:bg-amber-600">
            <IoArrowBack className="text-lg" />
          </button>
        )}

        {/* Render Selected Component */}
        {!selectedComponent && <Profile />}
        {selectedComponent === "profile" && <Profile />}
        {selectedComponent === "orders" && <Orders />}
        {selectedComponent === "user-transactions" && <UserTransactions />} {/* Replace with actual transaction component */}
        {selectedComponent === "reset-password" && <ResetPassword />}
      </div>
    </div>
  );
};

export default UserDashboard;
