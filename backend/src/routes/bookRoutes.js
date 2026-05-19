/**
 * @file bookRoutes.js
 * @description Routes for book operations, 
 * including creation and image handling
*/
import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/books
 * @desc    Create a new book entry with an image upload
 * @access  Private
*/
router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        
        // 1. Validation
        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide all fields" });
        }
        
        // 2. Cloudinary Upload
        // Uploads the base64 or file path image to Cloudinary storage
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;
        
        // 3. Database Persistence
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id, // User ID provided by protectRoute middleware
        });
        
        await newBook.save();
        
        // 4. Response Dispatch
        res.status(201).json(newBook);
        
    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({ message: error.message });
    }
});

// Future Implementations: READ, UPDATE, DELETE

export default router;