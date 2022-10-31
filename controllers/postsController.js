const db = require("../models")

Post = db.Post

const postsController = {
    createPost: async (req, res) => {
        try {
            const { body } = req.body

            const image_url = `http://localhost:2000/public/${req.file.filename}`

            const createdPost = await Post.create({
                body,
                image_url: image_url,
                UserId: req.user.id,
            })

            return res.status(201).json({
                message: "Post created",
                data: createdPost
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    getAllPosts: async (req, res) => {
        try {
            const { _limit = 2, _page = 10, _sortDir = "DESC" } = req.query

            const findAllPosts = await Post.findAndCountAll({
                include: [{ model: db.User }],
                limit: Number(_limit),
                offset: (_page - 1) * _limit,
                order: [
                    ["createdAt", "Desc"]
                    // ["createdAt", _sortDir]
                ]
            })

            return res.status(200).json({
                message: "Get all posts",
                data: findAllPosts.rows,
                dataCount: findAllPosts.count
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    deletePostByUserId: async (req, res) => {
        try {
            await Post.destroy({
                where: {
                    id: req.params.id
                }
            })

            return res.status(200).json({
                message: "Post Deleted"
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    getAllMyPosts: async (req, res) => {
        try {
            const FindMyPostByUserId = await Post.findAll({
                where: {
                    UserId: req.user.id
                },
                include: [{ model: db.User }],
                order: [
                    ["createdAt", "Desc"]
                ]
            })

            return res.status(200).json({
                message: "Get all my posts",
                data: FindMyPostByUserId,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    getPostsByUsername: async (req, res) => {
        try {
            const { username } = req.query


            const findPostByUsername = await Post.findAll({
                include: [{
                    model: db.User,
                    where: {
                        username: username
                    },
                }],
                order: [
                    ["createdAt", "Desc"]
                ]
            })

            // let findPostByUsername = await db.sequelize.query(
            //     `SELECT  p.id, body, username, image_url, p.createdAt, p.updatedAt, UserId FROM posts p
            //     JOIN users u
            //     ON p.UserId = u.id
            //     WHERE username = "${username}";`
            // )

            // findPostByUsername = findPostByUsername.toString().split(",")

            return res.status(200).json({
                message: "Get all posts",
                data: findPostByUsername,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    }
}

module.exports = postsController

