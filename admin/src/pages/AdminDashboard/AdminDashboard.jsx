import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack, IoLogOut, IoHome,} from "react-icons/io5";
import CreateBook from "../../components/CreateBook/CreateBook";
import Aggregator from "../../components/Aggregator/Aggregator";
import ManageBook from "../../components/ManageBook/ManageBook";
import Flutterwave from "../../components/AdminFlutterwave/AdminFlutterwave";
import AdminOrders from "../../components/AdminOrders/AdminOrders";
import AssignAdminRole from "../../components/AssignAdminRole/AssignAdminRole";
import { MdAddShoppingCart, MdOutlineManageHistory } from "react-icons/md";
import { GrAggregate } from "react-icons/gr";
import { MdAssignmentInd } from "react-icons/md";
import { FiActivity } from "react-icons/fi";
import { FaFileInvoice } from "react-icons/fa6";
import { useSelector } from "react-redux";
import DarkMode from "../../components/Darkmode/Darkmode";






const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedComponent, setSelectedComponent] = useState(null);

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
      <div className={`fixed inset-0 p-6 md:w-64 md:h-full md:relative flex flex-col justify-between h-full 
          ${darkMode ? "bg-amber-900 text-white" : "bg-amber-900 text-white"}
          ${selectedComponent ? "hidden md:flex" : "flex"}`}> 
        <div>
          <div className="flex items-center gap-2 text-lg font-bold cursor-pointer">
            <IoHome className="text-xl" />
            <span>PHouse Studies</span>
          </div>
          <hr className="my-4 border-white" />
          <ul className="space-y-3">
            <li onClick={() => handleComponentChange("aggregator")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <GrAggregate className="text-xl" /> Aggregator
            </li>
            <li onClick={() => handleComponentChange("createbook")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdAddShoppingCart className="text-xl" /> Create Book
            </li>
            <li onClick={() => handleComponentChange("managebook")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <MdOutlineManageHistory className="text-xl" /> Manage Books
            </li>
            <li onClick={() => handleComponentChange("transactions")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <FiActivity  className="text-xl" /> Transactions
            </li>
            <li onClick={() => handleComponentChange("orders")} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-amber-700 rounded">
              <FaFileInvoice  className="text-xl" /> Orders
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
      <div className={`flex-1 p-6 transition-all duration-300 w-full overflow-hidden ${selectedComponent ? "block" : "hidden md:block"} ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} overflow-y-auto`}
       style={{ height: "100vh" }}
      >
        {/* Back Button for Mobile */}
        {selectedComponent && (
          <button onClick={goBack} className="md:hidden flex items-center gap-2 mb-4 py-4 px-4 text-white bg-amber-600 rounded-full hover:bg-amber-500">
            <IoArrowBack className="text-lg" />
          </button>
        )}

        {/* Render Selected Component */}
        {!selectedComponent && <Aggregator />}
        {selectedComponent === "aggregator" && <Aggregator />}
        {selectedComponent === "createbook" && <CreateBook />}
        {selectedComponent === "managebook" && <ManageBook />}
        {selectedComponent === "transactions" && <Flutterwave />}
        {selectedComponent === "orders" && <AdminOrders />}
        {selectedComponent === "assignadminrole" && <AssignAdminRole />}
      </div>
    </div>
  );
};

export default AdminDashboard;
