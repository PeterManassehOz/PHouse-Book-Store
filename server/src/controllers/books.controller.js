const mongoose = require('mongoose');
const Book = require('../models/books.model');
const Order = require('../models/orders.model');
const User = require('../models/users.model');
const { getSubscribersByState } = require('../services/newsletter.service');
const Admin = require('../models/admin.model');
const path = require('path');
const bucket = require('../../gcs');


async function uploadBufferToGCS(buffer, originalName, mimetype, folder) {
  const timestamp = Date.now();
  const gcsPath = `${folder}/${timestamp}_${originalName.replace(/\s+/g, '_')}`;
  const file = bucket.file(gcsPath);

  return new Promise((resolve, reject) => {
    const stream = file.createWriteStream({
      metadata: { contentType: mimetype },
    });
    stream.on('error', reject);
    stream.on('finish', async () => {
      // Make public (omit if you want signed URLs instead)
      await file.makePublic();
      resolve(`https://storage.googleapis.com/${bucket.name}/${gcsPath}`);
    });
    stream.end(buffer);
  });
}

exports.createBook = async (req, res) => {
  try {
    const {
      title, author, price,
      description, category, date,
      quantity, isPopular, isRecommended, isYearBook,
    } = req.body;
    const admin = req.user;

    if (![title, author, price, description, category, date, quantity].every(Boolean)) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'Book image is required.' });
    }

    // Upload book image
    const bookImageFile = req.files.image[0];
    const imageUrl = await uploadBufferToGCS(
      bookImageFile.buffer,
      bookImageFile.originalname,
      bookImageFile.mimetype,
      'books'
    );

    // Parse author
    let parsedAuthor = typeof author === 'string' ? JSON.parse(author) : author;
    if (typeof parsedAuthor !== 'object' || Array.isArray(parsedAuthor)) {
      return res.status(400).json({ message: 'Author must be an object.' });
    }
    if (!parsedAuthor.name || !parsedAuthor.bio) {
      return res.status(400).json({ message: 'Author must have name and bio.' });
    }

    // Upload authorImage if present
    if (req.files.authorImage && req.files.authorImage[0]) {
      const authImg = req.files.authorImage[0];
      parsedAuthor.authorImage = await uploadBufferToGCS(
        authImg.buffer,
        authImg.originalname,
        authImg.mimetype,
        'authors'
      );
    }

    const newBook = new Book({
      title,
      author: [parsedAuthor],
      price,
      image: imageUrl,
      description,
      category,
      date,
      quantity,
      rating: 0,
      state: admin.state,
      adminId: admin._id,
      isPopular: Boolean(isPopular),
      isRecommended: Boolean(isRecommended),
      isYearBook: Boolean(isYearBook),
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const admin = req.user;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.adminId.toString() !== admin._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Prepare updates
    const updated = { ...req.body };
    // Handle image replacement
    if (req.files && req.files.image) {
      const file = req.files.image[0];
      updated.image = await uploadBufferToGCS(
        file.buffer,
        file.originalname,
        file.mimetype,
        'books'
      );
    } else {
      updated.image = book.image;
    }

    // Handle author if provided
    if (req.body.author) {
      let parsedAuthor = typeof req.body.author === 'string'
        ? JSON.parse(req.body.author)
        : req.body.author;
      if (typeof parsedAuthor !== 'object' || Array.isArray(parsedAuthor)) {
        return res.status(400).json({ message: 'Author must be an object.' });
      }
      if (!parsedAuthor.name || !parsedAuthor.bio) {
        return res.status(400).json({ message: 'Author must have name and bio.' });
      }
      if (req.files.authorImage && req.files.authorImage[0]) {
        const ai = req.files.authorImage[0];
        parsedAuthor.authorImage = await uploadBufferToGCS(
          ai.buffer,
          ai.originalname,
          ai.mimetype,
          'authors'
        );
      } else {
        // preserve old URL if name matches
        const old = book.author.find(a => a.name === parsedAuthor.name);
        if (old && old.authorImage) parsedAuthor.authorImage = old.authorImage;
      }
      updated.author = [parsedAuthor];
    }

    updated.state   = book.state;
    updated.adminId = book.adminId;

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updated, { new: true });
    res.json(updatedBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.getAllBooks = async (req, res) => {
    try {
      const requester = req.user || req.admin; // check for either user or admin
      if (!requester || !requester.state) {
        return res.status(401).json({ message: 'Unauthorized: Missing state info' });
      }
  
      const books = await Book.find({ state: requester.state }).populate('adminId', 'name state');

      // ✏️ Debug log
    console.log("🏷️ getAllBooks result:", JSON.stringify(books, null, 2));
    
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


exports.getAllPopularBooks = async (req, res) => {
    try {
        const user = req.user; // Get user from JWT

        // Fetch books that match the user's state and are either explicitly marked as popular or have an average rating of 4 or more
        const books = await Book.find({ 
            state: user.state, 
            $or: [{ isPopular: true }, { averageRating: { $gte: 4 } }] 
        }).populate('adminId', 'firstname lastname state');

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllRecommendedBooks = async (req, res) => {
    try {
        const user = req.user; // Get user from JWT

        // Fetch books that match the user's state and are either explicitly marked as popular or have an average rating of 4 or more
        const books = await Book.find({ 
            state: user.state, 
            $or: [{ isRecommended: true }, { averageRating: { $gte: 3 } }] 
        }).populate('adminId', 'firstname lastname state');

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllYearBooks = async (req, res) => {
    try {
        const user = req.user; // Get user from JWT

        // Fetch only books that match the user's state AND are marked as year books
        const yearBooks = await Book.find({ state: user.state, isYearBook: true })
            .populate('adminId', 'firstname lastname state');
        
        res.status(200).json(yearBooks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getBookById = async (req, res) => {
    try {
      const requester = req.user || req.admin;
      if (!requester || !requester.state) {
        return res.status(401).json({ message: 'Unauthorized: Missing state info' });
      }
  
      const book = await Book.findById(req.params.id).populate('adminId', 'firstname lastname state');
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      // Only return if state matches
      if (book.state !== requester.state) {
        return res.status(403).json({ message: 'Forbidden: Access to this book is not allowed' });
      }
  
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Authors of the week without state filtering
/*exports.getAuthorsOfTheWeek = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log("Fetching orders from:", sevenDaysAgo);

        const orders = await Order.find({ createdAt: { $gte: sevenDaysAgo } })
            .populate({
                path: 'productIds', 
                select: 'author' 
            });

        console.log("Orders found:", orders);

        const authorCounts = {};

        orders.forEach(order => {
            order.productIds.forEach(book => {
                if (book.author && Array.isArray(book.author)) { 
                    book.author.forEach(author => {
                        const key = author.name;

                        if (!authorCounts[key]) {
                            authorCounts[key] = { 
                                name: author.name,
                                bio: author.bio,
                                authorImage: author.authorImage,
                                count: 0,
                                books: [] // Add books array
                            };
                        }
                        authorCounts[key].count++;
                    });
                }
            });
        });

        // Fetch books for each author
        for (const authorKey in authorCounts) {
            const books = await Book.find({ "author.name": authorCounts[authorKey].name })
                .select("title image description");

            authorCounts[authorKey].books = books; // Attach books to author
        }

        const sortedAuthors = Object.values(authorCounts).sort((a, b) => b.count - a.count);

        res.status(200).json(sortedAuthors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};*/


exports.getAuthorsOfTheWeek = async (req, res) => {
    try {
        const user = req.user; // Assumes you get the user's state from JWT
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        console.log("Fetching orders from:", sevenDaysAgo, "for state:", user.state);

        // 1. Find books in the user's state
        const booksInState = await Book.find({ state: user.state }).select('_id author');

        const bookIds = booksInState.map(book => book._id);
        const bookAuthorsMap = {};
        booksInState.forEach(book => {
            bookAuthorsMap[book._id.toString()] = book.author; // Save authors by book ID
        });

        // 2. Find orders from the last 7 days that contain those books
        const orders = await Order.find({
            createdAt: { $gte: sevenDaysAgo },
            productIds: { $in: bookIds }
        }).populate({
            path: 'productIds',
            select: 'author'
        });

        const authorCounts = {};

        // 3. Count appearances of authors
        orders.forEach(order => {
            order.productIds.forEach(book => {
                const authors = book.author;
                if (Array.isArray(authors)) {
                    authors.forEach(author => {
                        const key = author.name;

                        if (!authorCounts[key]) {
                            authorCounts[key] = {
                                name: author.name,
                                bio: author.bio,
                                authorImage: author.authorImage,
                                count: 0,
                                books: []
                            };
                        }
                        authorCounts[key].count++;
                    });
                }
            });
        });

        // 4. Attach books written by each author (in the same state)
        for (const authorKey in authorCounts) {
            const books = await Book.find({
                "author.name": authorCounts[authorKey].name,
                state: user.state
            }).select("title image description");

            authorCounts[authorKey].books = books;
        }

        const sortedAuthors = Object.values(authorCounts).sort((a, b) => b.count - a.count);

        res.status(200).json(sortedAuthors);
    } catch (error) {
        console.error("Error in getAuthorsOfTheWeek:", error);
        res.status(500).json({ message: error.message });
    }
};


exports.deleteBook = async (req, res) => {
    try {
        const admin = req.user; // Get admin from JWT
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Ensure only the original admin who posted the book can delete it
        if (book.adminId.toString() !== admin._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this book." });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getPlatformStatistics = async (req, res) => {
    try {
      const admin = req.user; // From JWT
      const state = admin.state;
  
      // Books
      const totalBooks = await Book.countDocuments({ state });
      const popularBooks = await Book.countDocuments({ state, $or: [{ isPopular: true }, { averageRating: { $gte: 4 } }] });
      const recommendedBooks = await Book.countDocuments({ 
        state, 
        $or: [{ isRecommended: true }, { averageRating: { $gte: 3 } }]
      });
      
      const yearBooks = await Book.countDocuments({ state, isYearBook: true });
  
      const avgRatingResult = await Book.aggregate([
        { $match: { state } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$averageRating" }
          }
        }
      ]);
      const averageRating = avgRatingResult[0]?.avgRating || 0;
  
      // Orders
      const orders = await Order.find({ state });
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
      const statusBreakdown = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      const recentOrders = await Order.find({ state })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('userId', 'username image');

  
      // Users
      const usersInState = await User.countDocuments({ state });
      const adminsInState = await Admin.countDocuments({ state });
  
      // Newsletters
      const newsletterData = await getSubscribersByState(state);
  
      res.json({
        books: {
          total: totalBooks,
          popular: popularBooks,
          recommended: recommendedBooks,
          yearBooks: yearBooks,
          averageRating: averageRating.toFixed(2),
        },
        orders: {
          total: totalOrders,
          revenue: totalRevenue.toFixed(2),
          statusBreakdown,
          recentOrders,
        },
        users: {
          total: usersInState,
          admins: adminsInState,
        },
        newsletter: {
            totalSubscribers: newsletterData.total,
            emails: newsletterData.subscribers.map(s => s.email),
          }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error getting aggregated data", error: error.message });
    }
  };