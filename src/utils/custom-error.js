export class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperation = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
