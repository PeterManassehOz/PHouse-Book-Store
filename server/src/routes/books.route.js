const express = require('express');
const { getAllBooks, getBookById, createBook, updateBook, deleteBook, getAllPopularBooks, getAllRecommendedBooks, getAllYearBooks, getAuthorsOfTheWeek, getPlatformStatistics } = require('../controllers/books.controller');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { adminProtect } = require('../middleware/adminProtect');
const upload = require('../middleware/bookUploadMiddleware');
const { rateBook, getBookRating } = require('../controllers/rateBook.controller');
const { protect } = require('../middleware/authMiddleware');
const { userAdminAuth } = require('../middleware/userAdminAuth');

const router = express.Router();

router.get("/stats", adminAuthMiddleware, adminProtect, getPlatformStatistics); // ✅ Fetch platform statistics

router.get('/popular', protect, getAllPopularBooks);  // Fetch only popular books

router.get('/recommended', protect, getAllRecommendedBooks); // Fetch only recommended books

router.get('/year-book', protect, getAllYearBooks);

router.post('/', adminAuthMiddleware, adminProtect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'authorImage', maxCount: 1 }]), createBook);


router.get('/authors', protect, getAuthorsOfTheWeek);


router.get('/', userAdminAuth, getAllBooks);
router.get('/:id', userAdminAuth, getBookById);

router.put('/:id', adminAuthMiddleware, adminProtect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'authorImage', maxCount: 1 }]), updateBook);

router.delete('/:id', adminAuthMiddleware, adminProtect, deleteBook);

router.post('/:bookId/rate', protect, rateBook); // Users can rate books

// GET  /books/:bookId/rating
router.get('/:bookId/rating', protect, getBookRating);



module.exports = router;