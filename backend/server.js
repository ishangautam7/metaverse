const express = require("express")
const cors = require("cors")
const socket = require("socket.io")
const api = require('./routes/api')
const path = require("path")

const app = express()
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use('/api', api)
app.get('/', (req, res) => {
    return res.status(200).json("Welcome to Metaverse API");
});


const staticPath = path.join(__dirname, '../frontend/out');
app.use(express.static(staticPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT
require('./db')

const server = app.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`)
    console.log(`Serving static files from: ${staticPath}`);

})

const io = socket(server, {
    cors:{
        origin: "*"
    }
})