const express = require("express")
const cors = require("cors")
const socket = require("socket.io")
const api = require('./routes/api')

const app = express()
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use('/api', api)
app.get('/', (req, res) => {
    return res.status(200).json("Welcome to Metaverse API");
});

const PORT = process.env.PORT
require('./db')

const server = app.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
})

const io = socket(server, {
    cors:{
        origin: "*"
    }
})