const express = require("express")
const db = require("../models")
const ticket = require("../models/ticket")
const fs = require("fs")
const handlebars = require("handlebars")
const emailer = require("../lib/emailer")
const moment = require("moment")

const { TransactionItem, Transaction, Ticket, User } = db

const transactionsController = {
    createNewTransaction: async (req, res) => {
        try {
            let { items } = req.body

            items = JSON.parse(items)

            const transactionItemIds = items.map((val) => val.ticket_id)

            const findTickets = await Ticket.findAll({
                where: {
                    id: transactionItemIds
                }
            })

            let totalPrice = 0

            const transactionItems = findTickets.map((ticket) => {
                const qty = items.find((item) => item.ticket_id === ticket.id).quantity

                totalPrice += ticket.price * qty

                return {
                    TicketId: ticket.id,
                    price_per_pcs: ticket.price,
                    quantity: qty,
                    total_price: ticket.price * qty,
                }
            })

            const payment_proof = `http://localhost:2000/public/${req.file.filename}`

            const createTransaction = await Transaction.create({
                total_price: totalPrice,
                UserId: req.user.id,
                payment_proof: payment_proof,
            })

            await TransactionItem.bulkCreate(
                transactionItems.map((item) => {
                    return {
                        ...item,
                        TransactionId: createTransaction.id,
                    }
                })
            )

            return res.status(201).json({
                message: "Transaction created",
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    setStatusPayment: async (req, res) => {
        try {
            const { status } = req.body
            const { id } = req.params

            if (status !== "accepted" && status !== "rejected") {
                return res.status(400).json({
                    message: "invalid status for transaction",
                })
            }

            const findUser = await User.findByPk(req.user.id);

            if (!findUser.is_admin) {
                return res.status(401).json({
                    message: "User unauthorized"
                })
            }

            if (status === "accepted") {
                const invoiceDate = moment().format("DD MMMM YYYY")

                const findTransactionById = await Transaction.findByPk(id, {
                    include: [
                        { model: User }
                    ]
                })

                const findTransactionItems = await TransactionItem.findAll({
                    where: {
                        TransactionId: id
                    },
                    include: [
                        { model: Ticket }
                    ]
                })

                const transactionItems = findTransactionItems.map((item) => {
                    return {
                        event_name: item.Ticket.event_name,
                        quantity: item.quantity,
                        total_price: item.total_price.toLocaleString()
                    }
                })

                // Kirim email "verifikasi"
                const rawHTML = fs.readFileSync("templates/invoice.html", "utf-8")
                const compiledHTML = handlebars.compile(rawHTML)
                const resultHTML = compiledHTML({
                    invoiceDate,
                    grandTotal: findTransactionById.total_price.toLocaleString(),
                    transactionItems
                })

                await emailer({
                    to: findTransactionById.User.email,
                    html: resultHTML,
                    subject: "Ticketing Invoice",
                    text: "Your invoice"
                })
            }

            await Transaction.update(
                {
                    status,
                },
                {
                    where: {
                        id,
                    },
                }
            )

            return res.status(200).json({
                message: `${status} transaction`,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    }
}

module.exports = transactionsController
