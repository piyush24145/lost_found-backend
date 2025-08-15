const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["found", "lost"], required: true },
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true }, 
    images: [{ type: String }], 
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }, 
    matchReason: { type: String }, 
    isResolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Item", itemSchema);
