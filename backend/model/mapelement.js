const mongoose = require("mongoose")

const MapElement = new mongoose.Schema({
    mapId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Map",
        required: true,
    },
    elementId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Element", 
    },
    x:{
        type: Number,
        required: true,
    },
    y:{
        type: Number,
        required: true,
    },

},{
    timestamps: true,
})

module.exports = mongoose.model("MapElement", MapElement);