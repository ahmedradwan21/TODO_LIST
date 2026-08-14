const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

exports.register = async (username, email, password) => {
	try {
		const user = await User.create({ username, email, password });
		return {
			id: user._id,
			username: user.username,
			email: user.email,
		};
	} catch (error) {
		throw error;
	}
};

exports.login = async (email, password) => {
	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		throw new AppError("Invalid email or password", 401);
	}
	const isPasswordValid = await user.comparePassword(password);
	if (!isPasswordValid) {
		throw new AppError("Invalid email or password", 401);
	}
	const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
	return {
		token,
		username: user.username,
	};
};
