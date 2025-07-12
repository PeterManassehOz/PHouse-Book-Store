import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const isBrowser = typeof window !== 'undefined';

// Read the env var
const API_BASE = import.meta.env.VITE_API_BASE;


// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);



const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE}/books`,
  prepareHeaders: (headers) => {
   const token = isBrowser ? window.localStorage.getItem('token') : null;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const bookAuthApi = createApi({
  reducerPath: 'bookAuthApi',
  baseQuery,
  endpoints: (builder) => ({
    getAllBooks: builder.query({
      query: () => ({
        url: '/',
        method: 'GET',
      }),
      transformResponse: (response) => {
        return response.map((book) => ({
          ...book,
          // GCS URL already complete, no need to transform
          image: book.image,
        }));
      }
    }),
        
    getAllPopularBooks: builder.query({
      query: () => ({
        url: '/popular',
        method: 'GET',
      }),
        transformResponse: (response) => {
        return response.map((book) => ({
          ...book,
          // GCS URL already complete, no need to transform
          image: book.image,
        }));
      }
    }),
    getAllRecommendedBooks: builder.query({
      query: () => ({
        url: '/recommended',
        method: 'GET',
      }),
       transformResponse: (response) => {
        return response.map((book) => ({
          ...book,
          // GCS URL already complete, no need to transform
          image: book.image,
        }));
      }
    }),
    getAllYearBooks: builder.query({
      query: () => ({
        url: '/year-book',
        method: 'GET',
      }),
      transformResponse: (response) => {
        return response.map((book) => ({
          ...book,
          // GCS URL already complete, no need to transform
          image: book.image,
        }));
      }
    }),
    getBookById: builder.query({
        query: (id) => {
          console.log(`Fetching study with ID: ${id}`);
          return {
            url: `/${id}`,
            method: 'GET',
          };
        },
         transformResponse: (response) => ({
          ...response,
          image: response.image,
        }),
      }),
      getAuthorsOfTheWeek: builder.query({
        query: () => '/authors',
        transformResponse: (response) => {
          return response.map((author) => ({
            ...author,
            authorImage: author.authorImage, // already a GCS URL
            books: author.books.map((book) => ({
              ...book,
              image: book.image, // already a GCS URL
            })),
          }));
        }
      }),      
      rateBook: builder.mutation({
        query: ({ bookId, rating }) => ({
          url: `/${bookId}/rate`,
          method: 'POST',
          body: { rating },
        }),
        invalidatesTags: (result, error, { bookId }) => [
          { type: 'Popular', id: bookId }
        ],
      }),
      getBookRating: builder.query({
        query: (bookId) => `/${bookId}/rating`,
        // no transformResponse needed if your controller returns:
        // { totalRatings, averageRating, ratings: [...] }
        providesTags: (result, error, bookId) => [
          { type: 'Popular', id: bookId }
        ],
      }),
  
    }),
});


export const {
    useGetAllBooksQuery,
    useGetAllPopularBooksQuery,
    useGetAllRecommendedBooksQuery,
    useGetAllYearBooksQuery,
    useGetBookByIdQuery,
    useGetAuthorsOfTheWeekQuery,
    useRateBookMutation,
    useGetBookRatingQuery,
} = bookAuthApi;