// src/components/StateAdminOrders/StateAdminOrders.jsx
import React, { useState, useEffect } from 'react';
import {
  useGetAllStatesOrdersForChiefAdminQuery,
  useGetOrdersByStateForChiefAdminQuery,
} from '../../redux/adminOrderAuthApi/adminOrderAuthApi';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { useSelector } from 'react-redux';
import { IoIosArrowBack } from 'react-icons/io';

const StateAdminOrders = ({ onSubPage }) => {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const [selectedState, setSelectedState] = useState(null);

  // 🔹 Hide the main back button initially
  useEffect(() => {
    onSubPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1️⃣ Fetch summary counts by state
  const {
    data: byState,
    isLoading: loadingStates,
    isError: errorStates,
  } = useGetAllStatesOrdersForChiefAdminQuery();

  // 2️⃣ Fetch orders when a state is clicked
  const {
    data: orders,
    isLoading: loadingOrders,
    isError: errorOrders,
  } = useGetOrdersByStateForChiefAdminQuery(selectedState, {
    skip: !selectedState,
  });

  if (loadingStates) return <Loader />;
  if (errorStates) return <p className="text-red-500 text-center">Unauthorized! Chief Admin only.</p>;

  const handleStateClick = (st) => {
    setSelectedState(st);
    onSubPage(true);    // hide main back button
  };
  const handleBack = () => {
    setSelectedState(null);
    onSubPage(false);   // show main back button
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {!selectedState ? (
        <>
          <h2 className="text-2xl font-bold mb-4">All State Orders</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(byState).map(([st, arr]) => (
              <li key={st}>
                <button
                  onClick={() => handleStateClick(st)}
                  className="w-full py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition cursor-pointer"
                >
                  {st} ({arr.length})
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button
            onClick={handleBack}
            className={`mb-6 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer ${
              darkMode
                ? 'bg-amber-600 text-white hover:bg-amber-400'
                : 'bg-amber-700 text-white hover:bg-amber-500'
            } rounded-full shadow-md transition duration-200 z-10`}
          >
            <IoIosArrowBack className="text-xl sm:text-2xl" />
          </button>

          <h2 className="text-2xl font-bold mb-4 text-center">Orders in {selectedState}</h2>
          {loadingOrders ? (
            <Loader />
          ) : errorOrders ? (
            <Error />
          ) : !orders || orders.length === 0 ? (
            <p className="italic">No orders found for {selectedState}.</p>
          ) : (
            <ul className="flex flex-wrap gap-4">
               {orders?.slice().reverse().map((order) => (
                    <li
                      key={order._id}
                      className={`w-full sm:w-[48%] md:w-[31%] rounded-xl p-5 shadow transition duration-200 ${
                        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="text-sm mb-1"><span className="font-medium">Order ID:</span> {order._id}</p>
                      <p className="text-sm mb-1"><span className="font-medium">Ordered On:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm mb-1"><span className="font-medium">User:</span> {order.name}</p>
                      <p className="text-sm mb-1"><span className="font-medium">Email:</span> {order.email}</p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Status:</span> {" "}
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          order.status === "pending" ? "bg-yellow-200 text-yellow-800" :
                          order.status === "processing" ? "bg-blue-200 text-blue-800" :
                          order.status === "shipped" ? "bg-indigo-200 text-indigo-800" :
                          order.status === "delivered" ? "bg-green-200 text-green-800" :
                          "bg-red-200 text-red-800"
                        }`}>
                          {order.status}
                        </span>
                      </p>
                      <p className="text-sm font-medium mb-1">Products:</p>
                      <ul className="list-disc ml-5 text-sm mb-2">
                        {order.productIds.map((book) => (
                          <li key={book._id}>
                            {book.title} (₦{book.price})
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm"><span className="font-medium">Total:</span> ₦{order.totalPrice}</p>
                    </li>
                  ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default StateAdminOrders;
