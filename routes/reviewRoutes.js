const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { getAllReviews, createReview, deleteReview, updateReview, setTourUserIds, getReview } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getAllReviews)
    .post(protect, restrictTo('user'), setTourUserIds, createReview);

router
    .use(protect)
    .route('/:id')
    .get(getReview)
    .patch(restrictTo('admin', 'user'), updateReview)
    .delete(restrictTo('admin', 'user'), deleteReview);

module.exports = router;