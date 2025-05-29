import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { addToCart, setPopularBooks, updateBookInState, setRatingOverride } from "../../redux/cartSlice/cartSlice";
import { toast } from 'react-toastify';
import { useGetAllPopularBooksQuery, useRateBookMutation } from "../../redux/bookAuthApi/bookAuthApi";
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
//import BookRating from '../BookRating/BookRating';








const Popular = () => {
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const [showError, setShowError] = useState(false);

  const { data: fetchedBooks, isLoading, refetch } = useGetAllPopularBooksQuery();
  const [rateBook, { isLoading: _isRating }] = useRateBookMutation();
  const popularBooks = useSelector((state) => state.cart.popularBooks);

  const [selectedQuantities, setSelectedQuantities] = useState({});

  const overrideRatings = useSelector(state => state.cart.ratingsOverride || {});


  //const [userRatings, setUserRatings] = useState({});


  const darkMode = useSelector((state) => state.theme.darkMode);



  useEffect(() => {
    // Set popular books only if they are not set already, to avoid overriding with stale data
    if (fetchedBooks && popularBooks.length === 0) {
      const popularOnly = fetchedBooks.filter(book => book.isPopular);
      dispatch(setPopularBooks(popularOnly));
    }
  }, [dispatch, fetchedBooks, popularBooks.length]);
  

  useEffect(() => {
    console.log("Updated Popular Books in UI:", popularBooks);
  }, [popularBooks]);
  


  console.log("Fetched books:", fetchedBooks);
  console.log("Books from Redux:", popularBooks);
  console.log("Popular Books from Redux:", useSelector((state) => state.cart.popularBooks));
  if (isLoading) return <Loader />;
  if (showError) return <Error onClose={() => setShowError(false)}/>

  const handleAudioClick = (book) => {
    navigate(`/book/${book._id}`, { state: book });
  };


  const handleAddToCart = (product, selectedQuantity) => {
    if (product.quantity >= selectedQuantity) {
      const productToAdd = {
        ...product,
        cartQuantity: selectedQuantity // Set the selected quantity
      };
      dispatch(addToCart(productToAdd)); // Dispatch to Redux
    } else {
      toast.error("Not enough stock available");
    }
  };
  

 /* const handleRate = async (bookId, rating) => {
    setUserRatings(prev => ({ ...prev, [bookId]: rating }));
    try {
      await rateBook({ bookId, rating }).unwrap();
      toast.success("Thanks for your rating!");
      // reload the popular-books query so avg. rating updates
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Could not submit rating");
    }
  }; */
  

   const handleRate = async (bookId, rating) => {
      dispatch(setRatingOverride({ bookId, rating }));
      try {
        // unwrap() returns { message, book: updatedBook } on success
        const { book: updatedBook } = await rateBook({ bookId, rating }).unwrap();
        toast.success("Thanks for your rating!");
  
        // Update the book in the Redux state
        dispatch(updateBookInState(updatedBook)); // Update the book in Redux state
  
        // reload the popular-books query so avg. rating updates
        refetch();
      } catch (err) {
        console.error(err);
        toast.error(err?.data?.message || "Could not submit rating");
      }
    };
    

  return (
    <div className={`p-4 transition-all duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className="text-lg font-bold mb-4">Popular Books</div>
      <div className="h-[900px] overflow-y-auto scrollbar-hide">
        {popularBooks?.map((book) => (
          <div 
            key={book._id} 
            className={`shadow-md rounded-lg p-6 mb-4 flex flex-col lg:flex-row mt-22 lg:relative text-center ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
              <div className="mb-4 flex justify-center sm:justify-start max-sm:ml-1 sm:ml-10 md:ml-16 lg:ml-0 lg:absolute lg:-top-7">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-45 h-72 object-cover rounded-lg cursor-pointer"
                  onClick={() => handleAudioClick(book)}
                />
              </div>

              <div  className="mb-4 mx-auto sm:mx-0 sm:text-left md:ml-50 max-w-[250px] sm:max-w-[300px] flex flex-col items-center sm:items-start text-center">

                <div className="flex flex-col items-center sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                  <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-700"}`}>
                    {book.title}
                  </h3>

                  <div className="flex items-center justify-center w-8 h-8 text-white text-center font-bold rounded-full bg-amber-700 shadow-md shadow-gray-700">
                    {book.quantity}
                  </div>
                </div>
              
                <div className='flex items-center space-x-4'>
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mt-1`}>
                    {book.author[0]?.name}
                  </p>

                  <p className={`${darkMode ? "text-amber-400" : "text-amber-700"} mt-1`}>
                    ₦{book.price}
                  </p>
                </div>



                <div className="flex items-center space-x-1 mt-4">
                {[1,2,3,4,5].map((star) => {    
                // prefer the exact user click; if none, fall back to rounded average
                const currentRating = overrideRatings[book._id] ?? Math.round(book.averageRating);

                return (
                <button
                  key={star}
                  onClick={() => handleRate(book._id, star)}
                  className={`text-xl cursor-pointer ${
                    star <= currentRating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >★</button>
                );
          })}
              <span className="ml-2 text-sm">
                {book.averageRating.toFixed(1)}
              </span>
                </div>

                <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} mt-5 break-words leading-relaxed text-wrap balance max-w-[250px] sm:max-w-[300px] mx-auto md:mx-0`}>
                  {book.description.length > 80 
                    ? `${book.description.substring(0, 70)}...` 
                    : book.description}
                </p>

                <div className="flex justify-center md:justify-start mt-4 gap-5">
                  <button 
                  onClick={() => handleAddToCart(book, selectedQuantities[book._id] || 1)}
                  className="w-[150px] sm:w-auto px-6 py-3 sm:px-10 sm:py-3 text-xs sm:text-sm md:text-base lg:w-[300px] bg-amber-700 text-white rounded-full shadow-lg cursor-pointer">
                    Add to cart
                  </button>


                  <select
                    value={selectedQuantities[book._id] || 1} // Default to 1
                    onChange={(e) => setSelectedQuantities({ 
                      ...selectedQuantities, 
                      [book._id]: parseInt(e.target.value) 
                    })}
                    className={`w-9 md:w-10 lg:w-12 text-sm font-medium
                    py-2 px-3 rounded-lg shadow-gray-400 shadow-sm focus:outline-none transition-all duration-300 
                    cursor-pointer text-center appearance-none ${darkMode ? "bg-transparent text-white" : "text-gray-900 bg-transparent "}`}
                  >
                    {[...Array(book.quantity).keys()].map((num) => (
                      <option key={num + 1} value={num + 1}
                      className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
                      >
                        {num + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default Popular;


