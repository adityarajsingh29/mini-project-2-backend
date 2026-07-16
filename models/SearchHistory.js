import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

searchHistorySchema.index({ searchedAt: -1 });

export default mongoose.model("SearchHistory", searchHistorySchema);
