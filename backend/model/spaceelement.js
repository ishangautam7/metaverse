const mongoose = require("mongoose");

const SpaceElementSchema = new mongoose.Schema({
    spaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Space", // Reference to the Space model
        required: true,
    },
    elementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Element", // Reference to the Element model
        required: true,
    },
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("SpaceElement", SpaceElementSchema);
