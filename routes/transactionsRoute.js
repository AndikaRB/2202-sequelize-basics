const express = require("express")
const transactionsController = require("../controllers/transactionsController")
const { upload } = require("../lib/uploader")

const router = express.Router()

router.post(
    "/",
    upload({
        filePrefix: "PAY",
        acceptedFileTypes: ["jpeg", "jpg", "png"],
    }).single("payment_proof"),
    transactionsController.createNewTransaction)
router.patch("/status/:id", transactionsController.setStatusPayment)
module.exports = router