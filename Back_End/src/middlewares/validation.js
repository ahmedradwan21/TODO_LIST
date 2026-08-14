const { body, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const firstError = errors.array()[0];
		return next(new AppError(firstError.msg, 400));
	}
	next();
};

exports.validateLogin = [
	body("email")
		.notEmpty()
		.withMessage("Email is required")
		.isEmail()
		.withMessage("Invalid email format"),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),
	handleValidationErrors,
];

exports.validateRegister = [
	body("username")
		.isLength({ min: 3 })
		.withMessage("Username must be at least 3 characters long")
		.notEmpty()
		.withMessage("Username is required"),
	body("email")
		.isEmail()
		.withMessage("Invalid email format")
		.notEmpty()
		.withMessage("Email is required"),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long")
		.notEmpty()
		.withMessage("Password is required"),
	handleValidationErrors,
];

exports.validateTodo = [
	body("text")
		.isString()
		.withMessage("the task must be a string")
		.trim()
		.isLength({ min: 1, max: 200 })
		.withMessage("the task must be between 1 and 200 characters"),
	body("project")
		.optional()
		.isString()
		.withMessage("the project must be a string")
		.trim(),
	body("dueDate")
		.optional({ checkFalsy: true })
		.isISO8601()
		.withMessage("the date is in an invalid format")
		.toDate(),
	body("priority")
		.optional()
		.isIn(["عالية", "متوسطة", "منخفضة"])
		.withMessage("the priority is invalid"),
	handleValidationErrors,
];
