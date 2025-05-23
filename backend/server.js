const express = require("express")
const cors = require("cors")
const socket = require("socket.io")
const api = require('./routes/api')
const http = require('http')
const ChatMessage = require('./model/chat')
const app = express()
require('dotenv').config()

app.use(cors({
    origin: '*',
    methods: ["GET", "POST"]
}));
app.use(express.json());
app.use('/api', api)
app.get('/', (req, res) => {
    return res.status(200).json("Welcome to Metaverse API");
});

const PORT = process.env.PORT
require('./db')

const server = http.createServer(app)

const io = socket(server, {
    cors: {
        origin: "*"
    }
})

const players = {}

io.on('connection', (socket) => {
    socket.on('join', ({ mapUID, user }) => {
        if (!players[mapUID]) {
            players[mapUID] = {}
        }

        players[mapUID][socket.id] = {
            ...user, position: { x: 100, y: 100 }
        }

        socket.join(mapUID)
        io.to(mapUID).emit('playersUpdate', players[mapUID])
    })

    socket.on('move', ({ mapUID, position }) => {
        if (players[mapUID]?.[socket.id]) {
            players[mapUID][socket.id].position = position
            io.to(mapUID).emit('playersUpdate', players[mapUID])
        }
    })

    socket.on('chat', async ({ mapUID, message, timestamp }) => {
        const user = players[mapUID]?.[socket.id];
        if (user) {
            const chatMsg = {
                username: user.username,
                message,
                timestamp
            };

            await ChatMessage.create({
                mapUID,
                ...chatMsg
            });

            io.to(mapUID).emit('chatMsg', chatMsg);
        }
    });

    socket.on('getChatHistory', async ({ mapUID }) => {
        try {
            const history = await ChatMessage.find({ mapUID })
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            socket.emit('chatHistory', history.reverse());
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    });

    // socket.on('webrtc-offer', ({to, offer})=>{
    //     for (const id in players[mapUID]){
    //         if(id !== socket.id){
    //             io.to(id).emit('webrtc-offer', {from: socket.id, offer})
    //         }
    //     }
    // })

    // socket.on('webrtc-answer', ({ to, answer }) => {
    //     io.to(to).emit('webrtc-answer', { from: socket.id, answer });
    // });

    // socket.on('webrtc-ice', ({ to, candidate }) => {
    //     io.to(to).emit('webrtc-ice', { from: socket.id, candidate });
    // });

    // In your socket.io server code
    socket.on('webrtc-offer', ({ mapUID, to, offer }) => {
        io.to(to).emit('webrtc-offer', { from: socket.id, offer, mapUID });
    });

    socket.on('webrtc-answer', ({ mapUID, to, answer }) => {
        io.to(to).emit('webrtc-answer', { from: socket.id, answer, mapUID });
    });

    socket.on('webrtc-ice', ({ mapUID, to, candidate }) => {
        io.to(to).emit('webrtc-ice', { from: socket.id, candidate, mapUID });
    });

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

server.listen(PORT, '0.0.0.0', () => { console.log(`Server is running at localhost:/${PORT}`) })