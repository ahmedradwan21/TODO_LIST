const Todo = require("../models/Todo");
const AppError = require("../utils/AppError");

exports.getTodos = async (userId, queryParams) => {
	const filter = { user: userId };

	if (queryParams.project && queryParams.project !== "all") {
		filter.project = queryParams.project;
	}
	if (queryParams.done !== undefined) {
		filter.done = queryParams.done === "true";
	}
	if (queryParams.priority) {
		filter.priority = queryParams.priority;
	}
	if (queryParams.search) {
		filter.text = { $regex: queryParams.search, $options: "i" };
	}

	let query = Todo.find(filter);
	if (queryParams.sort === "dueDate") {
		query = query.sort({ dueDate: 1 });
	} else if (queryParams.sort === "priority") {
		query = query.sort({ priority: -1 });
	} else {
		query = query.sort({ createdAt: -1 });
	}
	return await query;
};

exports.createTodo = async (userId, data) => {
	const pendingCount = await Todo.countDocuments({ user: userId, done: false });
	if (pendingCount >= 30) {
		throw new AppError("no more than 30 pending todos are allowed", 400);
	}

	const todo = new Todo({ ...data, user: userId });
	await todo.save();
	return todo;
};

exports.updateTodo = async (userId, todoId, updatedata) => {
	const todo = await Todo.findOneAndUpdate(
		{ _id: todoId, user: userId },
		updatedata,
		{ new: true, runValidators: true },
	);
	if (!todo) {
		throw new AppError("اthis todo does not exist or you do not have permission to delete it", 404);
	}
	return todo;
};

exports.deleteTodo = async (userId, todoId) => {
	const todo = await Todo.findOneAndDelete({ _id: todoId, user: userId });
	if (!todo) {
		throw new AppError(
			"this todo does not exist or you do not have permission to delete it",
			404,
		);
	}
	return todo;
};

exports.getProjects = async (userId) => {
	const projects = await Todo.distinct("project", { user: userId });
	return [...projects, "General"];
};

