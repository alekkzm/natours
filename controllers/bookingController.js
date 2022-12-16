const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
                    },
                    unit_amount: tour.price * 100,
                    currency: 'usd'
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        client_reference_id: req.params.tourId,
        customer_email: req.user.email,
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${host}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${host}/tour/${tour.slug}`,
    });

    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    //Temporary, Unsecure
    const { tour, user, price } = req.query;
    if (!tour || !user || !price) return next();
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = factory.getAll(Booking)
exports.getBooking = factory.getOne(Booking)
exports.createBooking = factory.createOne(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)