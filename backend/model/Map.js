const mongoose = require("mongoose")
const { v4:uuidv4}  = require("uuid")
function generate12DigitUID() {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.floor(Math.random() * 900000 + 100000).toString(); // 6-digit random
    return parseInt(timestamp + random); // Combine to 12 digits
  }

const MapSchema = new mongoose.Schema({
    mapId:{
        type: String,
        default: uuidv4,
        unique: true
    },
    mapUID:{
        type: Number,
        default: generate12DigitUID,
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