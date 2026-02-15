const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid")
function generate12DigitUID() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 900000 + 100000).toString();
    return parseInt(timestamp + random);
}

const RoomSchema = new mongoose.Schema({
    roomId: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    locked: { type: Boolean, default: false },
    color: { type: String, default: "#1a1a2e" }
}, { _id: false })

const ObstacleSchema = new mongoose.Schema({
    obstacleId: { type: String, default: uuidv4 },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
}, { _id: false })

const MapSchema = new mongoose.Schema({
    mapId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    mapUID: {
        type: Number,
        default: generate12DigitUID,
        unique: true
    },
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: {
        type: String,
        default: ""
    },
    rooms: {
        type: [RoomSchema],
        default: []
    },
    obstacles: {
        type: [ObstacleSchema],
        default: []
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model("Map", MapSchema);