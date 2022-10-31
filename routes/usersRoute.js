const express = require("express")
const usersController = require("../controllers/usersController")
const { upload } = require("../lib/uploader")
const { verifyToken } = require("../middlewares/authMiddleware")

const router = express.Router()

router.get("/", usersController.getAllUsers)
router.get("/:id", usersController.getUserById)
router.post("/", usersController.createNewUser)
router.patch("/:id", usersController.editUserById)
router.delete("/:id", usersController.deleteUserById)
router.post("/register", usersController.registerUser)
router.post("/login", usersController.loginUser)
router.get("/profile/:id", usersController.getUserProfileByUserId)
router.post("/profile", usersController.createUserProfile)
router.patch("/profile/:id", usersController.editUserProfile)

module.exports = router