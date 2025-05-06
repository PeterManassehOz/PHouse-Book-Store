import React from "react";
import {
  useGetOrdersForUserQuery,
  useGetOrderStatusQuery,
} from "../../redux/orderAuthApi/orderAuthApi";
import Loader from "../Loader/Loader";
import { useSelector } from "react-redux";

const OrderCard = ({ order }) => {
  const darkMode = useSelector((s) => s.theme.darkMode);
  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useGetOrderStatusQuery(order._id);

  const statusText = statusLoading
    ? "Loading…"
    : statusError
    ? "Error"
    : statusData?.status || "Unknown";

  // map each status to a pair of tailwind classes
  const statusClasses = {
    pending:    "bg-yellow-200 text-yellow-800",
    processing: "bg-blue-200   text-blue-800",
    shipped:    "bg-indigo-200 text-indigo-800",
    delivered:  "bg-green-200  text-green-800",
    canceled:   "bg-red-200    text-red-800",
    Unknown:    "bg-gray-200   text-gray-800",
    Error:      "bg-red-100    text-red-800",
    Loading:    "bg-gray-100   text-gray-600",
  };

  const badgeClass = statusClasses[statusText] || statusClasses.Unknown;

  return (
    <div
      className={`flex-1 min-w-[300px] max-w-[400px] border shadow-md rounded-lg p-5 ${
        darkMode
          ? "bg-gray-800 text-white border-gray-600"
          : "bg-white text-black border-gray-200"
      }`}
    >
      <h3 className="text-lg font-semibold mb-2">
        Order ID:{" "}
        <span
          className={`${darkMode ? "text-white" : "text-blue-600"} font-semibold`}
        >
          {order._id}
        </span>
      </h3>
      <p>
        Date:{" "}
        <span
          className={`${darkMode ? "text-white" : "text-gray-600"} font-medium`}
        >
          {new Date(order.createdAt).toLocaleString()}
        </span>
      </p>
      <p className="mt-1">
        Status:{" "}
        <span
          className={`inline-block px-2 py-1 rounded text-sm font-semibold ${badgeClass}`}
        >
          {statusText}
        </span>
      </p>

      <p className="mt-2 font-semibold">
        Total: <span className="text-amber-700">₦{order.totalPrice}</span>
      </p>

      <h4
        className={`mt-4 text-lg font-semibold ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        Products:
      </h4>
      <div className="grid grid-cols-1 gap-3 mt-2">
        {order.productIds.map((p) => (
          <div
            key={p._id}
            className={`p-3 rounded-lg shadow-sm border ${
              darkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-gray-50 border-gray-200 text-black"
            }`}
          >
            <img
              src={p.image}
              alt={p.title}
              className="w-full h-40 object-cover rounded-md"
            />
            <div className="mt-2">
              <h5 className="font-semibold">{p.title}</h5>
              <p className="text-sm">Author: {p.author[0]?.name}</p>
              <p
                className={`text-sm ${
                  darkMode ? "text-white" : "text-amber-600"
                }`}
              >
                ₦{p.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Orders = () => {
  const { data: orders = [], isLoading, error } = useGetOrdersForUserQuery();
  const darkMode = useSelector((s) => s.theme.darkMode);

  if (isLoading) return <Loader />;
  if (error) return <p className="text-center text-red-500">No orders found!</p>

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h2
          className={`text-2xl font-semibold mb-6 border-b pb-2 border-gray-300 ${
            darkMode ? "text-white" : "text-black"
          }`}
        >
          My Orders
        </h2>

        {orders.length === 0 ? (
          <p className="text-center text-sm italic text-gray-500 dark:text-gray-400">No orders found.</p>
        ) : (
          <div className="flex flex-wrap gap-6">
            {[...orders]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
