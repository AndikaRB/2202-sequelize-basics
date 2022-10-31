const express = require("express")
const dotenv = require("dotenv")
const db = require("./models")
const { Op } = require("sequelize")
const usersRoute = require("./routes/usersRoute")
const expensesRoute = require("./routes/expensesRoute")
const authRoute = require("./routes/authRoute")
const postsRoute = require("./routes/postsRoute")
const commentsRoute = require("./routes/commentsRoute")
const transactionsRoute = require("./routes/transactionsRoute")
const { verifyToken } = require("./middlewares/authMiddleware")
const cors = require("cors")
const fs = require("fs")
const handlebars = require("handlebars")
const emailer = require("./lib/emailer")
// const axios = require("axios")
// const redis = require("redis")
// const client = redis.createClient(6379)

dotenv.config()

const PORT = 2000

const app = express()

app.use(cors())

app.use(express.json())

app.use("/users", usersRoute)

app.use("/expenses", verifyToken, expensesRoute)

app.use("/auth", authRoute)

app.use("/posts", postsRoute)

app.use("/comments", commentsRoute)

app.use("/transactions", verifyToken, transactionsRoute)

// app.get("/dogs/:breed", async (req, res) => {
//     try {
//         const { breed } = req.params

//         const cacheResult = await client.get(breed)

//         const response = await axios.get(
//             `https://dog.ceo/api/breed/${breed}/images`
//         )

//         if (cacheResult) {
//             return res.status(200).json({
//                 message: "Fetch dogs API",
//                 data: JSON.parse(cacheResult)
//             })
//         }

//         client.setEx(breed, 60, JSON.stringify(response.data))

//         return res.status(200).json({
//             message: "Fetch dogs API",
//             data: response.data
//         })
//     } catch (err) {
//         console.log(err)
//         return res.status(500).json({
//             message: "Server error",
//         })
//     }
// })
app.use("/public", express.static("public"))

app.post("/email", async (req, res) => {
    const rawHTML = fs.readFileSync("templates/register_user.html", "utf-8")
    const compiledHTML = handlebars.compile(rawHTML)
    const result = compiledHTML()

    await emailer({
        to: "andikaridho06@gmail.com",
        html: result,
        subject: "Test Email",
        text: "Halo dunia",
    })

    res.send("Email sent")
})

app.listen(PORT, async () => {
    db.sequelize.sync({ alter: true })

    if (!fs.existsSync("public")) {
        fs.mkdirSync("public")
    }

    // await client.connect()

    console.log("Listening in port", PORT)
})

