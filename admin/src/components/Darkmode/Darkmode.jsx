import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../../redux/themeSlice/themeSlice';
import { MdOutlineWbSunny } from "react-icons/md";
import { FaMoon } from "react-icons/fa";





const DarkMode = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state) => state.theme.darkMode);

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      className="px-4 py-2 rounded-md font-medium transition duration-300 bg-amber-700 hover:bg-amber-600 text-white flex items-center gap-2 cursor-pointer mt-10"
    >
      {darkMode ? <MdOutlineWbSunny size={20} /> : <FaMoon size={18} />}
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default DarkMode;
