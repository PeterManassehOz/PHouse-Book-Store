// src/components/GetAdminOrders/GetAdminOrders.jsx
import React from 'react';
import { useGetAdminOrdersQuery } from '../../redux/ordersByAdminAuthApi/ordersByAdminAuthApi';
import Loader from '../Loader/Loader';
import { useSelector } from 'react-redux';

const GetAdminOrders = () => {
  const { data: orders, isLoading, isError } = useGetAdminOrdersQuery();
  const darkMode = useSelector((state) => state.theme.darkMode);

  if (isLoading) return <Loader />;
  if (isError) return <p className="text-center text-red-500">No orders found!</p>

  const badgeClasses = {
    pending:    'bg-yellow-200 text-yellow-800',
    processing: 'bg-blue-200 text-blue-800',
    shipped:    'bg-indigo-200 text-indigo-800',
    delivered:  'bg-green-200 text-green-800',
    canceled:   'bg-red-200 text-red-800',
  };

  return (
    <div className={`container mx-auto p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h2 className="text-2xl font-semibold mb-4 text-center">Your Orders</h2>
      <div className="flex flex-wrap gap-6 justify-start">
        {orders.map((order) => {
          const status = order.status;
          const badgeColor = badgeClasses[status] || 'bg-gray-200 text-gray-800';

          return (
            <div
              key={order._id}
              className={`w-full sm:w-[48%] lg:w-[30%] xl:w-[24%] border p-4 rounded-md shadow-md ${
                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'
              }`}
            >
              <h3 className="text-lg font-semibold break-words">Order ID: {order._id}</h3>
              <p><strong>Message:</strong> {order.message || '—'}</p>
              <p><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>

              <div className="mt-2">
                <strong>Status:</strong>{' '}
                <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${badgeColor}`}>
                  {status}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="font-medium">Order Items:</h4>
                <ul className="list-disc ml-5 mt-1">
                  {order.orderItems.map((item, idx) => (
                    <li key={idx} className="mb-1">
                      <span className="font-medium">{item.bookTitle}</span> — Qty: {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GetAdminOrders;
