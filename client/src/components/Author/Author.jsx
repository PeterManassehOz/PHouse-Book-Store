import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetAuthorsOfTheWeekQuery } from "../../redux/bookAuthApi/bookAuthApi";
import Loader from "../Loader/Loader";

const Author = () => {
  const navigate = useNavigate();
  const [showError, _setShowError] = useState(false);
  
  // Use the data directly (it’s already an array)
  const { data: authors = [], isLoading } = useGetAuthorsOfTheWeekQuery();
  
  const darkMode = useSelector((state) => state.theme.darkMode);
  console.log("Dark Mode State:", darkMode);
  console.log("API Response:", authors);

  if (isLoading) return <Loader />;
  if (showError) return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-start rounded-md "
      style={{ backgroundImage: "url('/Authenticate.jpg')" }}
    >
      <div className="m-6 sm:m-20">
        <p className="text-white font-bold text-2xl sm:text-4xl md:text-6xl bg-black/50 p-4 sm:p-6 rounded-md max-w-sm sm:max-w-md">
          Get authenticated to use Quorum.
        </p>

        <Link to="/login">
          <button className="mt-10 bg-[#00013d] text-white text-xl px-3 py-5 rounded-md hover:bg-[#03055B] transition cursor-pointer">
            Go to Login
          </button>
        </Link>
      </div>
    </div>
  )

  const handleAudioClick = (author) => {
    // Navigate to the single author page, passing the author object in state
    navigate(`/author/${author.name}`, { state: author });
  };

  return (
    <div
      className={`p-4 transition-all duration-300 cursor-pointer ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h2 className="text-lg font-bold mb-4">Authors of the Week</h2>
      <div className="h-[28rem] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-amber-100">
        {authors.length === 0 ? (
          <div>No authors available</div>
        ) : (
          authors.map((author, index) => (
            <div
              key={index}
              onClick={() => handleAudioClick(author)}
              className={`flex items-center space-x-4 p-3 rounded-lg shadow-md transition-all duration-300 ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
            >
              {/* Display the author's image */}
              <img
                src={author.authorImage}
                alt={author.name}
                className="w-12 h-12 rounded-full border-2 border-amber-400"
              />
              {/* Display the author's name */}
              <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {author.name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Author;
