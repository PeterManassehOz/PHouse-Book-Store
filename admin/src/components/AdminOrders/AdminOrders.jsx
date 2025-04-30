import React from "react";
import {
  useGetOrdersForAdminQuery,
  useUpdateOrderStatusMutation,
} from "../../redux/adminOrderAuthApi/adminOrderAuthApi";
import Loader from "../Loader/Loader";
import Error from "../Error/Error";
import { useSelector } from "react-redux";

const AdminOrders = () => {
  const { data: orders, isLoading, isError } = useGetOrdersForAdminQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();
  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleStatusChange = (orderId, newStatus) => {
    updateStatus({ orderId, status: newStatus });
  };

  if (isLoading) return <Loader />;
  if (isError) return <Error />;

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
            <h2
              className={`text-2xl font-semibold mb-6 border-b pb-2 border-gray-300 dark:border-gray-700 text-center ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              Manage Orders
            </h2>
        <>
        {console.log("Orders data:", orders)}
        <div className="flex flex-wrap gap-6">
          {[...orders].reverse().map((order) => (
            <div
              key={order._id}
              className={`w-full sm:w-[48%] lg:w-[31%] shadow-md rounded-lg p-5 border transition duration-300 ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-600"
                  : "bg-white text-black border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">Order ID: {order._id}</h3>
              <p className="mb-1">
                <span className="font-medium">Ordered On:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="mb-1">
                <span className="font-medium">User:</span> {order.name}
              </p>
              <p className="mb-1">
                <span className="font-medium">Email:</span> {order.email}
              </p>
              <p className="mb-2">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                    order.status === "pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : order.status === "processing"
                      ? "bg-blue-200 text-blue-800"
                      : order.status === "shipped"
                      ? "bg-indigo-200 text-indigo-800"
                      : order.status === "delivered"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {order.status}
                </span>
              </p>

              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                className={`mt-2 block w-full rounded-md px-4 py-2 border text-sm font-medium shadow-sm focus:outline-none focus:ring-2 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-400"
                    : "bg-white border-gray-300 text-black focus:ring-blue-500"
                }`}
              >
                {["pending", "processing", "shipped", "delivered", "canceled"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>
          ))}
        </div>
        </>
      </div>
    </div>
  );
};

export default AdminOrders;
