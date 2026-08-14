const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		text: { type: String, required: true },
		done: { type: Boolean, default: false },
		project: { type: String, default: "General", trim: true },
		dueData: { type: Date, default: null },
		priority: {
			type: String,
			enum: ["عالية", "متوسطة", "منخفضة"],
			default: "متوسطة",
		},
	},
	{ timestamps: true },
);
module.exports = mongoose.model("Todo", TodoSchema);
