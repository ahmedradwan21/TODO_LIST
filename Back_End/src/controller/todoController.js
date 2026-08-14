const todoService = require("../services/todoService");

exports.createTodo = async (req, res, next) => {
	try {
		const newTodo = await todoService.createTodo(req.userId, req.body);
		res.status(201).json({
			success: true,
			message: "Todo created successfully",
			data: newTodo,
		});
	} catch (error) {
		next(error);
	}
};

exports.getProjects = async (req, res, next) => {
	try {
		const projects = await todoService.getProjects(req.userId);
		res.status(200).json({
			success: true,
			message: "Projects retrieved successfully",
			data: projects,
		});
	} catch (error) {
		next(error);
	}
};

exports.deleteTodo = async (req, res, next) => {
	try {
		await todoService.deleteTodo(req.userId, req.params.id);
		res.status(200).json({
			success: true,
			message: "Todo deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};

exports.updateTodo = async (req, res, next) => {
	try {
		const updated = await todoService.updateTodo(
			req.userId,
			req.params.id,
			req.body,
		);
		res.status(200).json({
			success: true,
			message: "Todo updated successfully",
			data: updated,
		});
	} catch (error) {
		next(error);
	}
};

exports.getTodos = async (req, res, next) => {
	try {
		const todos = await todoService.getTodos(req.userId, req.query);
		res.status(200).json({
			success: true,
			count: todos.length,
			message: "Todos retrieved successfully",
			data: todos,
		});
	} catch (error) {
		next(error);
	}
};
