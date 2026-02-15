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

// Helper: determine which room a player is in based on position
function getPlayerRoom(mapUID, playerId, rooms) {
    const player = players[mapUID]?.[playerId]
    if (!player || !player.position) return null

    const px = player.position.x + 20 // center of 40px avatar
    const py = player.position.y + 20

    for (const room of rooms) {
        if (px >= room.x && px <= room.x + room.w &&
            py >= room.y && py <= room.y + room.h) {
            return room.roomId
        }
    }
    return null // not in any room
}

// Store rooms per map for quick lookup
const mapRooms = {}

io.on('connection', (socket) => {
    socket.on('join', ({ mapUID, user }) => {
        if (!players[mapUID]) {
            players[mapUID] = {}
        }

        players[mapUID][socket.id] = {
            ...user,
            position: { x: 300, y: 300 },
            currentRoom: null,
            avatar: user.avatar || "preset_1"
        }

        socket.join(mapUID)

        // Send current players to the new user
        socket.emit('playersUpdate', players[mapUID])

        // Notify others about the new player
        socket.to(mapUID).emit('playersUpdate', players[mapUID])
    })

    // Owner sends room layout so server can track rooms
    socket.on('setRooms', ({ mapUID, rooms }) => {
        mapRooms[mapUID] = rooms || []
    })

    socket.on('move', ({ mapUID, position }) => {
        if (players[mapUID]?.[socket.id]) {
            players[mapUID][socket.id].position = position

            // Update current room
            const rooms = mapRooms[mapUID] || []
            const currentRoom = getPlayerRoom(mapUID, socket.id, rooms)
            players[mapUID][socket.id].currentRoom = currentRoom

            io.to(mapUID).emit('playersUpdate', players[mapUID])
        }
    })

    socket.on('chat', ({ mapUID, message }) => {
        const user = players[mapUID]?.[socket.id]
        if (!user) return

        const senderRoom = user.currentRoom

        // Broadcast chat only to players in the same room (or all if no rooms)
        const allPlayers = players[mapUID] || {}
        const chatMsg = { username: user.username, message }

        for (const [pid, player] of Object.entries(allPlayers)) {
            if (player.currentRoom === senderRoom) {
                io.to(pid).emit('chatMsg', chatMsg)
            }
        }
    })

    // WebRTC signaling - only allow if same room
    socket.on('webrtc-offer', ({ to, offer, mapUID }) => {
        const sender = players[mapUID]?.[socket.id]
        const receiver = players[mapUID]?.[to]

        if (sender && receiver && sender.currentRoom === receiver.currentRoom) {
            socket.to(to).emit('webrtc-offer', { from: socket.id, offer })
        }
    })

    socket.on('webrtc-answer', ({ to, answer, mapUID }) => {
        const sender = players[mapUID]?.[socket.id]
        const receiver = players[mapUID]?.[to]

        if (sender && receiver && sender.currentRoom === receiver.currentRoom) {
            socket.to(to).emit('webrtc-answer', { from: socket.id, answer })
        }
    })

    socket.on('webrtc-ice', ({ to, candidate, mapUID }) => {
        const sender = players[mapUID]?.[socket.id]
        const receiver = players[mapUID]?.[to]

        if (sender && receiver && sender.currentRoom === receiver.currentRoom) {
            socket.to(to).emit('webrtc-ice', { from: socket.id, candidate })
        }
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