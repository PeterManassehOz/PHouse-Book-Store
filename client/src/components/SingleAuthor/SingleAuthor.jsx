import React from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const SingleAuthor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const author = location.state;
  const darkMode = useSelector((state) => state.theme.darkMode);

  if (!author) return <p className="text-center text-red-500 mt-10">No author found.</p>;

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full h-screen shadow-md ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
        <div className="flex flex-row items-center w-full max-w-2xl mx-auto px-4 gap-70 mb-15 md:gap-136">
        <button
          onClick={() => navigate(-1)}
          className={`absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer 
            ${darkMode ? "bg-amber-600 text-white hover:bg-amber-400" : "bg-amber-700 text-white hover:bg-amber-500"} 
            rounded-full shadow-md transition duration-200 z-10`}
        >
          <IoIosArrowBack className="text-xl sm:text-2xl" />
        </button>
        </div>
      <div className="w-[90%] md:w-[800px] h-[90vh] rounded-xl shadow-md overflow-hidden flex flex-col">
        {/* Top - Author Info */}
        <div className={`flex flex-col items-center justify-center p-15 ${darkMode ? "bg-gray-600 text-white" : "bg-white text-black"}`}>
          <img
            src={author.authorImage}
            alt={author.name}
            className="w-40 h-60 object-cover rounded-md shadow-lg"
          />
          <h2 className="text-2xl font-bold mt-4">{author.name}</h2>
          <p className={`mt-2 text-center max-w-md ${darkMode ? "text-white" : "text-black" }`}>{author.bio}</p>
        </div>

        {/* Scrollable book section */}
        <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? "text-white bg-gray-600" : "text-black bg-gray-50 "}`}>
          <h3 className="text-xl font-semibold mb-4">Books</h3>
          {author.books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {author.books.map((book, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/book/${book._id}`)}
                  className={`rounded-lg p-3 shadow-md cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 text-white border border-gray-700"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded"
                  />
                  <h4 className="font-semibold mt-2">{book.title}</h4>
                  <p className="text-sm mt-1 text-gray-500 dark:text-gray-300">
                    {book.description.slice(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No books found for this author.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleAuthor;
