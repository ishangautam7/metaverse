const express = require("express")
const cors = require("cors")
const socket = require("socket.io")
const api = require('./routes/api')
const path = require("path")
const next = require("next") 

const app = express()
require('dotenv').config()

const dev = process.env.NODE_ENV !== "production"
const appNext = next({ dev, dir: path.join(__dirname, "../frontend") }) 
const handle = appNext.getRequestHandler()

app.use(cors())
app.use(express.json())
app.use('/api', api)

app.get('/', (req, res) => {
    return res.status(200).json("Welcome to Metaverse API")
})

appNext.prepare().then(() => {
    app.all("*", (req, res) => {
        return handle(req, res)
    })

    app.use(express.static(path.join(__dirname, '../frontend/build')))
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
    })

    const PORT = process.env.PORT
    require('./db')

    const server = app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`)
    })

    const io = socket(server, {
        cors: {
            origin: "*"
        }
    })
})
