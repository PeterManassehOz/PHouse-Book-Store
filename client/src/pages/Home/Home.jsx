import React from 'react';
import HeroRecommended from '../../components/HeroRecommended/HeroRecommended';
import YearBook from '../../components/YearBook/YearBook';
import Author from '../../components/Author/Author';
import Popular from '../../components/Popular/Popular';
import Category from '../../components/Category/Category';

const Home = () => {
  return (
    <div className="space-y-6">
      
      {/* HeroRecommended - Top Section */}
      <div>
        <HeroRecommended />
      </div>

      {/* Bottom Section - Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 px-10">
        
        {/* Left Section (20%) */}
        <div className="hidden lg:flex w-1/5 flex-col space-y-4">
          <Author />
          <YearBook />
        </div>

        {/* Right Section (80%) */}
        <div className="flex flex-col lg:flex-row w-full lg:w-4/5 gap-6">
          <div className="w-full lg:w-1/2">
            <Popular />
          </div>
          <div className="w-full lg:w-1/2">
            <Category />
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;
