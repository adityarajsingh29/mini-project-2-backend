import express from "express";
import { getGithubProfile, getGithubRepos } from "../controllers/githubController.js";

const router = express.Router();

router.get("/:username", getGithubProfile);
router.get("/:username/repos", getGithubRepos);

export default router;
