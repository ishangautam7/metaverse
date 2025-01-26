const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid");

const MapElement = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: ()=> uuidv4(),
    },
    mapId:{
        type: String,
        required: true,
    },
    elementId:{
        type: String,
    },
    x:{
        type: Number,
    },
    y:{
        type: Number,
    },

},{
    timestamps: true,
})

module.exports = mongoose.model("MapElement", MapElement);