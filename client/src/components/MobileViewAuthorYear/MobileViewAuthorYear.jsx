import React from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Author from '../../components/Author/Author';
import YearBook from '../../components/YearBook/YearBook';

const MobileViewAuthorYear = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen px-6 py-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white bg-amber-700 hover:bg-amber-400 rounded-full shadow-md cursor-pointer mb-5"
        >
            <IoIosArrowBack className="text-xl sm:text-2xl" />
        </button>

      {/* Components */}
      <Author />
      <YearBook />
    </div>
  );
};

export default MobileViewAuthorYear;
