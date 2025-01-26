const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid");

const ElementSchema = new mongoose.Schema({
    x:{
        type: Number,
        required: true,
    },
    y:{
        type: Number,
        required: true,
    },
    imageUrl:{
        type: String,
    },
    static:{
        type: Boolean, //whether or user can sit on this element
    },
    mapId:{
        type:  mongoose.Schema.Types.ObjectId,
        ref: "Map",
        required: true,
    }
},{
    timestamps: true,
})

module.exports = mongoose.model("Element", ElementSchema);