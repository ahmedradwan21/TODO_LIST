const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
	console.log('next is a:', typeof next); // يجب أن يطبع 'function'
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return next(
			new AppError("you are not logged in! Please log in to get access.", 401),
		);
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		req.userId = decoded.userId;

		next();
	} catch (error) {
		return next(new AppError("Invalid token. Please log in again.", 401));
	}
};
