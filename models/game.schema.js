const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const ratingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
});

const gameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    description: { type: String, required: true },
    downloadLink: { type: String, required: true },
    coverImage: { type: String, required: true }, // Path to the cover image
    gameImages: [{ type: String }], // Array of paths to gallery images
    comments: [commentSchema],
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// Calculate average rating before saving
gameSchema.pre('save', function(next) {
    if (this.ratings.length > 0) {
        const totalRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        this.averageRating = totalRating / this.ratings.length;
    } else {
        this.averageRating = 0;
    }
    next();
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;