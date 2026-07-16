import express from "express";
import { getHistory, addHistory, deleteHistory } from "../controllers/historyController.js";

const router = express.Router();

router.get("/", getHistory);
router.post("/", addHistory);
router.delete("/:id", deleteHistory);

export default router;
