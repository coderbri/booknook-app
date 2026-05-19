/**
 * @file auth.middleware.js
 * @description Middleware to protect routes by verifying 
 * JWTs provided in the Authorization header
*/
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Validates the Bearer token and attaches the user document to the request object.
 * @param {Object} req – Express request object.
 * @param {Object} req – Express response object.
 * @param {Function} next – Express next middleware function.
*/
const protectRoute = async(req, res, next) => {
    try {
        // 1. Extract Token
        const token = req.header("Authorization").replace("Bearer ", "");
        if (!token) return res.status(401).json({ message: "No authentication token, access denied" });
        
        // 2. Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Authenticate Uesr
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(401).json({ message: "Token is not valid" });
        
        // Attach user to req for use in subsequent route handlers
        req.user = user;
        next();
        
    } catch (error) {
        console.error("Authentication error:", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

export default protectRoute;