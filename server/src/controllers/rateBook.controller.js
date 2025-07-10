const Book = require('../models/books.model');

exports.rateBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { rating } = req.body;
        const user = req.user; // Get logged-in user from JWT

        // Validate user
        if (!user || !user._id) {
            return res.status(400).json({ message: "Invalid user" });
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." });
        }

        // Find book and populate user details in ratings
        const book = await Book.findById(bookId).populate('ratings.userId', 'username image');
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Check if the user's state matches the book's state
        if (user.state !== book.state) {
            return res.status(403).json({ message: "You can only rate books from your state." });
        }

        // Check if user has already rated the book
        const existingRating = book.ratings.find(r => r.userId && r.userId.toString() === user._id.toString());

        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating;
        } else {
            // Add new rating
            book.ratings.push({ userId: user._id, rating });
        }

        // Calculate new average rating
        const totalRatings = book.ratings.length;
        const sumRatings = book.ratings.reduce((sum, r) => sum + r.rating, 0);
        book.averageRating = sumRatings / totalRatings;

        await book.save();

        // Re-populate the book to return user details in ratings
        const updatedBook = await Book.findById(bookId).populate('ratings.userId', 'username image');

        res.status(200).json({ message: "Rating submitted successfully.", book: updatedBook });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getBookRating = async (req, res) => {
    try {
      const { bookId } = req.params;
  
      // Find the book and populate user details on each rating
      const book = await Book.findById(bookId)
        .populate('ratings.userId', 'username image');
      if (!book) {
        return res.status(404).json({ message: "Book not found." });
      }
  
      // Compute total number of ratings and sum
      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce((sum, r) => sum + r.rating, 0);
  
      // Compute average; fall back to stored value if you prefer
      const averageRating = totalRatings > 0
        ? sumRatings / totalRatings
        : 0;
  
      res.status(200).json({
        bookId,
        totalRatings,
        averageRating: Number(averageRating.toFixed(2)),
        ratings: book.ratings.map(r => ({
          userId:    r.userId._id,
          username:  r.userId.username,
          userImage: r.userId.image,
          rating:    r.rating,
          date:      r.createdAt || r._id.getTimestamp() // if you want a timestamp
        }))
      });
    } catch (error) {
      console.error("getBookRating error:", error);
      res.status(500).json({ message: error.message });
    }
  };