const express = require('express');
const {getReviews, getReview, AddReview, updateReview, deleteReview} = require('../controllers/reviewsController');
const Review = require('../models/Review');
const advancedResultsMiddleware = require('../middlewares/advancedResultsMiddleware');
const {protect, authorize} = require('../middlewares/authMiddleware');

const router = express.Router({mergeParams: true});


router.route('/').get(advancedResultsMiddleware(Review, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews).post(protect, authorize('user', 'admin'), AddReview)
router.route('/:id').get(getReview).put(protect, authorize("user", "admin"), updateReview).delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;