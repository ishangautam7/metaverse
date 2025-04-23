const mongoose = require("mongoose")
const { v4:uuidv4}  = require("uuid")

const MapSchema = new mongoose.Schema({
    mapId:{
        type: String,
        default: uuidv4,
        unique: true
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
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image:{
        type: String,
        default: "C:\Users\isang\Desktop\metaverse\frontend\src\assests\menu.svg"
    }
},{
    timestamps: true,
})

module.exports = mongoose.model("Map", MapSchema);