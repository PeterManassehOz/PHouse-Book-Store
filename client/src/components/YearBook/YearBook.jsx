import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllYearBooksQuery } from "../../redux/bookAuthApi/bookAuthApi";
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { setYearBooks } from '../../redux/cartSlice/cartSlice';


const YearBook = () => {
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const [ showError, setShowError ] = useState(false);

  
  const { data: fetchedBooks, isLoading } = useGetAllYearBooksQuery();
  const yearBooks = useSelector((state) => state.cart.yearBooks); // Get books from Redux store

  const darkMode = useSelector((state) => state.theme.darkMode);

    // Save the fetched books in Redux when available
    useEffect(() => {
      if (fetchedBooks) {
        dispatch(setYearBooks(fetchedBooks));  // ✅ Update Redux store
      }
    }, [dispatch, fetchedBooks]);
  
    useEffect(() => {
      console.log("Updated Popular Books in UI:", yearBooks);
    }, [yearBooks]);
  
    
  console.log("Fetched books:", fetchedBooks);
  console.log("Books from Redux:", yearBooks);
  if (isLoading) return <Loader />;
  if (showError) return <Error onClose={() => setShowError(false)}/>

  const handleBookClick = (book) => {
    // Navigate to the single audio page
    navigate(`/book/${book._id}`, { state: book });
  };

  return (
    <div className={`p-4 transition-all duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
    <h2 className="text-lg font-bold mb-4">Books of the Year</h2>

    {/* Stack of authors */}
    <div className="h-[28rem] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-amber-100">
        {yearBooks.map((yearBook, index) => (
          <div
          key={index}
          className={`flex items-center space-x-4 p-3 rounded-lg shadow-md transition-all h-20 duration-300 cursor-pointer ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
          onClick={() => handleBookClick(yearBook)}
        >
          {/* Book Image */}
          <img
            src={yearBook.image}
            alt={yearBook.title}
            className="w-12 h-12 rounded-md object-cover shadow-sm"
          />
        
          {/* Text Content */}
          <div className={`flex flex-col justify-center space-y-1 overflow-hidden ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            <div className={`text-sm font-semibold truncate w-40 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {yearBook.title}
            </div>
            <div className={`text-xs truncate w-40 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              By <span className="font-medium">{yearBook.author[0]?.name}</span>
            </div>
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-md w-fit ${darkMode ? "text-amber-300 bg-amber-800" : "text-amber-700 bg-amber-100"}`}>
              {yearBook.category}
            </div>
          </div>

        </div>
        
        ))}
      </div>
  </div>
  )
}

export default YearBook