const express = require("express");

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rareLimit = require("express-rate-limit");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const todoRoutes = require("./routes/todo.router");

const errorHandler = require("./middlewares/errorHandler");

const AppError = require("./utils/AppError");

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

const limiter = rareLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

app.use(cors());
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

app.use((req, res, next) => {
	res.status(404).json({
		success: false,
		message: `Can't find ${req.originalUrl} on this server!`,
	});
});

app.use(errorHandler);

module.exports = app;
