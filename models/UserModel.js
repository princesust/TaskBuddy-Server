var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    avatar: { type: String, required: false },
    activeStatus: { type: Boolean, required: true, default: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
