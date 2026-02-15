const mongoose = require("mongoose");

const MapSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    width: {
        type: Number,
        required: true,
        default: 1280,
    },
    height: {
        type: Number,
        required: true,
        default: 720,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    mapUID: {
        type: Number,
        default: () => Math.floor(100000 + Math.random() * 900000),
    },
    rooms: [{
        roomId: { type: String, default: () => Math.random().toString(36).slice(2, 10) },
        name: { type: String, default: "Room" },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        w: { type: Number, default: 200 },
        h: { type: Number, default: 150 },
        locked: { type: Boolean, default: false },
        color: { type: String, default: "#1a1a2e" }
    }],
    decorations: [{
        decorationId: { type: String, default: () => Math.random().toString(36).slice(2, 10) },
        type: { type: String, default: "generic", enum: ["table", "plant", "bookshelf", "sofa", "desk", "divider", "lamp", "generic"] },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        w: { type: Number, default: 60 },
        h: { type: Number, default: 60 }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Map", MapSchema);