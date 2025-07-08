const express = require("express")
const cors = require("cors")
const socket = require("socket.io")
const api = require('./routes/api')
const http = require('http')

const app = express()
require('dotenv').config()

app.disable('x-powered-by')

app.use(cors({
    origin: '*',
    methods: ["GET", "POST"]
}));
app.use(express.json());
app.use('/api', api)
app.get('/', (req, res) => {
    return res.status(200).json("Welcome to Metaverse API");
});

const PORT = process.env.PORT || 4000
require('./db')

const server = http.createServer(app)

const io = socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const players = {}

io.on('connection', (socket) => {
    socket.on('join', ({ mapUID, user }) => {
        if (!players[mapUID]) {
            players[mapUID] = {}
        }

        players[mapUID][socket.id] = {
            ...user, 
            position: { x: 300, y: 300 }
        }

        socket.join(mapUID)
        
        // Send current players to the new user
        socket.emit('playersUpdate', players[mapUID])
        
        // Notify others about the new player
        socket.to(mapUID).emit('playersUpdate', players[mapUID])
    })

    socket.on('move', ({ mapUID, position }) => {
        if (players[mapUID]?.[socket.id]) {
            players[mapUID][socket.id].position = position
            io.to(mapUID).emit('playersUpdate', players[mapUID])
        }
    })

    socket.on('chat', ({ mapUID, message }) => {
        const user = players[mapUID]?.[socket.id]
        if (user) {
            io.to(mapUID).emit('chatMsg', { username: user.username, message })
        }
    })

    // WebRTC signaling
    socket.on('webrtc-offer', ({ to, offer }) => {
        socket.to(to).emit('webrtc-offer', { from: socket.id, offer })
    })
    
    socket.on('webrtc-answer', ({ to, answer }) => {
        socket.to(to).emit('webrtc-answer', { from: socket.id, answer })
    })

    socket.on('webrtc-ice', ({ to, candidate }) => {
        socket.to(to).emit('webrtc-ice', { from: socket.id, candidate })
    })

    socket.on('disconnect', () => {
        for (const mapUID in players) {
            if (players[mapUID][socket.id]) {
                delete players[mapUID][socket.id]
                io.to(mapUID).emit('playersUpdate', players[mapUID])
                io.to(mapUID).emit('playersLeft', socket.id)
            }
        }
    })
})

server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server is running at localhost:${PORT}`) 
})