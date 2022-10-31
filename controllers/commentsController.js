const db = require("../models")

const commentsController = {
    postCommentByUserId: async (req, res) => {
        try {
            // const { PostId } = req.params
            const { comment, postId } = req.body
            const postNewComment = await db.Comment.create({
                comment: comment,
                UserId: req.user.id,
                PostId: postId,
            })
            return res.status(200).json({
                message: "comment sudah ke post ya",
                data: postNewComment,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    getAllCommentsByPostId: async (req, res) => {
        try {
            const { postId } = req.query
            const findAllComments = await db.Comment.findAll({
                include: [{ model: db.User }, { model: db.Post }],
                where: {
                    PostId: postId
                }
            })

            return res.status(200).json({
                message: "shows all comments",
                data: findAllComments,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    }
    // getAllComments: async (req, res) => {
    //     try {
    //         const findAllComments = a
    //     } catch (err) {
    //         console.log(err)
    //         return res.status(500).json({
    //             message: "Server error",
    //         })
    //     }
    // }
}

module.exports = commentsController