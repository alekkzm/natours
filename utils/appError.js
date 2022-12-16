class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.isOperational = true;

        /* Similar to `new Error().stack` */
        /* Наверное полезно если ошибка не генерит stack 
        + 2ой аргумент (this.constructor) убирает вернюю строку из stack? */
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;