import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';



const initialState = {
    cartItems: [],
    books: [],
    popularBooks: [],
    recommendedBooks: [],
    yearBooks: [],
    ratingsOverride: {},
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { _id, cartQuantity } = action.payload;
            const existingItem = state.cartItems.find((item) => item._id === _id);

            if (existingItem) {
                existingItem.cartQuantity += cartQuantity;
            } else {
                state.cartItems.push({ ...action.payload, cartQuantity });
            }

            // Update books array to reduce stock
            state.books = state.books.map((book) =>
                book._id === _id
                    ? { ...book, quantity: Math.max(0, book.quantity - cartQuantity) }
                    : book
            );

            // ✅ Ensure `popularBooks` is also updated immutably
            state.popularBooks = state.popularBooks.map((book) =>
                book._id === _id
                    ? { ...book, quantity: Math.max(0, book.quantity - cartQuantity) }
                    : book
            );

            // ✅ Ensure `recommendedBooks` is also updated immutably
            state.recommendedBooks = state.recommendedBooks.map((book) =>
                book._id === _id
                    ? { ...book, quantity: Math.max(0, book.quantity - cartQuantity) }
                    : book
            );

            toast('Item added successfully!');
        },

        // Remove item from cart and restore quantity to books array
        removeFromCart: (state, action) => {
            const removedItem = state.cartItems.find((item) => item._id === action.payload._id);
            if (removedItem) {
                // Restore quantity to books array
                state.books = state.books.map((book) =>
                    book._id === removedItem._id
                        ? { ...book, quantity: book.quantity + removedItem.cartQuantity }
                        : book
                );

                // ✅ Ensure `popularBooks` is also updated immutably
                state.popularBooks = state.popularBooks.map((book) =>
                    book._id === removedItem._id
                        ? { ...book, quantity: book.quantity + removedItem.cartQuantity }
                        : book
                );

                // ✅ Ensure `recommendedBooks` is also updated immutably
                state.recommendedBooks = state.recommendedBooks.map((book) =>
                    book._id === removedItem._id
                        ? { ...book, quantity: book.quantity + removedItem.cartQuantity }
                        : book
                );
            }

            // Remove from cartItems
            state.cartItems = state.cartItems.filter((item) => item._id !== action.payload._id);
        },

        clearCart: (state) => {
            // Restore all items' quantities to books array
            state.books = state.books.map((book) => {
                const cartItem = state.cartItems.find((item) => item._id === book._id);
                return cartItem
                    ? { ...book, quantity: book.quantity + cartItem.cartQuantity }
                    : book;
            });

            // ✅ Ensure `popularBooks` is also updated immutably
            state.popularBooks = state.popularBooks.map((book) => {
                const cartItem = state.cartItems.find((item) => item._id === book._id);
                return cartItem
                    ? { ...book, quantity: book.quantity + cartItem.cartQuantity }
                    : book;
            });

            // ✅ Ensure `recommendedBooks` is also updated immutably
            state.recommendedBooks = state.recommendedBooks.map((book) => {
                const cartItem = state.cartItems.find((item) => item._id === book._id);
                return cartItem
                    ? { ...book, quantity: book.quantity + cartItem.cartQuantity }
                    : book;
            });

            // Empty the cart
            state.cartItems = [];
        },

        setBooks: (state, action) => {
            if (state.books.length === 0) {
                state.books = action.payload.map((book) => ({ ...book, quantity: book.quantity || 0 }));
            }
        },

        setPopularBooks: (state, action) => {
            state.popularBooks = action.payload.map((book) => ({ ...book, quantity: book.quantity || 0 }));
        },

        setRecommendedBooks: (state, action) => {
            state.recommendedBooks = action.payload.map((book) => ({ ...book, quantity: book.quantity || 0 }));
        },

        setYearBooks: (state, action) => {
            state.yearBooks = action.payload;
        },

        clearBooks: (state) => {
            state.books = [];
            state.popularBooks = [];
            state.recommendedBooks = [];
            state.yearBooks = [];
        },

        // New reducer for deleting a book
        deleteBookFromState: (state, action) => {
            const bookId = action.payload._id;

            // Remove the book from the books array
            state.books = state.books.filter((book) => book._id !== bookId);

            // Remove the book from the popularBooks array
            state.popularBooks = state.popularBooks.filter((book) => book._id !== bookId);

            // Remove the book from the recommendedBooks array
            state.recommendedBooks = state.recommendedBooks.filter((book) => book._id !== bookId);

            // Remove the book from the yearBooks array
            state.yearBooks = state.yearBooks.filter((book) => book._id !== bookId);

            // Optionally, remove the book from the cartItems if it exists
            state.cartItems = state.cartItems.filter((item) => item._id !== bookId);

            toast("Book deleted successfully!");
        },

        
      /*  updateBookInState: (state, action) => {
            const updatedBook = action.payload;

            // Update the book in the books array
            state.books = state.books.map((book) =>
                book._id === updatedBook._id ? { ...book, ...updatedBook } : book
            );

            // Update the book in popularBooks if necessary (or remove if it's no longer popular)
            state.popularBooks = state.popularBooks.map((book) =>
                book._id === updatedBook._id ? { ...book, ...updatedBook } : book
            );

            // Update the book in recommendedBooks if necessary (or remove if it's no longer recommended)
            state.recommendedBooks = state.recommendedBooks.map((book) =>
                book._id === updatedBook._id ? { ...book, ...updatedBook } : book
            );
        },*/

        
        updateBookInState: (state, action) => {
            const updated = action.payload;
            const mapOver = (arr) =>
              arr.map((book) =>
                book._id === updated._id
                  ? { ...book, averageRating: updated.averageRating, ratings: updated.ratings }
                  : book
              );
      
            state.books             = mapOver(state.books);
            state.popularBooks      = mapOver(state.popularBooks);
            state.recommendedBooks  = mapOver(state.recommendedBooks);
            state.yearBooks         = mapOver(state.yearBooks);
          },

        setRatingOverride: (state, action) => {
            const { bookId, rating } = action.payload;
            state.ratingsOverride[bookId] = rating;
        },

        
        emptyCartAfterOrder: (state) => {
            // Only clear cart, don't touch product stock
            state.cartItems = [];
        },
        
    },
});

// Export the actions
export const {
    addToCart,
    removeFromCart,
    clearCart,
    setBooks,
    setPopularBooks,
    setRecommendedBooks,
    setYearBooks,
    clearBooks,
    deleteBookFromState, 
    updateBookInState,
    setRatingOverride,
    emptyCartAfterOrder,
} = cartSlice.actions;

export default cartSlice.reducer;
