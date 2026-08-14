const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "name is required"],
			unique: true,
			trim: true,
			minlength: [3, "name must be at least 3 characters long"],
		},
		email: {
			type: String,
			required: [true, "email is required"],
			unique: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "invalid email format"],
		},
		password: {
			type: String,
			required: [true, "password is required"],
			minlength: [6, "password must be at least 6 characters long"],
			select: false,
		},
	},
	{ timestamps: true },
);

UserSchema.pre("save", async function () {
	console.log("🔵 PRE-SAVE HOOK CALLED (no next)");

	if (!this.isModified("password")) {
		console.log("🔵 Password not modified, skipping");
		return;
	}

	console.log("🔵 Hashing password...");
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	console.log("🔵 Password hashed successfully");
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
