const router = require("express").Router();
const todoController = require("../controller/todoController");
const auth = require("../middlewares/auth");
const { validateTodo } = require("../middlewares/validation");

router.get("/", auth, todoController.getTodos);
router.get("/projects", auth, todoController.getProjects);
router.post("/", auth, validateTodo, todoController.createTodo);
router.put("/:id", auth, validateTodo, todoController.updateTodo);
router.delete("/:id", auth, todoController.deleteTodo);

module.exports = router;
