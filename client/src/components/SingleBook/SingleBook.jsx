import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { ImCart } from "react-icons/im";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice/cartSlice";
import { toast } from "react-toastify";
import { useGetBookByIdQuery } from "../../redux/bookAuthApi/bookAuthApi"; // RTK Query hook
import Loader from "../Loader/Loader";
import Error from "../Error/Error";

const SingleBook = () => {
  const { id } = useParams(); // Get book ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showError, setShowError] = useState(false);

  // Fetch book data using RTK Query
  const { data: book, isLoading } = useGetBookByIdQuery(id);

  const cartItems = useSelector((state) => state.cart.cartItems);
  // Safely calculate totalCartItems by defaulting undefined cartQuantity to 0
  const totalCartItems = cartItems.reduce((acc, item) => acc + (item.cartQuantity || 0), 0);

  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleAddToCart = (product) => {
    if (product.quantity > 0) {
      const productToAdd = {
        ...product,
        cartQuantity: product.cartQuantity || 1, // Ensure quantity is set
      };
      dispatch(addToCart(productToAdd));
    } else {
      toast.error("Out of stock");
    }
  };

  if (isLoading) return <Loader />;
  if (showError) return <Error onClose={() => setShowError(false)} />;
  if (!book) return <p className="text-center mt-20 text-gray-500">Book not found.</p>;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen relative ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Top Navigation (Back Button & Cart) */}
      <div className="absolute top-8 left-4 right-4 flex flex-row items-center w-full max-w-2xl mx-auto px-4 gap-70 md:gap-136">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white bg-amber-700 hover:bg-amber-400 rounded-full shadow-md cursor-pointer"
        >
          <IoIosArrowBack className="text-xl sm:text-2xl" />
        </button>
        <Link to="/cart" className="relative">
          <ImCart className={`text-2xl sm:text-3xl cursor-pointer ${darkMode ? "text-amber-600" : "text-amber-700"}`} />
          <div className="absolute -top-3 -right-3 sm:-top-3 sm:-right-3 bg-white text-black text-xs sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shadow-md">
            {totalCartItems}
          </div>
        </Link>
      </div>

      {/* Book Container */}
      <div className={`max-w-2xl w-full mx-auto p-6 shadow-md rounded-lg text-center mt-20 ${darkMode ? "bg-gray-600" : "bg-white"}`}>
        <h2 className="text-2xl font-semibold mt-4">{book.title}</h2>
        <div className="flex justify-center mt-4">
          <img
            src={book.image} // Assumes book.image already has full URL from transformResponse
            alt={book.title}
            className="w-40 h-60 object-cover rounded-md shadow-lg"
          />
        </div>
        <div className={`flex flex-col justify-center items-center mt-4`}>
          <p className={`text-sm ${darkMode ? "text-white" : "text-gray-500"}`}>
            {book.author[0]?.name} | {book.date}
          </p>
          <p className={`mt-2 text-sm text-justify leading-relaxed break-words ${darkMode ? "text-white" : "text-gray-500"}`}>
            {book.description}
          </p>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handleAddToCart(book)}
              className="w-[150px] sm:w-auto px-6 py-3 sm:px-10 sm:py-3 text-xs sm:text-sm md:text-base lg:w-[300px] bg-amber-700 text-white rounded-full shadow-lg cursor-pointer"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBook;
