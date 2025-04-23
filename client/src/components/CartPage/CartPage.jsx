import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { removeFromCart, clearCart } from "../../redux/cartSlice/cartSlice";
import { useNavigate } from "react-router-dom";





const CartPage = () => {
  const navigate = useNavigate();




  
  const cartItems = useSelector(state => state.cart.cartItems);

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.cartQuantity, 0);

  const dispatch = useDispatch();
  
  const darkMode = useSelector((state) => state.theme.darkMode);


  // Calculate total price
  const totalPrice = cartItems
  .reduce((acc, item) => acc + item.price * item.cartQuantity, 0)
  .toFixed(2);


  // Remove a single item
  const handleRemoveFromCart = (product) => {
    dispatch(removeFromCart(product))
  };

  // Clear all items
  const handleClearCart = () => {
    dispatch(clearCart())
  };

  const handleCheckout = () => {
    const token = localStorage.getItem("token"); // Replace with Redux selector if stored there
    if (!token) {
      navigate("/signup"); // Redirect to signup if no token
    } else {
      navigate("/checkout"); // Proceed to checkout
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className={`max-w-3xl mx-auto w-full px-4 flex mt-12 h-full flex-col overflow-hidden shadow-xl rounded-md ${darkMode ? "bg-gray-600 text-white" : "bg-white text-black"}`}>
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {/* Shopping Cart Text */}
            <div className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
              Shopping Cart
            </div>

            {/* Cart Item Count Badge */}
            <div className={`px-2 py-1 rounded-full text-md font-medium leading-4
            flex items-center justify-center ${darkMode ? "text-white" : "text-gray-800"} `}>
             [ {totalCartItems} ]
            </div>
          </div>
            <div className="ml-3 flex h-7 items-center">
              <button
                type="button"
                onClick={handleClearCart}
                className="relative -m-2 py-1 px-2 bg-red-500 text-white rounded-md hover:bg-secondary transition-all duration-200 cursor-pointer"
              >
                <span>Clear Cart</span>
              </button>
            </div>
          </div>
  
          <div className="mt-8">
            <div className="flow-root">
              {cartItems.length > 0 ? (
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                  {cartItems.map((product) => (
                    <li key={product._id} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          alt=""
                          src={product.image}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
  
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className={`flex flex-wrap justify-between text-base font-medium ${darkMode ? " text-white" : "text-gray-900"} `}>
                            <h3>
                              <Link to="/">{product?.title}</Link>
                            </h3>
                            <p className="sm:ml-4">₦{(product?.price * product?.cartQuantity).toFixed(2)}</p>
                          </div>
                          <p className={`mt-1 text-sm  capitalize ${darkMode ? " text-white" : "text-gray-500"}`}>
                            <strong>Category:</strong> {product?.category}
                          </p>
                        </div>
                        <div className="flex flex-1 flex-wrap items-end justify-between space-y-2 text-sm">
                        <p className={`${darkMode ? " text-white" : "text-gray-900"}`}>
                          <strong>Qty:</strong> {product?.cartQuantity}
                        </p>

                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(product)}
                              className={`font-medium cursor-pointer ${darkMode ? " text-amber-400" : "text-indigo-600 hover:text-indigo-500"} `}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No product found</p>
              )}
            </div>
          </div>
        </div>
  
        {/* Cart Summary */}
        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className={`flex justify-between text-base font-medium ${darkMode ? "bg-gray-600 text-white" : "bg-white text-black"}`}>
              <p>Subtotal</p>
              <p>₦{totalPrice}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={handleCheckout}
                className={`w-full py-2 rounded-md transition duration-200 cursor-pointer ${darkMode ? "bg-amber-700 hover:bg-amber-600 text-white" : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"}`} 
              >
                Checkout
              </button>
          </div>
          <div className={`mt-6 flex justify-center text-center text-sm cursor-pointer ${darkMode ? "text-amber-400" : "text-gray-500 "}`}>
            <Link to="/">
              or
              <button type="button" className={`font-medium  ml-1 cursor-pointer ${darkMode ? "text-amber-400" : "text-indigo-600 hover:text-indigo-500"}`}>
                Continue Shopping <span aria-hidden="true"> &rarr;</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );  
};

export default CartPage;






/*

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, clearCart } from "../../redux/cartSlice/cartSlice";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);
  const darkMode = useSelector(state => state.theme.darkMode);

  // State for the total price
  const [totalPrice, setTotalPrice] = useState(0);

  // Compute total price whenever cartItems change
  useEffect(() => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.cartQuantity, 0);
    setTotalPrice(total.toFixed(2));
  }, [cartItems]); // Depend on cartItems

  const handleRemoveFromCart = (product) => {
    dispatch(removeFromCart(product));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/checkout" : "/signup");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className={`max-w-3xl mx-auto w-full px-4 flex mt-12 h-full flex-col overflow-hidden shadow-xl rounded-md ${darkMode ? "bg-gray-600 text-white" : "bg-white text-black"}`}>
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-lg font-medium">
                Shopping Cart
              </div>
              <div className="px-2 py-1 rounded-full text-md font-medium leading-4 flex items-center justify-center">
                [ {cartItems.reduce((acc, item) => acc + item.cartQuantity, 0)} ]
              </div>
            </div>
            <div className="ml-3 flex h-7 items-center">
              <button
                type="button"
                onClick={handleClearCart}
                className="py-1 px-2 bg-red-500 text-white rounded-md hover:bg-secondary transition-all duration-200 cursor-pointer"
              >
                <span>Clear Cart</span>
              </button>
            </div>
          </div>
          <div className="mt-8">
            <div className="flow-root">
              {cartItems.length > 0 ? (
                <ul role="list" className="-my-6 divide-y divide-gray-200">
                  {cartItems.map((product) => (
                    <li key={product._id} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img src={product.image} alt="" className="h-full w-full object-cover object-center" />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex flex-wrap justify-between text-base font-medium">
                            <h3>
                              <Link to="/">{product?.title}</Link>
                            </h3>
                            <p className="sm:ml-4">${(product?.price * product?.cartQuantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm capitalize">
                            <strong>Category:</strong> {product?.category}
                          </p>
                        </div>
                        <div className="flex flex-1 flex-wrap items-end justify-between space-y-2 text-sm">
                          <p>
                            <strong>Qty:</strong> {product?.cartQuantity}
                          </p>
                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(product)}
                              className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No product found</p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
          <div className="flex justify-between text-base font-medium">
            <p>Subtotal</p>
            <p>${totalPrice}</p>
          </div>
          <div className="mt-6">
            <button
              onClick={handleCheckout}
              className="w-full py-2 rounded-md bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
            >
              Checkout
            </button>
          </div>
          <div className="mt-6 flex justify-center text-center text-sm cursor-pointer">
            <Link to="/">
              or
              <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1 cursor-pointer">
                Continue Shopping <span aria-hidden="true"> &rarr;</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;


*/