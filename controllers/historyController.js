import SearchHistory from "../models/SearchHistory.js";

// GET /api/history
export const getHistory = async (req, res, next) => {
  try {
    const history = await SearchHistory.find().sort({ searchedAt: -1 }).limit(50);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

// POST /api/history  { username }
export const addHistory = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username || !username.trim()) {
      const err = new Error("Username is required");
      err.statusCode = 400;
      throw err;
    }
    const entry = await SearchHistory.create({ username: username.toLowerCase() });
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/history/:id
export const deleteHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await SearchHistory.findByIdAndDelete(id);
    if (!deleted) {
      const err = new Error("History entry not found");
      err.statusCode = 404;
      throw err;
    }
    res.json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
};
