const AppError = require('../utils/appError');

const handleJWTError = err => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = err => new AppError('Your token has expired. Please log in again!', 401);

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const val = err.message.match(/"(.*?)"/)[0];
    const message = `Duplicate field value: ${val}. Please enter another value.`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(x => x.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        })
    }

    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
}

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })


        }
        // Programming or other unknown error, don't leak details to client
        console.error("ERROR 💥", err);

        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }

    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
    }

    console.error("ERROR 💥", err);

    res.status(500).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later'
    })
}

module.exports = (err, req, res, next) => {
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err, message: err.message };
        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
        sendErrorProd(error, req, res);
    }
}