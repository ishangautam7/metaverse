const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid");

const SpaceSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: ()=> uuidv4(),
    },
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
},{
    timestamps: true,
})

module.exports = mongoose.model("Space", SpaceSchema);