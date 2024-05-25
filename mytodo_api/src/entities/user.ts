const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    githubId: {
        type: String,
        unique: true,
    },
    todos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Todo",
        },
    ],
},
{
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);