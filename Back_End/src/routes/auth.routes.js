const router = require("express").Router();
const authController = require("../controller/authController");
const {
	validateRegister,
	validateLogin,
} = require("../middlewares/validation");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

module.exports = router;
