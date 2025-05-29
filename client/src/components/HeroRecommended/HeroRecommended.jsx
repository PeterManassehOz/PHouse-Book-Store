import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setRecommendedBooks, updateBookInState, setRatingOverride } from "../../redux/cartSlice/cartSlice";
import { toast } from "react-toastify";
import { useGetAllRecommendedBooksQuery, useRateBookMutation } from "../../redux/bookAuthApi/bookAuthApi";
import Loader from '../Loader/Loader';
import Error from "../Error/Error";
//import BookRating from '../BookRating/BookRating';










const colors = ["#FFC0CB", "#D8BFD8", "#ADD8E6", "#C0C0C0", "#FFD700",];

const HeroRecommended = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 


  const { data: fetchedBooks, error, isLoading, refetch } = useGetAllRecommendedBooksQuery();
  const [rateBook, { isLoading: _isRating }] = useRateBookMutation();
  const recommendedBooks = useSelector((state) => state.cart.recommendedBooks); // Get books from Redux store
  const [selectedQuantities, setSelectedQuantities] = useState({});



  const overrideRatings = useSelector(state => state.cart.ratingsOverride || {});


  //const [userRatings, setUserRatings] = useState({});

  const darkMode = useSelector((state) => state.theme.darkMode);

 
  /*useEffect(() => {
    if (books.length === 0) {
      fetch("/books.json")
        .then((response) => response.json())
        .then((data) => {
          dispatch(setBooks(data)); // Store books in Redux
        })
        .catch((error) => console.error("Error loading books:", error));
    }
  }, [dispatch, books.length]);
  */

  
  useEffect(() => {
    if (fetchedBooks && recommendedBooks.length === 0) {
      dispatch(setRecommendedBooks(fetchedBooks)); 
    }
  }, [fetchedBooks, dispatch, recommendedBooks.length]); // ✅ Now, it only runs once when `books` is empty
  
    
    console.log("Fetched books:", fetchedBooks);
    console.log("Books from Redux:", recommendedBooks);
    if (isLoading) return <Loader />;
    if (error) return <Error />
    
  

  const handleBookClick = (book) => {
    navigate(`/book/${book._id}`, { state: { book } });
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



    /*const handleRate = async (bookId, rating) => {
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
    };*/


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
    <div className="relative mb-50">
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={2}
        slidesPerView={1}
        navigation={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="!overflow-visible" // Allow slides to overflow
      >
        {recommendedBooks.length > 0 ? (
          recommendedBooks.map((book, index) => (
            <SwiperSlide key={book._id} className="!overflow-visible relative">
              <div
                className="cursor-pointer p-4 rounded-lg shadow-lg text-center h-160 md:h-64 lg:h-80 xl:h-96 relative flex flex-col md:flex-row items-center justify-center md:items-start lg:relative"
                style={{ backgroundColor: colors[index % colors.length] }}
              >

                  {/* Details Section - Aligned Left */}
                  <div  className="w-full flex flex-col items-center text-center md:items-start md:text-left md:ml-75">
                  <div className="flex items-center space-x-2">
                      <h3 className={`text-xl font-semibold ${darkMode ?"text-white" : "text-white"}
                      [300px] whitespace-normal break-words`}>
                      {book.title}
                    </h3>

                    <div className="flex items-center justify-center w-8 h-8 text-white text-center font-bold rounded-full bg-amber-700 shadow-md shadow-gray-700">
                      {book.quantity}
                    </div>
                  </div>


                  <div className='flex items-center space-x-4'>
                    <p className={`text-xs sm:text-sm md:text-base ${darkMode ? "text-white" : "text-white"} mt-1`}>
                      {book.author[0]?.name}
                    </p>

                    <p className={`font-semibold ${darkMode ? "text-amber-700" : "text-amber-700"} mt-1`}>
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
                            star <= currentRating ? "text-yellow-500" : "text-white"
                          }`}
                        >★</button>
                        );
                    })}
                      <span className="ml-2 text-sm">
                        {book.averageRating.toFixed(1)}
                      </span>
                  </div>
                 

                    <p className="text-xs sm:text-sm md:text-base text-white mt-3 max-w-[250px] sm:max-w-[300px] mx-auto md:mx-0 break-words md:h-35 h-20 leading-relaxed text-wrap balance">
                      {book.description.length > 200 
                      ? `${book.description.substring(0, 180)}...` 
                      : book.description}
                    </p>


                    <div className="flex justify-center md:justify-start mt-6 md:mt-4 gap-5">
                      <button 
                      onClick={() => handleAddToCart(book, selectedQuantities[book._id] || 1)}
                      className="w-[150px] sm:w-auto px-6 py-3 sm:px-10 sm:py-3 text-xs sm:text-sm md:text-base lg:w-[300px] bg-white text-amber-700 rounded-full shadow-lg cursor-pointer">
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
                        cursor-pointer text-center appearance-none ${darkMode ? "bg-transparent text-white" : "text-white bg-transparent "}`}
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


                  {/* Book Image */}
                  <div className="flex    justify-center mt-10 lg:absolute lg:left-30 lg:-bottom-12 sm:justify-start max-sm:ml-50 sm:ml-10 transform -translate-x-1/2 left-54 -bottom-30 z-50">
                    <img
                      src={book.image}
                      alt={book.title}
                      onClick={() => handleBookClick(book)}
                      className=" md:lg:h-93 md:lg:w-60 w-[200px] h-[250px] sm:object-contain md:object-cover rounded-sm shadow-2xl"
                    />
                  </div>
       
              </div>
            </SwiperSlide>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </Swiper>
    </div>
  );
};

export default HeroRecommended;

