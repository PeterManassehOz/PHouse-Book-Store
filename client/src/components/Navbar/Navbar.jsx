import React, { useState, useMemo } from 'react';
import { IoIosSearch } from "react-icons/io";
import LivingSeed from "/LSeed-Logo-1.png";
import { Link, useNavigate } from 'react-router-dom';
import { ImCart } from "react-icons/im";
import { useSelector } from 'react-redux';
import { useGetAllBooksQuery } from '../../redux/bookAuthApi/bookAuthApi'; // Import RTK Query hook
import Loader from '../Loader/Loader';
import { useGetUserProfileQuery } from '../../redux/profileAuthApi/profileAuthApi';



const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState(""); 
  //const [books, setBooks] = useState([]); 
  
  const navigate = useNavigate(); 

  const cartItems = useSelector(state => state.cart.cartItems);
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.cartQuantity, 0);
  const darkMode = useSelector((state) => state.theme.darkMode);

  const { data: userProfile, isLoading: Loading } = useGetUserProfileQuery();
  const { data: books = [], isLoading, isError } = useGetAllBooksQuery();

  // Fetch books data
  /*useEffect(() => {
    fetch("/books.json")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((error) => console.error("Error fetching books:", error));
  }, []);*/

  // Compute filteredBooks dynamically using useMemo
  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, books]); 

  // Navigate to selected book
  const handleBookClick = (bookId) => {
    setSearchTerm(""); 
    navigate(`/book/${bookId}`);
  };


  if (isLoading) return <Loader />
  if (isError) return <p className="text-gray-500 text-center">Get Authenticated</p>

  return (
    <nav className={`py-3 shadow-md ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="px-4 sm:px-10 md:px-20 mx-auto flex items-center w-full h-16 gap-x-4 sm:gap-x-10">

        {/* Search Input */}
        <div className="w-1/3 flex justify-start relative">
          <IoIosSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
          <input 
            type="text" 
            placeholder="Search Book" 
            className={`w-40 sm:w-52 md:w-64 pl-10 pr-3 py-2 rounded-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-200 ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black placeholder-gray-400"}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Dropdown Search Suggestions */}
          {filteredBooks.length > 0 && (
            <ul className="absolute top-12 left-0 w-full sm:w-60 md:w-72 lg:w-80 bg-white shadow-lg rounded-md z-50 border border-gray-200 max-h-60 overflow-y-auto">
              {filteredBooks.map((book) => (
                <li 
                  key={book._id} 
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm md:text-base text-black"
                  onClick={() => handleBookClick(book._id)}
                >
                  {book.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Center Logo */}
        <div className="w-1/3 flex justify-center">
          <Link to="/about">
            <img src={LivingSeed} alt="Logo" className="w-30 sm:w-30 h-8 cursor-pointer ml-4" />
          </Link>
        </div>

        {/* Profile and Cart */}
        <div className="w-1/3 flex justify-end items-center space-x-4">
          <Link to="/user-dashboard">
            <img  src={userProfile?.image || "/profileIconBrown.jpeg"} alt="User" className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-amber-400 cursor-pointer"/>
          </Link>
          <div className="h-6 sm:h-8 border-l border-amber-700"></div>
          <Link to="/cart" className="relative mr-4 sm:mr-0">
            <ImCart className={`text-xl sm:text-2xl cursor-pointer ${darkMode ? " text-amber-500" : " text-amber-700 "}`} />
            <div className="absolute -top-4 -right-4 bg-white text-black text-xs sm:text-sm font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shadow-md">
              {totalCartItems}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
