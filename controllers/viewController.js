const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour
        .findOne({ slug: req.params.slug })
        .populate({ path: 'reviews', select: 'review rating user' });

    if (!tour) return next(new AppError('There is no tour with such name', 404));

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log Into Your Account'
    })
}

exports.getAccount = (req, res, next) => {
    res.status(200).render('account', {
        title: 'Your Account'
    })
}

exports.getMyTours = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user.id });
    const tours = await Tour.find({ _id: { $in: bookings.map(x => x.tour) } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
});

// exports.updateUserData = async (req, res, next) => {
//     const { name, email } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(
//         req.user.id,
//         {
//             ...(name && { name }),
//             ...(email && { email })
//         },
//         {
//             new: true,
//             runValidators: true
//         });

//     res.status(200).render('account', {
//         title: 'Your account',
//         user: updatedUser
//     });
// }