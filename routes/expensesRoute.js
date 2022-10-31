const express = require('express')
const { verifyToken } = require("../middlewares/authMiddleware")
const expensesController = require('../controllers/expensesController')

const router = express.Router()

router.post("/", expensesController.createExpense)
router.get("/", expensesController.getAllExpenses)
router.get("/total", expensesController.getTotalExpenses)
// router.get("/:id", expensesController.editExpensesById)
router.delete("/:id", expensesController.deleteExpenseById)
router.get("/me", verifyToken, expensesController.getAllMyExpenses)

module.exports = router