const authService = require("../services/authService");

exports.register = async (req, res, next) => {
	console.log("🔍 req.body:", req.body);
	try {
		console.log("🟢 2. before authService.register");
		const { username, email, password } = req.body;
		const newUser = await authService.register(username, email, password);
		console.log("🟢 3. after authService.register, newUser:", newUser);
		res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: newUser,
		});
		console.log("🟢 4. response sent");
	} catch (error) {
		console.log("🔴 5. catch block, error:", error.message);
		console.log("🔴 6. typeof next in catch:", typeof next);
		next(error);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const result = await authService.login(email, password);
		res.status(200).json({
			success: true,
			message: "User logged in successfully",
			data: {
				token: result.token,
				username: result.username,
			},
		});
	} catch (error) {
		next(error);
	}
};
