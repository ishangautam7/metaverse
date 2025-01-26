const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid");

const MapSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: ()=> uuidv4(),
    },
    width:{
        type: Number,
        required: true,
    },
    height:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
},{
    timestamps: true,
})

module.exports = mongoose.model("Map", MapSchema);