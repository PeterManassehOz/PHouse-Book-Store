import React, { useState, useEffect } from 'react';
import {
  useGetAllStatesOrdersForChiefAdminQuery,
  useGetOrdersByStateForChiefAdminQuery,
  useUpdateAdminOrderStatusMutation,
} from '../../redux/ordersByAdminAuthApi/ordersByAdminAuthApi';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { useSelector } from 'react-redux';
import { IoIosArrowBack } from 'react-icons/io';

const GetAdminOrdersForChief = ({ onSubPage }) => {
  const darkMode = useSelector((s) => s.theme.darkMode);
  const [selectedState, setSelectedState] = useState(null);

  // 🔹 Only run once on mount to hide the main back button initially
  useEffect(() => {
    onSubPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: byState,
    isLoading: loadingStates,
    isError: errorStates,
  } = useGetAllStatesOrdersForChiefAdminQuery();

  const {
    data: orders,
    isLoading: loadingOrders,
    isError: errorOrders,
  } = useGetOrdersByStateForChiefAdminQuery(selectedState, {
    skip: !selectedState,
  });

  const [updateStatus] = useUpdateAdminOrderStatusMutation();

  if (loadingStates) return <Loader />;
  if (errorStates) return <p className="text-red-500 text-center">Unauthorized! Chief Admin only.</p>;

  const handleStateClick = (state) => {
    setSelectedState(state);
    onSubPage(true);    // hide main back button
  };

  const handleBack = () => {
    setSelectedState(null);
    onSubPage(false);   // show main back button again
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {!selectedState ? (
        <>
          <h2 className="text-2xl font-bold mb-4">All State Orders</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(byState).map(([state, arr]) => (
              <li key={state}>
                <button
                  onClick={() => handleStateClick(state)}
                  className="w-full py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition cursor-pointer"
                >
                  {state} ({arr.length})
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
           <button
             onClick={handleBack}
              className={`mb-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer
                 ${darkMode ? "bg-amber-600 text-white hover:bg-amber-400" : "bg-amber-700 text-white hover:bg-amber-500"} 
                 rounded-full shadow-transition duration-200 z-10`}
                 >
                   <IoIosArrowBack className="text-xl sm:text-2xl" />
           </button>

          <h2 className="text-2xl font-bold mb-4 text-center">Orders in {selectedState}</h2>
          {loadingOrders ? (
            <Loader />
          ) : errorOrders ? (
            <Error />
          ) : orders.length === 0 ? (
            <p className="italic">No orders found for {selectedState}.</p>
          ) : (
            <div className={`container mx-auto p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            {orders && orders.length > 0 ? (
              <div className="flex flex-wrap gap-6 justify-start">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className={`w-full sm:w-[48%] lg:w-[31%] border p-4 rounded-md shadow-md ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <h3 className="text-lg font-semibold mb-1">Order ID: {order._id}</h3>

                    <p className="mb-1">
                      <strong>Message:</strong> {order.message || '—'}
                    </p>

                    <p>
                      <strong>Ordered:</strong> {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    <p className="mb-2">
                      <strong>Status:</strong>{' '}
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                          order.status === 'pending'
                            ? 'bg-yellow-200 text-yellow-800'
                            : order.status === 'processing'
                            ? 'bg-blue-200 text-blue-800'
                            : order.status === 'shipped'
                            ? 'bg-indigo-200 text-indigo-800'
                            : order.status === 'delivered'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>

                    <select
                      value={order.status}
                      onChange={(e) => updateStatus({ orderId: order._id, status: e.target.value })}
                      className={`mb-4 block w-full rounded-md px-3 py-2 border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400'
                          : 'bg-white border-gray-300 text-black focus:ring-blue-500'
                      }`}
                    >
                      {['pending', 'processing', 'shipped', 'delivered', 'canceled'].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <div>
                      <h4 className="font-medium mb-1">Items:</h4>
                      <ul className="list-disc ml-5">
                        {order.orderItems.map((item, i) => (
                          <li key={i}>
                            <span className="font-medium">{item.bookTitle}</span> — Qty: {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No orders found.</p>
            )}
          </div>
          )}
        </>
      )}
    </div>
  );
};

export default GetAdminOrdersForChief;
