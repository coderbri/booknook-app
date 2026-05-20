/**
 * @file bookRoutes.js
 * @description Routes for book operations, inluding creation 
 * with image handling, and paginated retrieval.
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

/**
 * @route   GET /api/books
 * @desc    Retrieve a paginated list of all books with creator details.
 * @access  Private
*/
// const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");
// pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
    try {
        // 1. Pagination Setup
        // Convert strings from query params to numbers; default to page 1, limit 5
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page -1) * limit;
        
        // 2. Query Execution
        // Sort by 'createdAt' descending (-1) to show newest books first
        const books = await Book.find()
            .sort({ createdAt: -1 }) // desc
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");
        
        // 3. Metadata Calculation 
        const totalBooks = await Book.countDocuments();
        
        // 4. Response Dispatch
        res.send({
            books,
            currentPage: page,
            totalBooks: totalBooks,
            totalPages: Math.ciel(totalBooks / limit),
        });
        
    } catch (error) {
        console.log("Error in get all books route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Future Implementations: READ, UPDATE, DELETE

export default router;