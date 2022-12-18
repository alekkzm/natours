const express = require('express');
const { isLoggedIn, protect } = require('../controllers/authController');
//const { createBookingCheckout } = require('../controllers/bookingController');
const { getOverview, getTour, getLoginForm, getAccount, updateUserData, getMyTours, alerts } = require('../controllers/viewController');

const router = express.Router();

router.use(alerts);

router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);
// router.post('/submit-user-data', protect, updateUserData);

//router.get('/', createBookingCheckout, isLoggedIn, getOverview);

router.use(isLoggedIn); //using to render header's buttons
router.get('/', getOverview);
router.get('/tours/:slug', getTour);
router.get('/login', getLoginForm);


module.exports = router;

