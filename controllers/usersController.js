const { Op } = require("sequelize")
const db = require("../models")

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const findAllUsers = await db.User.findAll({
                where: {
                    ...req.query,
                    username: {
                        [Op.like]: `%${req.query.username || ""}%`
                    },
                    // [Op.or]: {
                    //   username: req.query.username,
                    //   email: req.query.email
                    // }
                },
                attributes: {
                    exclude: ["id", "password"]
                },
                // include: [{ model: db.Profile }]
            })

            return res.status(200).json({
                message: "Find all users",
                data: findAllUsers,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    getUserById: async (req, res) => {
        try {
            const { id } = req.params
            const findUserById = await db.User.findByPk(id, {
                attributes: {
                    exclude: ["id", "password"]
                },
                include: [{ model: db.Profile }, { model: db.Expense }],
            })

            return res.status(200).json({
                message: "Get user by id",
                data: findUserById
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    createNewUser: async (req, res) => {
        try {
            const createUser = await db.User.create({ ...req.body })

            return res.status(201).json({
                message: "Created User",
                data: createUser
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    editUserById: async (req, res) => {
        try {
            const { id } = req.params

            const findUser = await db.User.findByPk(id)

            if (!findUser) {
                return res.status(400).json({
                    message: "User with ID not found"
                })
            }

            await db.User.update(req.body, {
                where: {
                    id: id
                },
            })

            return res.status(201).json({
                message: "Updated user",
                data: findUser,
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error"
            })
        }
    },
    deleteUserById: async (req, res) => {
        try {
            const { id } = req.params

            const findUserByIDs = await db.User.findByPk(id)

            if (!findUserByIDs) {
                return res.status(400).json({
                    message: "User with ID not found"
                })
            }

            await db.User.destroy({
                where: {
                    id: id
                }
            })

            return res.status(200).json({
                message: "User deleted"
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error"
            })
        }
    },
    registerUser: async (req, res) => {
        try {
            const { username, email, password, passwordConfirm } = req.body

            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password needs more than 8 character"
                })
            }

            if (password !== passwordConfirm) {
                return res.status(400).json({
                    message: "Password does not match"
                })
            }

            const findUserByUsernameOrEmail = await db.User.findOne({
                where: {
                    [Op.or]: {
                        username: username,
                        email: email,
                    }
                }
            })

            if (findUserByUsernameOrEmail) {
                return res.status(400).json({
                    message: "username or email has been taken"
                })
            }

            const createNewUser = await db.User.create({
                username: username,
                email: email,
                password: password
            })

            return res.status(201).json({
                message: "User registered",
                data: createNewUser
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error"
            })
        }
    },
    loginUser: async (req, res) => {
        try {
            const { username, password } = req.body

            const findUserByUsername = await db.User.findOne({
                where: {
                    username: username,
                }
            })

            if (!findUserByUsername) {
                return res.status(400).json({
                    message: "Username not found"
                })
            }

            if (findUserByUsername.password !== password) {
                findUserByUsername.login_attempts += 1
                findUserByUsername.save()

                if (findUserByUsername.login_attempts > 2) {
                    findUserByUsername.is_suspended = true
                    findUserByUsername.save()
                }

                return res.status(400).json(
                    findUserByUsername.login_attempts > 2 ?
                        { message: "Wrong password, your account has been suspended" }
                        : { message: "Wrong password, try again" }
                )
            }

            findUserByUsername.login_attempts = 0
            findUserByUsername.is_suspended = false
            findUserByUsername.save()

            return res.status(200).json({
                message: "Login successful",
                data: findUserByUsername
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error"
            })
        }
    },
    createUserProfile: async (req, res) => {
        try {
            const { gender, birthdate, occupation, userId } = req.body
            const createProfile = await db.Profile.create({
                gender: gender,
                birthdate: birthdate,
                occupation: occupation,
                UserId: userId
            })
            return res.status(201).json({
                message: "Created profile",
                data: createProfile,
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    getUserProfileByUserId: async (req, res) => {
        try {
            const { id } = req.params

            const findProfileByUserId = await db.Profile.findOne({
                where: {
                    userId: id
                },
                include: [{ model: db.User }],
                attributes: {
                    exclude: ["id", "UserId", "createdAt", "updatedAt"]
                }
            })

            return res.status(200).json({
                message: "Find profile by userId",
                data: findProfileByUserId,
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    editUserProfile: async (req, res) => {
        try {
            const { id } = req.params

            await db.Profile.update({
                gender: req.body.gender,
                birthdate: req.body.birthdate,
                occupation: req.body.occupation,
            }, {
                where: {
                    userId: id
                },
            })

            return res.status(200).json({
                message: "Updated profile",
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
}