const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//Middlewares:

//set security headers
app.use(helmet());

//logging requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit 100 hits from one ip in one hour, only for /api requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

//body parser, reading data from body to req.body, limit body to 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//data sanitization against NoSQL injections
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

//prevent parameter polution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsAverage',
    'difficulty',
    'maxGroupSize',
    'price',
    'ratingsQuantity'
  ]
}));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
//   console.log('Hello from middleware 👍');
//   next();
// });

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});


//Routes:

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter);

//Error handling:

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  //if next has argument, then assumed it's an error 
});

app.use(globalErrorHandler);

module.exports = app;
