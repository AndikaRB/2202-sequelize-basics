const { Op } = require("sequelize")
const db = require("../models")
const bcrypt = require("bcrypt")
const { signToken } = require("../lib/jwt")
const { validationResult } = require("express-validator")
const { validateVerificationToken, createVerificationToken } = require("../lib/verification")
const user = require("../models/user")
const fs = require("fs")
const handlebars = require("handlebars")
const emailer = require("../lib/emailer")

const User = db.User

const authController = {
    registerUser: async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Invalid fields"
                })
            }

            const { username, email, password, role } = req.body

            const findUserByUsernameOrEmail = await User.findOne({
                where: {
                    [Op.or]: {
                        username,
                        email,
                    },
                },
            })

            if (findUserByUsernameOrEmail) {
                return res.status(400).json({
                    message: "Username or email has been used",
                })
            }

            const hashedPassword = bcrypt.hashSync(password, 5)

            const newUser = await User.create({
                username,
                email,
                password: hashedPassword,
                role,
            })

            const verification_token = createVerificationToken({
                id: newUser.id
            })
            const verificationLink =
                `http://localhost:2000/auth/verification?verification_token=${verification_token}`

            //kirim email verifikasi
            const rawHTML = fs.readFileSync("templates/register_user.html", "utf-8")
            const compiledHTML = handlebars.compile(rawHTML)
            const htmlResult = compiledHTML({
                username,
                verificationLink
            })

            await emailer({
                to: email,
                html: htmlResult,
                subject: "Verify your account",
                text: "please verify your account"
            })

            return res.status(201).json({
                message: "User registered",
                data: newUser,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    loginUser: async (req, res) => {
        try {
            const { usernameOrEmail, password } = req.body

            const findUserByUsernameOrEmail = await User.findOne({
                where: {
                    [Op.or]: {
                        username: usernameOrEmail,
                        email: usernameOrEmail,
                    },
                },
            })

            if (!findUserByUsernameOrEmail) {
                return res.status(400).json({
                    message: "User or email not found"
                })
            }

            const passwordValid = bcrypt.compareSync(
                password, findUserByUsernameOrEmail.password
            )

            if (!passwordValid) {
                return res.status(400).json({
                    message: "password invalid"
                })
            }

            delete findUserByUsernameOrEmail.dataValues.password

            const token = signToken({
                id: findUserByUsernameOrEmail.id,
            })

            return res.status(201).json({
                message: "Login user",
                data: findUserByUsernameOrEmail,
                token: token,
            })

        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    refreshToken: async (req, res) => {
        try {
            const findUserById = await User.findByPk(req.user.id)

            const renewedToken = signToken({
                id: req.user.id,
            })

            return res.status(200).json({
                message: "Renewed user token",
                data: findUserById,
                token: renewedToken,
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
            if (req.file) {
                req.body.profile_picture = `http://localhost:2000/public/${req.file.filename}`
            }

            const findUserByUsernameOrEmail = await User.findOne({
                where: {
                    [Op.or]: {
                        username: req.body.username || "",
                        email: req.body.email || ""
                    }
                }
            })

            if (findUserByUsernameOrEmail) {
                return res.status(400).json({
                    message: "username or email has been taken"
                })
            }

            await User.update({
                username: req.body.username,
                email: req.body.email,
                profile_picture: req.body.profile_picture
            },
                {
                    where: {
                        id: req.user.id,
                    },
                }
            )

            const findUserById = await User.findByPk(req.user.id)

            return res.status(200).json({
                message: "Edited user data",
                data: findUserById,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    getUserProfile: async (req, res) => {
        try {
            const { username } = req.query
            const findUserProfileByUsername = await User.findOne({
                where: {
                    username: username
                }
            })

            return res.status(200).json({
                message: "Get User Profile",
                data: findUserProfileByUsername,
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    verifyUser: async (req, res) => {
        try {
            const { verification_token } = req.query

            const validToken = validateVerificationToken(verification_token)

            if (!validToken) {
                return res.status(401).json({
                    message: "Token invalid"
                })
            }

            await User.update(
                { is_verified: true },
                {
                    where: {
                        id: validToken.id
                    }
                }
            )

            return res.redirect("http://localhost:3000/login")
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    },
    resendVerification: async (req, res) => {
        try {
            const findUserById = await User.findByPk(req.user.id)

            const verificationToken = createVerificationToken({
                id: findUserById.id,
            })

            const verificationLink = `http://localhost:2000/auth/verification?verification_token=${verificationToken}`

            const rawHTML = fs.readFileSync("templates/register_user.html", "utf-8")
            const compiledHTML = handlebars.compile(rawHTML)
            const htmlResult = compiledHTML({
                username: findUserById.username,
                verificationLink
            })

            await emailer({
                to: findUserById.email,
                html: htmlResult,
                subject: "Verify your account",
                text: "please verify your account"
            })

            return res.status(200).json({
                message: "Verification email sent"
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({
                message: "Server error",
            })
        }
    }
}

module.exports = {
    authController
}