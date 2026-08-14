require("dotenv").config(); // this line make
const mongoose = require("mongoose");

const app = require("./src/app");

const startServer = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("✅ successfully connected to MongoDB");
		const PORT = process.env.PORT || 5000;
		app.listen(PORT, () => {
			console.log(`🚀 server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("❌ error connecting to MongoDB:", error);
		process.exit(1);
	}
};

startServer();


