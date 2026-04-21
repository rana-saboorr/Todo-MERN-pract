const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },

  content: String,

  type: {
    type: String,
    enum: ["todo", "grocery", "reminder"],
    default: "todo"
  },

  isCompleted: {
    type: Boolean,
    default: false
  },

  remindAt: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("todo", todoSchema);