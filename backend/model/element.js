const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid");

const ElementSchema = new mongoose.Schema({
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
    imageUrl:{
        type: String,
    },
},{
    timestamps: true,
})

module.exports = mongoose.model("Element", ElementSchema);