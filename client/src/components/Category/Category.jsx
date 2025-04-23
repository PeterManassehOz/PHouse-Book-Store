import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, setBooks, updateBookInState, setRatingOverride } from "../../redux/cartSlice/cartSlice";
import { toast } from 'react-toastify';
import Loader from '../Loader/Loader';
import { useGetAllBooksQuery, useRateBookMutation } from '../../redux/bookAuthApi/bookAuthApi';
import Error from '../Error/Error';
//import BookRating from '../BookRating/BookRating';









const categories = [
  "All genre", "Fiction", "Religion", "Business", "Science", "Fantasy", "Philosophy", "Adventure"
];




const Category = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [ showError, setShowError ] = useState(false);

  const { data: fetchedBooks, isLoading, refetch } = useGetAllBooksQuery();
  const [rateBook, { isLoading: _isRating }] = useRateBookMutation();
  const books = useSelector((state) => state.cart.books);
  const [selectedCategory, setSelectedCategory] = useState("All genre");
  const [selectedQuantities, setSelectedQuantities] = useState({});

  const overrideRatings = useSelector(state => state.cart.ratingsOverride || {});


  
  //const [userRatings, setUserRatings] = useState({});
  
  const darkMode = useSelector((state) => state.theme.darkMode);


  /*useEffect(() => {
    if (books.length === 0) { // Only fetch if books is empty
    fetch("books.json")
      .then(res => res.json())
      .then((data) => {
        console.log("Fetched books:", data);
        dispatch(setBooks(data));
      });
    }
  }, [dispatch, books.length]); // Only fetch if books is empty
 */

  useEffect(() => {
    if (fetchedBooks && books.length === 0) { 
      dispatch(setBooks(fetchedBooks)); 
    }
  }, [fetchedBooks, dispatch, books.length]); 
  

  console.log("Fetched books:", fetchedBooks);
  console.log("Books from Redux:", books);
  if (isLoading) return <Loader />;
  if (showError) return <Error onClose={() => setShowError(false)}/>

  // Filter books by category
  const filteredBooks = selectedCategory === "All genre"
  ? books || []
  : (books || []).filter(book => book.category?.toLowerCase() === selectedCategory.toLowerCase());

  const handleBookClick = (book) => {
    // Navigate to the single audio page
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
    dispatch(setRatingOverride({ bookId, rating })); // Update the rating in Redux state
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




 //console.log(books);
  return (
    <div className={`p-4 transition-all duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Swiper for Categories (Horizontal) */}
      <div className="relative w-full flex justify-center items-center custom-category-swiper">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={5}
          slidesPerView={3}
          navigation={true}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
          className="h-[50px] flex items-center justify-center overflow-visible"
        >
          {/* Invisible Padding to Prevent Overlap */}
          <SwiperSlide className="w-auto opacity-0 pointer-events-none">‎</SwiperSlide>

          {categories.map((category, index) => (
            <SwiperSlide key={index} className="w-auto">
              <button
                className={`px-4 py-2 text-sm font-semibold rounded-lg cursor-pointer ${
                  selectedCategory === category ? "text-white bg-amber-700 border border-amber-400" : "bg-white text-black border border-gray-300"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            </SwiperSlide>
          ))}

          {/* Invisible Padding to Prevent Overlap */}
          <SwiperSlide className="w-auto opacity-0 pointer-events-none">‎</SwiperSlide>
        </Swiper>
      </div>

      {/* Books (Vertical) */}
      <div className="h-[900px] overflow-y-auto scrollbar-hide">
      {filteredBooks?.map((book) => (
       <div 
       key={book._id} 
       className={`shadow-md rounded-lg p-6 mb-4 flex flex-col lg:flex-row mt-20 lg:relative text-center ${
         darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
       }`}
     >
       {/* Image Container */}
       <div className="mb-4 flex justify-center sm:justify-start max-sm:ml-1 sm:ml-10 md:ml-16 lg:ml-0 lg:absolute lg:-top-7">
         <img
           src={book.image}
           alt={book.title}
           className="w-45 h-72 object-cover rounded-lg cursor-pointer"
           onClick={() => handleBookClick(book)}
         />
       </div>
     
       {/* Book Details */}
       <div className="mb-4 mx-auto sm:mx-0 sm:text-left md:ml-50 max-w-[250px] sm:max-w-[300px] flex flex-col items-center sm:items-start text-center">

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
     
         {/* Button */}
         <div className="flex justify-center md:justify-start mt-4 gap-5">

           <button 
           onClick={() => handleAddToCart(book, selectedQuantities[book._id] || 1)}
           className="w-[150px] sm:w-auto px-6 py-3 sm:px-10 sm:py-3 text-xs sm:text-sm md:text-base lg:w-[300px] bg-amber-700 text-white rounded-full shadow-lg cursor-pointer">
             Add to cart
           </button>

            {/* Quantity Selector */}
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

export default Category;
