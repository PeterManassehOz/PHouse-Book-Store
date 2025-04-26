import React from 'react';
import HeroRecommended from '../../components/HeroRecommended/HeroRecommended';
import YearBook from '../../components/YearBook/YearBook';
import Author from '../../components/Author/Author';
import Popular from '../../components/Popular/Popular';
import Category from '../../components/Category/Category';
import { FaRegFolderOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Navigate to mobile overlay page
  const goToMobileOverlay = () => {
    navigate('/mobile-view-author-year');
  };

  return (
    <div className="space-y-6 relative">
      {/* Top section */}
      <HeroRecommended />

      {/* Two-column bottom section */}
      <div className="flex flex-col lg:flex-row gap-6 px-10">
        {/* ← desktop only */}
        <div className="hidden lg:flex lg:w-1/5 flex-col space-y-4">
          <Author />
          <YearBook />
        </div>

        {/* → always visible */}
        <div className="flex flex-col lg:flex-row w-full lg:w-4/5 gap-6">
          <div className="w-full lg:w-1/2"><Popular /></div>
          <div className="w-full lg:w-1/2"><Category /></div>
        </div>
      </div>

      {/* Mobile only: the floating folder icon button */}
      <button
        onClick={goToMobileOverlay}
        className="absolute bottom-4 right-4 p-3 rounded-full bg-amber-700 text-white text-2xl shadow-lg lg:hidden"
      >
        <FaRegFolderOpen />
      </button>
    </div>
  );
};

export default Home;
