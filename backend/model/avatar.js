const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid");

const ElementSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        default: ()=> uuidv4(),
    },
    name:{
        type: String,
    },

    imageUrl:{
        type: String,
    },
},{
    timestamps: true,
})

module.exports = mongoose.model("Element", ElementSchema);