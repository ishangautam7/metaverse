const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4, 
        maxlength: 20,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 50,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 64,
    },
    avatarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Avatar"
    },
    role:{
        type: String,
        enum: ["Admin", "User"],
        default: "User"
    }
}, {
    timestamps: true, 
});

module.exports = mongoose.model("User", UserSchema);