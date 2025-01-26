const mongoose = require("mongoose")

const SpaceSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    width:{
        type: Number,
        required: true,
    },
    height:{
        type: Number,
        required: true,
    },
    mapId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Map",
        required: true
    }
},{
    timestamps: true,
})

module.exports = mongoose.model("Space", SpaceSchema);