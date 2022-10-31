const express = require("express")
const { firstController } = require("../controllers/postsController")
const postsController = require("../controllers/postsController")
const { upload } = require("../lib/uploader")
const { verifyToken } = require("../middlewares/authMiddleware")
const { route } = require("./authRoute")
const router = express.Router()

router.post(
    "/",
    verifyToken,
    upload({
        acceptedFileTypes: ["png", "jpeg", "jpg"],
        filePrefix: "POST",
    }).single("post_image"),
    postsController.createPost
)
router.post("/", verifyToken, postsController.createPost)
router.get("/", postsController.getAllPosts)
router.get("/me", verifyToken, postsController.getAllMyPosts)
router.get("/username", postsController.getPostsByUsername)
router.delete("/:id", postsController.deletePostByUserId)
// router.post(
//     "/upload",
//     upload({
//         acceptedFileTypes: ["png", "jpeg", "jpg"],
//         filePrefix: "GAMBAR",
//     }).single("post_image"),
//     (req, res) => {
//         res.status(200).json({
//             message: "Uploaded file",
//         })
//     }
// )
module.exports = router

