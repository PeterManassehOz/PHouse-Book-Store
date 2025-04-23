const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: [
        {
            name: { type: String, required: true },
            authorImage: { type: String, required: true },
            bio: { type: String, required: true }
        }
    ],
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    quantity: { type: Number, required: true },
    ratings: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, required: true, min: 1, max: 5 }
        }
    ],
    averageRating: { type: Number, default: 0 }, // Store the average rating
    state: { type: String, required: true },  // Matches admin's state
    isPopular: { type: Boolean, default: false },  // Add isPopular field
    isRecommended: { type: Boolean, default: false }, // Add isRecommended field
    isYearBook: { type: Boolean, default: false },
    lastCheckedYear: { type: Number, default: new Date().getFullYear() }, // Track last year check
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

// Pre-save hook to recalculate averageRating and update isPopular
bookSchema.pre('save', function (next) {
    if (this.ratings.length > 0) {
        const totalRatings = this.ratings.reduce((sum, r) => sum + r.rating, 0);
        this.averageRating = totalRatings / this.ratings.length;
    } else {
        this.averageRating = 0;
    }

    // Only auto-set isPopular if it's not explicitly set (i.e., not true or false)
    if (this.isPopular === undefined || this.isPopular === null) {
        this.isPopular = this.averageRating >= 4;
    }

    // Same for isRecommended
    if (this.isRecommended === undefined || this.isRecommended === null) {
        this.isRecommended = this.averageRating >= 3;
    }

    next();
});



// Static method to update yearly books at the end of the year
bookSchema.statics.updateYearlyBooks = async function () {
    const currentYear = new Date().getFullYear();

    // Update all books that haven't been checked this year
    await this.updateMany(
        { lastCheckedYear: { $lt: currentYear }, averageRating: { $gte: 4.5 } },
        { 
            $set: { isYearBook: true, lastCheckedYear: currentYear } 
        }
    );
};




module.exports = mongoose.model('Book', bookSchema);
