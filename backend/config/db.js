const mongoose = require("mongoose");

async function connectDB() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		throw new Error("MONGO_URI is not set");
	}

	try {
		await mongoose.connect(uri);
		console.log("MongoDB connected");
	} catch (err) {
		console.log("DB error:", err);
		throw err;
	}
}

module.exports = connectDB;
