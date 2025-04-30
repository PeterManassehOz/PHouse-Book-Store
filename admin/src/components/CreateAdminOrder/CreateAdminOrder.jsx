import React, { useState } from 'react';
import { useCreateAdminOrderMutation } from '../../redux/ordersByAdminAuthApi/ordersByAdminAuthApi';
import { toast } from "react-toastify";
import { useSelector } from 'react-redux';

const CreateAdminOrder = () => {
  const [orderItems, setOrderItems] = useState([{ bookTitle: '', quantity: 0 }]);
  const [message, setMessage] = useState('');
  const [createAdminOrder, { isLoading }] = useCreateAdminOrderMutation();

  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleAddBook = () => {
    setOrderItems([...orderItems, { bookTitle: '', quantity: 0 }]);
  };

  const handleInputChange = (index, field, value) => {
    const newOrderItems = [...orderItems];
    newOrderItems[index][field] = field === 'quantity' ? Number(value) : value;
    setOrderItems(newOrderItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAdminOrder({ orderItems, message }).unwrap();
      toast.success('Order created successfully!');
      // Reset the fields after successful order creation
      setOrderItems([{ bookTitle: '', quantity: 0 }]); // Reset order items
      setMessage(''); // Reset message
    } catch (err) {
      toast.error('Failed to create order. Please try again.');
      console.error('Failed to create order:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`max-w-lg mx-auto p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <h2 className="text-2xl font-semibold mb-4 text-center">Create Order</h2>

      {orderItems.map((item, index) => (
        <div key={index} className="flex flex-col gap-4 mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Book Title"
              value={item.bookTitle}
              onChange={(e) => handleInputChange(index, 'bookTitle', e.target.value)}
              required
              className={`px-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500' : 'border-gray-300 focus:ring-blue-500'}`}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
              required
              className={`px-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500' : 'border-gray-300 focus:ring-blue-500'}`}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddBook}
        className={`mb-6 text-blue-500 hover:text-blue-700 font-medium focus:outline-none ${darkMode ? 'text-blue-300 hover:text-blue-400' : ''}`}
      >
        Add Another Book
      </button>

      <textarea
        placeholder="Optional Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={`w-full p-4 border rounded-md mb-6 focus:outline-none focus:ring-2 ${darkMode ? 'border-gray-600 bg-gray-700 text-white focus:ring-blue-500' : 'border-gray-300 focus:ring-blue-500'}`}
      />

      <button
        type="submit"
        className={`w-full py-2 font-semibold rounded-md focus:outline-none focus:ring-2 cursor-pointer ${darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400'}`}
      >
        {isLoading ? "Creating..." : "Create Order"}
      </button>
    </form>
  );
};

export default CreateAdminOrder;
