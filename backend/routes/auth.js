import express from "express";
import { login, getCurrentUser } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

//  login endpoint
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);

export default router;
