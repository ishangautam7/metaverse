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

    const px = player.position.x + 20
    const py = player.position.y + 20

    for (const room of rooms) {
        if (px >= room.x && px <= room.x + room.w &&
            py >= room.y && py <= room.y + room.h) {
            return room.roomId || room.name
        }
    }
    return null
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

        socket.emit('playersUpdate', players[mapUID])
        socket.to(mapUID).emit('playersUpdate', players[mapUID])

        // Send current room states
        const rooms = mapRooms[mapUID] || []
        socket.emit('roomsUpdate', rooms)
    })

    // Owner or anyone sets room layout
    socket.on('setRooms', ({ mapUID, rooms }) => {
        mapRooms[mapUID] = rooms || []
        io.to(mapUID).emit('roomsUpdate', mapRooms[mapUID])
    })

    // Any user inside a room can toggle its lock
    socket.on('lockRoom', ({ mapUID, roomId, locked }) => {
        const rooms = mapRooms[mapUID] || []
        const senderRoom = getPlayerRoom(mapUID, socket.id, rooms)

        // Only allow if sender is inside the room they're trying to lock
        if (senderRoom === roomId) {
            const room = rooms.find(r => (r.roomId || r.name) === roomId)
            if (room) {
                room.locked = locked
                mapRooms[mapUID] = rooms
                io.to(mapUID).emit('roomsUpdate', rooms)
                io.to(mapUID).emit('roomLocked', { roomId, locked, lockedBy: players[mapUID]?.[socket.id]?.username })
            }
        }
    })

    socket.on('move', ({ mapUID, position }) => {
        if (players[mapUID]?.[socket.id]) {
            players[mapUID][socket.id].position = position

            const rooms = mapRooms[mapUID] || []
            const currentRoom = getPlayerRoom(mapUID, socket.id, rooms)
            players[mapUID][socket.id].currentRoom = currentRoom

            // Build filtered player list: hide players in locked rooms from outsiders
            const allPlayers = players[mapUID]
            const filteredForBroadcast = {}

            for (const [pid, player] of Object.entries(allPlayers)) {
                const pRoom = player.currentRoom
                if (pRoom) {
                    const room = rooms.find(r => (r.roomId || r.name) === pRoom)
                    if (room?.locked) {
                        // Only send to players in the same room
                        continue
                    }
                }
                filteredForBroadcast[pid] = player
            }

            // Send full data to players in locked rooms, filtered to others
            for (const [pid] of Object.entries(allPlayers)) {
                const pRoom = allPlayers[pid]?.currentRoom
                if (pRoom) {
                    const room = rooms.find(r => (r.roomId || r.name) === pRoom)
                    if (room?.locked) {
                        // This player is in a locked room — send them only players in same room + themselves
                        const lockedRoomPlayers = {}
                        for (const [id, p] of Object.entries(allPlayers)) {
                            if (p.currentRoom === pRoom) {
                                lockedRoomPlayers[id] = p
                            }
                        }
                        io.to(pid).emit('playersUpdate', lockedRoomPlayers)
                        continue
                    }
                }
                io.to(pid).emit('playersUpdate', filteredForBroadcast)
            }
        }
    })

    socket.on('chat', ({ mapUID, message }) => {
        const user = players[mapUID]?.[socket.id]
        if (!user) return

        const senderRoom = user.currentRoom

        const allPlayers = players[mapUID] || {}
        const chatMsg = { username: user.username, message }

        for (const [pid, player] of Object.entries(allPlayers)) {
            if (player.currentRoom === senderRoom) {
                io.to(pid).emit('chatMsg', chatMsg)
            }
        }
    })

    // WebRTC signaling - allow if same room or both in open area
    socket.on('webrtc-offer', ({ to, offer, mapUID }) => {
        const sender = players[mapUID]?.[socket.id]
        const receiver = players[mapUID]?.[to]

        if (sender && receiver) {
            // Allow if both in same named room or both in open area (null === null)
            if (sender.currentRoom === receiver.currentRoom) {
                socket.to(to).emit('webrtc-offer', { from: socket.id, offer })
            }
        }
    })

    socket.on('webrtc-answer', ({ to, answer, mapUID }) => {
        const sender = players[mapUID]?.[socket.id]
        const receiver = players[mapUID]?.[to]

        if (sender && receiver) {
            if (sender.currentRoom === receiver.currentRoom) {
                socket.to(to).emit('webrtc-answer', { from: socket.id, answer })
            }
        }
    })

    socket.on('webrtc-ice', ({ to, candidate, mapUID }) => {
        const sender = players[mapUID]?.[socket.id]
        const receiver = players[mapUID]?.[to]

        if (sender && receiver) {
            if (sender.currentRoom === receiver.currentRoom) {
                socket.to(to).emit('webrtc-ice', { from: socket.id, candidate })
            }
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