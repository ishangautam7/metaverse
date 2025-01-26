const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid");

const SpaceElement = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: () => uuidv4(),
    },
    elementId:{
        type: String,
        required: true,
    },
    spaceId:{
        type: String,
        required: true,
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

module.exports = mongoose.model("SpaceElement", SpaceElement);