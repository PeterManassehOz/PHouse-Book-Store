import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/books',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
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
        // For each book in the response, prepend the base URL to the image property.
        return response.map((book) => ({
          ...book,
          image: `http://localhost:5000/${book.image}`,
        }));
      },
    }),
        
    getAllPopularBooks: builder.query({
      query: () => ({
        url: '/popular',
        method: 'GET',
      }),
      transformResponse: (response) => {
        // For each book in the response, prepend the base URL to the image property.
        return response.map((book) => ({
          ...book,
          image: `http://localhost:5000/${book.image}`,
        }));
      },
    }),
    getAllRecommendedBooks: builder.query({
      query: () => ({
        url: '/recommended',
        method: 'GET',
      }),
      transformResponse: (response) => {
        // For each book in the response, prepend the base URL to the image property.
        return response.map((book) => ({
          ...book,
          image: `http://localhost:5000/${book.image}`,
        }));
      }
    }),
    getAllYearBooks: builder.query({
      query: () => ({
        url: '/year-book',
        method: 'GET',
      }),
      transformResponse: (response) => {
        // For each book in the response, prepend the base URL to the image property.
        return response.map((yearBook) => ({
          ...yearBook,
          image: `http://localhost:5000/${yearBook.image}`,
        }));
      },
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
          image: `http://localhost:5000/${response.image}`,
        }),
      }),
      getAuthorsOfTheWeek: builder.query({
        query: () => '/authors',
        transformResponse: (response) => {
          // response is expected to be an array of author objects
          return response.map((author) => ({
            ...author,
            // Correct the image URL using the authorImage field
            authorImage: `http://localhost:5000/${author.authorImage}`,
            books: author.books.map((book) => ({
              ...book,
              image: `http://localhost:5000/${book.image}`,
            })),
          }));
        },
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