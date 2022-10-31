const { INTEGER } = require("sequelize")
const { Op } = require("sequelize")
const db = require("../models")

module.exports = {
    createExpense: async (req, res) => {
        try {
            const { amount, categoryId, userId } = req.body

            const { id } = req.res
            // const currency = new Intl.NumberFormat("id-ID", {
            //     style: "currency",
            //     currency: "IDR",
            // })
            const today = new Date()

            await db.Expense.create({
                // amount: currency.format(amount),
                amount: amount,
                CategoryId: categoryId,
                UserId: id,
                day: today.getDate(),
                month: today.getMonth() + 1,
                year: today.getFullYear(),
            })

            return res.status(201).json({
                message: "Created expense"
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error"
            })
        }
    },
    getAllExpenses: async (req, res) => {
        try {
            const findAllExpenses = await db.Expense.findAll()

            return res.status(200).json({
                message: "Get all expenses",
                data: findAllExpenses
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error"
            })
        }
    },
    editExpensesById: async (req, res) => {
        try {
            const { id } = req.params

            await db.Expense.update(req.body, {
                where: {
                    id: id
                }
            })

            return res.status(200).json({
                message: "Updated user",
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    deleteExpenseById: async (req, res) => {
        try {
            const { id } = req.params
            await db.Expense.destroy({
                where: {
                    id: id
                }
            })

            return res.status(200).json({
                message: "Deleted expense",
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    getTotalExpenses: async (req, res) => {
        try {
            const { group, fromDate, toDate } = req.query

            if (group === "category") {
                const getTotalExpensesByCategory = await db.Expense.findAll({
                    attributes: [
                        [db.sequelize.fn("sum", db.sequelize.col("amount")), "sum_amount"],
                        "Category.category_name",
                    ],
                    include: [{ model: db.Category }],
                    group: "CategoryId",
                })

                // const getTotalExpensesByCategory = await db.sequelize.query(
                //     `SELECT SUM(amount) AS sum_amount, c.category_name FROM expenses e
                //     JOIN categories c ON e.CategoryId = c.id
                //     GROUP BY e.CategoryId`
                // )



                return res.status(200).json({
                    message: "Get total expenses by category",
                    data: getTotalExpensesByCategory,
                })
            }

            if (group === "day" || group === "month" || group === "year") {

                const getTotalExpensesByTimesPeriod = await db.Expense.findAll({
                    attributes: [
                        [db.sequelize.fn("sum", db.sequelize.col("amount")), "sum_amount"],
                        group,
                    ],
                    group: group,
                    order: [
                        [group, "ASC"]
                    ]
                })

                return res.status(200).json({
                    message: "Get total expenses by " + group,
                    data: getTotalExpensesByTimesPeriod,
                })

            }

            if (!group && fromDate && toDate) {
                const getTotalExpensesByDateRange = await db.Expense.findAll({
                    where: {
                        createdAt: {
                            [Op.between]: [fromDate, toDate],
                        },
                    },
                    attributes: [
                        [db.sequelize.fn("sum", db.sequelize.col("amount")), "sum_amount"],
                    ],
                })

                return res.status(200).json({
                    message: "Get total expenses by date range",
                    data: getTotalExpensesByDateRange
                })
            }

            return res.status(400).json({
                message: "Missing group, fromDate, or toDate parameters",
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error"
            })
        }
    },
    getAllMyExpenses: async (req, res) => {
        try {
            const findMyExpensesByUserId = await db.Expense.findAll({
                where: {
                    userId: req.user.id
                }
            })

            return res.status(200).json({
                message: "Get all my expenses",
                data: findMyExpensesByUserId
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error"
            })
        }
    }
}