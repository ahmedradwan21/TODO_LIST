const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    console.log('next is a:', typeof next); // يجب أن يطبع 'function'
	let error = { ...err };
	error.message = err.message;
	logger.error(
		`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`,
	);
	if (err.code === 11000) {
		const field = Object.keys(err.keyPattern)[0];
		const value = err.keyValue[field];
		const message = `القيمة '${value}' موجودة بالفعل في حقل ${field}`;
		error = new AppError(message, 400);
	}
	if (err.name === "CastError") {
		const message = `معرف غير صحيح: ${err.value}`;
		error = new AppError(message, 404);
	}
	if (err.name === "ValidationError") {
		const messages = Object.values(err.errors).map((e) => e.message);
		error = new AppError(messages.join(". "), 400);
	}
	res.status(error.statusCode || 500).json({
		success: false,
		message: error.message || "حدث خطأ داخلي في السيرفر",
		...(process.env.NODE_ENV === "development" && {
			stack: err.stack,
			error: err,
		}),
	});
};

module.exports = errorHandler;
