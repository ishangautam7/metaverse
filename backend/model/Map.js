const mongoose = require("mongoose")

const MapSchema = new mongoose.Schema({
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
    }
},{
    timestamps: true,
})

module.exports = mongoose.model("Map", MapSchema);