import React from 'react';
import { useGetBookRatingQuery } from '../../redux/bookAuthApi/bookAuthApi';





const BookRating = ({ bookId }) => {
  const { data, isLoading, error } = useGetBookRatingQuery(bookId);

  if (isLoading) return <span className="text-sm text-gray-400">Loading...</span>;
  if (error) return <span className="text-sm text-red-500">Error</span>;

  return (
    <span className="ml-2 text-sm">
      {data?.averageRating?.toFixed(1) || '0.0'}
    </span>
  );
};

export default BookRating;
