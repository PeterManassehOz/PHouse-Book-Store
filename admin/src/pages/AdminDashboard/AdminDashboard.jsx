import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoLogOut, IoHome,} from "react-icons/io5";
import CreateBook from "../../components/CreateBook/CreateBook";
import Aggregator from "../../components/Aggregator/Aggregator";
import ManageBook from "../../components/ManageBook/ManageBook";
import AdminFlutterwave from "../../components/AdminFlutterwave/AdminFlutterwave";
import AdminOrders from "../../components/AdminOrders/AdminOrders";
import AssignAdminRole from "../../components/AssignAdminRole/AssignAdminRole";
import { MdBookmarkAdd, MdBookmarkAdded, MdBookmarks, MdOutlineBookmarkAdded, MdOutlineManageHistory } from "react-icons/md";
import { GrAggregate } from "react-icons/gr";
import { MdAssignmentInd, MdSubscriptions } from "react-icons/md";
import { IoIosSend } from "react-icons/io";
import { TbCurrencyNaira } from "react-icons/tb";
import { FaFileInvoice } from "react-icons/fa6";
import { useSelector } from "react-redux";
import DarkMode from "../../components/Darkmode/Darkmode";
import LivingSeed from "/LSeed-Logo-1.png";
import StateAdminTransactions from "../../components/StateAdminTransactions/StateAdminTransactions";
import StateAdminOrders from "../../components/StateAdminOrders/StateAdminOrders";
import CreateAdminOrder from "../../components/CreateAdminOrder/CreateAdminOrder";
import GetAdminOrders from "../../components/GetAdminOrders/GetAdminOrders";
import GetAdminOrdersForChief from "../../components/GetAdminOrdersForChief/GetAdminOrdersForChief";
import AdminOrderStatistics from "../../components/AdminOrderStatistics/AdminOrderStatistics";
import Subscribers from "../../components/Subscribers/Subscribers";
import SendNewsletter from "../../components/SendNewsletter/SendNewsletter";






const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showBackButton, setShowBackButton] = useState(true);


  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleComponentChange = (component) => {
    setSelectedComponent(component);
  };

  const goBack = () => {
    setSelectedComponent(null);
  };

  const logOut = () => {
    localStorage.removeItem("token");
    navigate("/admin-login");
  };

  return (
    <div className={`h-screen w-screen flex overflow-hidden ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      {/* Sidebar - Always visible on larger screens, hidden on mobile when a component is selected */}
      <div className={`fixed inset-0 p-3 md:w-64 md:h-full md:relative flex flex-col justify-between h-full 
          ${darkMode ? "bg-amber-900 text-white" : "bg-amber-900 text-white"}
          ${selectedComponent ? "hidden md:flex" : "flex"}`}> 
        <div>
           <div className="flex justify-center items-center">
              <img src={LivingSeed} alt="Logo" className="w-30 sm:w-30 h-10 bg-white p-1 rounded-full shadow-md shadow-black backdrop-blur-md bg-opacity-30 animate-bounce" />
           </div>
          <hr className="my-3 border-white" />
          <ul className="space-y-3">
            <li onClick={() => handleComponentChange("aggregator")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <GrAggregate className="text-xl" /> Aggregator
            </li>
            <li onClick={() => handleComponentChange("adminaggregator")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <GrAggregate className="text-xl" /> Admin Order Aggregator
            </li>
            <li onClick={() => handleComponentChange("createbook")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdBookmarkAdd className="text-xl" /> Create Book
            </li>
            <li onClick={() => handleComponentChange("managebook")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdOutlineManageHistory className="text-xl" /> Manage Books
            </li>
            <li onClick={() => handleComponentChange("subscribers")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdSubscriptions   className="text-xl" /> Subscribers
            </li>
            <li onClick={() => handleComponentChange("sendnewsletter")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <IoIosSend  className="text-xl" /> Send Newsletter
            </li>
            <li onClick={() => handleComponentChange("transactions")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <TbCurrencyNaira className="text-xl" /> Transactions
            </li>
            <li onClick={() => handleComponentChange("orders")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <FaFileInvoice  className="text-xl" /> Orders
            </li>
            <li onClick={() => handleComponentChange("admintransactions")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <TbCurrencyNaira className="text-xl" /> Transactions by State
            </li>
            <li onClick={() => handleComponentChange("adminorders")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <FaFileInvoice className="text-xl" /> Orders by State
            </li>
            <li onClick={() => handleComponentChange("createadminorder")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdBookmarkAdded className="text-xl" /> Create Admin Order
            </li>
            <li onClick={() => handleComponentChange("getadminorders")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdOutlineBookmarkAdded className="text-xl" /> Get Admin Orders
            </li>
            <li onClick={() => handleComponentChange("getordersbychief")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdBookmarks className="text-xl" /> Get admin order by Chief
            </li>
            <li onClick={() => handleComponentChange("assignadminrole")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdAssignmentInd className="text-xl" /> Assign Admin Role
            </li>
            <li>
              <DarkMode />
            </li>
          </ul>
        </div>

        {/* Logout & Profile Section */}
        <div className="mt-auto">
          <button onClick={logOut} className="w-full flex items-center gap-2 py-4 px-4 bg-amber-700 rounded-md hover:bg-amber-600 cursor-pointer">
            <IoLogOut className="text-xl" /> Log out
          </button>

   
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 p-6 transition-all duration-300 w-full overflow-hidden ${selectedComponent ? "block" : "hidden md:block"} ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} overflow-y-auto`}
       style={{ height: "100vh" }}
      >
        {/* Back Button for Mobile */}
        {selectedComponent && showBackButton && (
          <button onClick={goBack} className="md:hidden flex items-center gap-2 mb-4 py-4 px-4 text-white bg-amber-600 rounded-full hover:bg-amber-500">
            <IoArrowBack className="text-lg" />
          </button>
        )}

        {/* Render Selected Component */}
        {!selectedComponent && <Aggregator />}
        {selectedComponent === "aggregator" && <Aggregator />}
        {selectedComponent === "adminaggregator" && <AdminOrderStatistics />}
        {selectedComponent === "createbook" && <CreateBook />}
        {selectedComponent === "managebook" && <ManageBook />}
        {selectedComponent === "subscribers" && <Subscribers />}
        {selectedComponent === "sendnewsletter" && <SendNewsletter />}
        {selectedComponent === "transactions" && <AdminFlutterwave />}
        {selectedComponent === "admintransactions" && (
          <StateAdminTransactions onSubPage={(isSubPage) => setShowBackButton(!isSubPage)} />
        )}
        {selectedComponent === "orders" && <AdminOrders />}
        {selectedComponent === "adminorders" && (
          <StateAdminOrders onSubPage={(isSubPage) => setShowBackButton(!isSubPage)} />
        )}
        {selectedComponent === "createadminorder" && <CreateAdminOrder />}
        {selectedComponent === "getadminorders" && <GetAdminOrders />}
        {selectedComponent === "getordersbychief" && (<GetAdminOrdersForChief onSubPage={(isSubPage) => setShowBackButton(!isSubPage)}/>)}
        {selectedComponent === "assignadminrole" && <AssignAdminRole />}
      </div>
    </div>
  );
};

export default AdminDashboard;
