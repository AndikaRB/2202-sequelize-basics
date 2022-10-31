const express = require("express")
const commentsController = require("../controllers/commentsController")
const { verifyToken } = require("../middlewares/authMiddleware")


const router = express.Router()

router.post("/", verifyToken, commentsController.postCommentByUserId)
router.get("/", commentsController.getAllCommentsByPostId)
module.exports = router