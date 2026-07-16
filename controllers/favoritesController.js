import Favorite from "../models/Favorite.js";

// GET /api/favorites
export const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find().sort({ createdAt: -1 });
    res.json({ success: true, data: favorites });
  } catch (error) {
    next(error);
  }
};

// POST /api/favorites  { username, avatar, profileUrl, name, bio }
export const addFavorite = async (req, res, next) => {
  try {
    const { username, avatar, profileUrl, name, bio } = req.body;
    if (!username || !username.trim()) {
      const err = new Error("Username is required");
      err.statusCode = 400;
      throw err;
    }

    const existing = await Favorite.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.json({ success: true, data: existing, message: "Already in favorites" });
    }

    const favorite = await Favorite.create({
      username: username.toLowerCase(),
      avatar,
      profileUrl,
      name,
      bio,
    });
    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/favorites/:username
export const removeFavorite = async (req, res, next) => {
  try {
    const { username } = req.params;
    const deleted = await Favorite.findOneAndDelete({ username: username.toLowerCase() });
    if (!deleted) {
      const err = new Error("Favorite not found");
      err.statusCode = 404;
      throw err;
    }
    res.json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
};
