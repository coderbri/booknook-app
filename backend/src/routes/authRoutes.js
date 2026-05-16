/**
 * @file authRoutes.js
 * @description Authentication endpoints handling user registration, 
 * login routing, and JWT generation.
 */
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * Generates a JWT for user authentication.
 * @param {string} userId – The unique MongoDB ObjectID of the user.
 * @returns {string} Signed JWT string valid for 15 days.
 */
const generateToken = (userId) => {
    // using a unique identifier, the userId, users can have a token to access the app
    return jwt.sign({userId}, process.env.JWT_SECRET, { expiresIn: "15d" });
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user, generate an avatar, and return an auth token
 * @access  Public
 */
router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        // 1. Validation Checks
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: "Password should be at least 6 characters long" });
        }
        
        if (username.length < 3) {
            return res.status(400).json({ message: "Username should be at least 3 characters long" });
        }
        
        // 2. Availability Checks
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: "Email already exists" });
        
        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: "Username already taken" });
        
        // 3. User Creation
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        
        const user = new User({
            email,
            username,
            password,
            profileImage,
        });
        await user.save();
        
        // 4. Response Dispatch
        const token = generateToken(user._id);
        
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        });
        
    } catch (error) {
        console.log("Error in register route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post("/login", async (req, res) => {
    res.send("login");
});

export default router;