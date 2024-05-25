const mong = require("mongoose");

const todoSchema = new mong.Schema({
    text: {
        type: String,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    creatorId: {
        type: mong.Schema.Types.ObjectId,
        ref: "User",
    },
},
{
    timestamps: true,
});

module.exports = mong.model("Todo", todoSchema);