import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  avatar: { type: String },
  profileUrl: { type: String },
  name: { type: String },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Favorite", favoriteSchema);
